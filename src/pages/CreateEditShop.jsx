import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUtensils, FaCamera } from 'react-icons/fa';
import useIndianLocationsApi from '@/hooks/useIndianLocationsApi';

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector(state => state.owner);

  // Check if owner already has a shop
  const isEdit = myShopData && Object.keys(myShopData).length > 0;

  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: myShopData?.name || '',
    address: myShopData?.address || '',
    city: myShopData?.city || '',
    state: myShopData?.state || '',
    pincode: myShopData?.pincode || '',
    image: myShopData?.image || null,
  });
  const [imageFile, setImageFile] = useState(null);

  const { states, cities, loadingStates, loadingCities, error, loadCities, detectFromCurrentLocation } = useIndianLocationsApi();
  const [detectedLocation, setDetectedLocation] = useState({ state: '', city: '' });

  const normalize = (s) => (s || '').toString().trim().toLowerCase();
  const findBestMatch = (target, options) => {
    if (!target) return '';
    const t = normalize(target);
    // exact match
    const exact = options.find(o => normalize(o) === t);
    if (exact) return exact;
    // startsWith / includes
    const starts = options.find(o => normalize(o).startsWith(t) || t.startsWith(normalize(o)));
    if (starts) return starts;
    const incl = options.find(o => normalize(o).includes(t) || t.includes(normalize(o)));
    if (incl) return incl;
    return '';
  };

  // Auto-detect and fill on mount
  useEffect(() => {
    (async () => {
      try {
        const detected = await detectFromCurrentLocation();
        const nextState = detected.state || '';
        setDetectedLocation({ state: detected.state || '', city: detected.city || '' });
        setFormData(prev => ({
          ...prev,
          state: nextState,
          city: detected.city || '',
          pincode: detected.pincode || prev.pincode,
          address: detected.address || prev.address,
        }));
        if (nextState) {
          await loadCities(nextState);
        }
      } catch (_) {
        // ignore if user denies or fails; manual selection remains
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cities whenever state changes
  useEffect(() => {
    if (formData.state) {
      loadCities(formData.state);
    } else {
      // ensure city is cleared if no state
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state, loadCities]);

  // When states list loads, align detected state to available options
  useEffect(() => {
    if (states.length && detectedLocation.state) {
      const matchedState = findBestMatch(detectedLocation.state, states);
      if (matchedState && matchedState !== formData.state) {
        setFormData(prev => ({ ...prev, state: matchedState, city: '' }));
        loadCities(matchedState);
      }
    }
  }, [states, detectedLocation.state, loadCities]);

  // When cities list loads, align detected city to available options
  useEffect(() => {
    if (cities.length && detectedLocation.city) {
      const matchedCity = findBestMatch(detectedLocation.city, cities);
      if (matchedCity && matchedCity !== formData.city) {
        setFormData(prev => ({ ...prev, city: matchedCity }));
      }
    }
  }, [cities, detectedLocation.city]);

  // Handle change in text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        image: URL.createObjectURL(file),
      }));
    }
  };

  // Handle Save button
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      fd.append('state', formData.state);
      fd.append('pincode', formData.pincode);
      if (imageFile) {
        fd.append('image', imageFile);
      }
      const res = await fetch(`${apiBase}/api/shop/create-edit`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to save shop');
      }
      const saved = await res.json();
      console.log('Shop saved:', saved);
      // navigate('/owner/dashboard');
    } catch (err) {
      console.error(err);
      // Optionally show toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>

      {/* Shop Form Card */}
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600 rounded-full shadow-md shadow-red-400/50">
            <FaUtensils className="text-white w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isEdit ? 'Edit Shop' : 'Add Shop'}
        </h1>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Shop Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Shop Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter shop name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Shop Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Shop Image
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg border border-red-300">
                <FaCamera />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Shop Preview"
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>

          {/* Quick action: Use current location */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={async () => {
                try {
                  const result = await detectFromCurrentLocation();
                  const nextState = result.state || '';
                  setFormData(prev => ({
                    ...prev,
                    state: nextState,
                    city: result.city || '',
                    pincode: result.pincode || prev.pincode,
                    address: result.address || prev.address,
                  }));
                  if (nextState) {
                    await loadCities(nextState);
                  }
                } catch (e) {
                  // noop; could add a toast if available
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Use current location
            </button>
          </div>

          {/* State and City in one row */}
          <div className="grid grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={(e) => {
                  const selectedState = e.target.value;
                  setFormData(prev => ({ ...prev, state: selectedState, city: '' }));
                  if (selectedState) loadCities(selectedState);
                }}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="" disabled>{loadingStates ? 'Loading states...' : 'Select state'}</option>
                {states.length === 0 && formData.state && (
                  <option value={formData.state}>{formData.state}</option>
                )}
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                disabled={!formData.state || loadingCities}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="" disabled>{loadingCities ? 'Loading cities...' : (formData.state ? 'Select city' : 'Select state first')}</option>
                {cities.length === 0 && formData.city && (
                  <option value={formData.city}>{formData.city}</option>
                )}
                {cities.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* Pincode */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              placeholder="Enter pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              maxLength="6"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Address
            </label>
            <textarea
              name="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition cursor-pointer shadow-md"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
