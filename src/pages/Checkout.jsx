import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '@/context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { items, totalAmount, totalQuantity } = useSelector(state => state.cart);
  const toast = useToast();
  const navigate = useNavigate();

  // Address state
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    instructions: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

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
    return address.line1 && address.city && address.state && address.postalCode;
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'COD') return true;
    if (paymentMethod === 'UPI') return /.+@.+/.test(upiId);
    if (paymentMethod === 'CARD') {
      return card.number.length >= 12 && card.name && /\d{2}\/\d{2}/.test(card.expiry) && card.cvv.length >= 3;
    }
    return false;
  };

  const canPlaceOrder = items.length > 0 && isAddressValid() && isPaymentValid();

  const placeOrder = async () => {
    if (!canPlaceOrder) return;
    // Placeholder: integrate with backend order creation
    toast.show('Order placed successfully!', 'success');
    navigate('/');
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
                placeholder="Address line 1"
                value={address.line1}
                onChange={(e) => setAddress(a => ({ ...a, line1: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Address line 2 (optional)"
                value={address.line2}
                onChange={(e) => setAddress(a => ({ ...a, line2: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Postal code"
                value={address.postalCode}
                onChange={(e) => setAddress(a => ({ ...a, postalCode: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Delivery instructions (optional)"
                value={address.instructions}
                onChange={(e) => setAddress(a => ({ ...a, instructions: e.target.value }))}
              />
            </div>
            {!isAddressValid() && (
              <div className="text-sm text-red-600 mt-2">Please fill address line 1, city, state, and postal code.</div>
            )}
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Map preview</div>
              <div className="w-full h-64 rounded-lg overflow-hidden border">
                <iframe
                  title="Map Preview"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
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
              disabled={!canPlaceOrder}
              onClick={placeOrder}
              className={`w-full px-6 py-3 rounded-md text-white ${canPlaceOrder ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Place Order
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