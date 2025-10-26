import React, { useState } from 'react';
import { FaUtensils, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/context/ToastContext.jsx';

const CATEGORIES = [
  'Snacks', 'Main Course', 'Dessert', 'Drink', 'Pizza', 'Burger', 'Sandwich',
  'South Indian', 'North Indian', 'Chinese', 'Biryani', 'Rolls', 'Pasta',
  'Salad', 'Soup', 'Dosa', 'Idli', 'other'
];

const FOOD_TYPES = ['Veg', 'Non-Veg', 'Vegan'];

const AddFoodItem = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    category: '',
    foodType: 'Veg',
    price: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canSubmit = form.name && form.category && form.foodType && form.price && imageFile && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('foodType', form.foodType);
      data.append('price', Number(form.price));
      if (imageFile) data.append('image', imageFile);

      const res = await axios.post('http://localhost:3000/api/item/add-item', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.show('Food item added successfully', 'success');
      // Reset form and navigate back to dashboard
      setForm({ name: '', category: '', foodType: 'Veg', price: '' });
      setImageFile(null);
      setPreviewUrl('');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add item';
      toast.show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <span className="inline-flex items-center"><FaUtensils className="mr-2" /> Back</span>
      </button>

      {/* Form Card */}
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600 rounded-full shadow-md shadow-red-400/50">
            <FaUtensils className="text-white w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Food Item</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" style={{ opacity: saving ? 0.85 : 1 }}>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Item Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter item name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Type</label>
            <div className="grid grid-cols-3 gap-2">
              {FOOD_TYPES.map((t) => (
                <label key={t} className={`flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer ${form.foodType === t ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                  <input
                    type="radio"
                    name="foodType"
                    value={t}
                    checked={form.foodType === t}
                    onChange={handleChange}
                    className="hidden"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.5"
              placeholder="Enter price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Item Image</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg border border-red-300">
                <FaCamera />
                <span>Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={saving} />
              </label>
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow-xl transition duration-150 ease-in-out ${canSubmit ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {saving ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFoodItem;
