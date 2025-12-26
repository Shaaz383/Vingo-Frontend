import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@/context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import MapPicker from '@/components/MapPicker';
import { placeOrder as placeOrderApi } from '@/services/orderApi';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/paymentApi';
import { clearCart } from '@/redux/cartSlice';
import { toast as hotToast } from 'react-hot-toast';

const Checkout = () => {
  const { items, totalAmount, totalQuantity } = useSelector(state => state.cart);
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Address state
  const [address, setAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    mobileNumber: '',
    instructions: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [location, setLocation] = useState(null); // { lat, lng }
  const [isManualAddressUpdate, setIsManualAddressUpdate] = useState(false);
  
  // Update location when address changes
  const handleLocationChange = async (newLocation) => {
    const { lat, lng, source } = newLocation;
    setLocation({ lat, lng });

    // If source is 'search', it means the update came from MapPicker forward geocoding the address we passed it.
    // In that case, we don't want to reverse geocode and overwrite the address.
    if (source !== 'search') {
      setIsManualAddressUpdate(false);
      try {
        const result = await reverseGeocodeGeoapify(lat, lng);
        if (result) {
          setAddress(prev => ({
            ...prev,
            city: result.city || prev.city,
            state: result.state || prev.state,
            postalCode: result.pincode || prev.postalCode,
            line1: result.address || prev.line1,
          }));
        }
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }
    }
  };

  const updateAddressField = (field, value) => {
    setIsManualAddressUpdate(true);
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const deliveryFee = 40;
  const taxAmount = useMemo(() => Math.round(totalAmount * 0.05), [totalAmount]);
  const grandTotal = useMemo(() => totalAmount + deliveryFee + taxAmount, [totalAmount, deliveryFee, taxAmount]);

  const fullAddress = useMemo(() => {
    const parts = [address.line1, address.line2, address.city, address.state, address.postalCode]
      .filter(Boolean);
    return parts.join(', ');
  }, [address]);

  const mapQuery = fullAddress || 'India';

  const isAddressValid = () => {
    return address.name && address.line1 && address.city && address.state && address.postalCode && address.mobileNumber;
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'COD') return true;
    if (paymentMethod === 'RAZORPAY') return true;
    if (paymentMethod === 'RAZORPAY_UPI') return true;
    if (paymentMethod === 'UPI') return /.+@.+/.test(upiId);
    if (paymentMethod === 'CARD') {
      return card.number.length >= 12 && card.name && /\d{2}\/\d{2}/.test(card.expiry) && card.cvv.length >= 3;
    }
    return false;
  };

  const canPlaceOrder = items.length > 0 && isAddressValid() && isPaymentValid() && !!location;

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });

  const placeOrder = async () => {
    if (!canPlaceOrder) return;
    
    try {
      setIsLoading(true);
      
      const orderData = {
        items: items.map(item => ({
          itemId: item.id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          name: address.name,
          addressLine: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.postalCode,
          mobileNumber: address.mobileNumber,
          coordinates: location
        },
        payment: {
          method: paymentMethod
        }
      };
      if (paymentMethod === 'RAZORPAY' || paymentMethod === 'RAZORPAY_UPI') {
        await loadRazorpay();
        const rpInit = await createRazorpayOrder(orderData.items);
        if (!rpInit.success) {
          hotToast.error(rpInit.message || 'Failed to initialize payment');
          return;
        }
        const options = {
          key: rpInit.keyId,
          amount: rpInit.amount,
          currency: rpInit.currency,
          name: 'Vingo',
          description: 'Order Payment',
          order_id: rpInit.orderId,
          prefill: {
            name: address.name,
            email: '',
            contact: address.mobileNumber || ''
          },
          theme: { color: '#ef4444' },
          method: paymentMethod === 'RAZORPAY_UPI' ? { upi: true, netbanking: false, card: false, wallet: false, emi: false } : undefined,
          config: paymentMethod === 'RAZORPAY_UPI' ? { upi: { flow: 'intent' } } : undefined,
          handler: async function (response) {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData
              });
              if (verifyRes.success) {
                toast.show('Payment successful. Order created!', 'success');
                dispatch(clearCart());
                navigate('/order-placed', {
                  state: {
                    orderId: verifyRes.order?._id || 'N/A',
                    totalAmount: verifyRes.order?.totalAmount || 0
                  }
                });
              } else {
                hotToast.error(verifyRes.message || 'Payment verification failed');
              }
            } catch (err) {
              hotToast.error(err?.message || 'Payment verification error');
            }
          },
          modal: {
            ondismiss: function () {
              hotToast('Payment cancelled');
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const response = await placeOrderApi(orderData);
        if (response.success) {
          toast.show('Order placed successfully!', 'success');
          dispatch(clearCart());
          navigate('/order-placed', { 
            state: { 
              orderId: response.order?._id || 'N/A',
              totalAmount: response.order?.totalAmount || 0
            } 
          });
        } else {
          toast.show(response.message || 'Failed to place order', 'error');
        }
      }
    } catch (error) {
        console.error('Error placing order:', error);
        toast.show('Failed to place order. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
        <Link to="/cart" className="text-red-600 hover:underline">Back to Cart</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: address and payment */}
        <div className="md:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Full Name"
                value={address.name}
                onChange={(e) => updateAddressField('name', e.target.value)}
              />

              <input
                className="border rounded-md px-3 py-2"
                placeholder="Address line 1"
                value={address.line1}
                onChange={(e) => updateAddressField('line1', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Address line 2 (optional)"
                value={address.line2}
                onChange={(e) => updateAddressField('line2', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="City"
                value={address.city}
                onChange={(e) => updateAddressField('city', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="State"
                value={address.state}
                onChange={(e) => updateAddressField('state', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Mobile Number"
                value={address.mobileNumber}
                onChange={(e) => updateAddressField('mobileNumber', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Postal code"
                value={address.postalCode}
                onChange={(e) => updateAddressField('postalCode', e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Delivery instructions (optional)"
                value={address.instructions}
                onChange={(e) => updateAddressField('instructions', e.target.value)}
              />
            </div>
            {!isAddressValid() && (
              <div className="text-sm text-red-600 mt-2">Please fill address line 1, city, state, postal code, and mobile number.</div>
            )}
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Drag the marker to confirm exact location</div>
              <MapPicker 
                value={location} 
                onChange={handleLocationChange} 
                height={256} 
                address={fullAddress}
              />
              <div className="flex justify-between text-sm text-gray-700 mt-2">
                {location ? (
                  <span>Selected: lat {location.lat.toFixed(5)}, lng {location.lng.toFixed(5)}</span>
                ) : (
                  <span>No location selected yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <span>Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <span>UPI</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                />
                <span>Razorpay (Recommended)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY_UPI"
                  checked={paymentMethod === 'RAZORPAY_UPI'}
                  onChange={() => setPaymentMethod('RAZORPAY_UPI')}
                />
                <span>Razorpay UPI</span>
              </label>
              {paymentMethod === 'UPI' && (
                <div className="ml-6">
                  <input
                    className="border rounded-md px-3 py-2 w-full sm:w-80"
                    placeholder="Enter UPI ID (e.g., user@bank)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                />
                <span>Credit/Debit Card</span>
              </label>
              {paymentMethod === 'CARD' && (
                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="border rounded-md px-3 py-2"
                    placeholder="Card number"
                    value={card.number}
                    onChange={(e) => setCard(c => ({ ...c, number: e.target.value }))}
                  />
                  <input
                    className="border rounded-md px-3 py-2"
                    placeholder="Name on card"
                    value={card.name}
                    onChange={(e) => setCard(c => ({ ...c, name: e.target.value }))}
                  />
                  <input
                    className="border rounded-md px-3 py-2"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard(c => ({ ...c, expiry: e.target.value }))}
                  />
                  <input
                    className="border rounded-md px-3 py-2"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) => setCard(c => ({ ...c, cvv: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: order summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({totalQuantity})</span>
                <span className="font-semibold">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">₹{taxAmount}</span>
              </div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">₹{grandTotal}</span>
            </div>
            <button
              disabled={!canPlaceOrder || isLoading}
              onClick={placeOrder}
              className={`w-full px-6 py-3 rounded-md text-white ${canPlaceOrder && !isLoading ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
            {!canPlaceOrder && (
              <div className="text-xs text-gray-600 mt-2">Fill address and payment details to proceed.</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-md font-semibold mb-2">Items in Cart</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">x{item.quantity}</div>
                  </div>
                  <div className="font-semibold">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;