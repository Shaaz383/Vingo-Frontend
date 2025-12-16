import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext.jsx';
import Modal from '@/components/common/Modal.jsx';

const OwnerItemCard = ({ item, refetch }) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const {
    _id,
    name = 'Unnamed Dish',
    image = '',
    category = 'Uncategorized',
    foodType = 'Veg',
    price,
    description,
  } = item || {};

  const [form, setForm] = useState({
    name,
    category,
    foodType,
    price,
  });

  const isVeg = String(foodType).toLowerCase().includes('veg') && !String(foodType).toLowerCase().includes('non');
  const vegColor = isVeg ? 'bg-green-600' : 'bg-red-600';
  const vegLabel = isVeg ? 'Veg' : 'Non-Veg';

  const placeholderImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      setDeleting(true);
      await axios.delete(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/item/delete-item/${_id}`, {
        withCredentials: true,
      });
      toast.show('Item deleted', 'success');
      refetch && refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Delete failed';
      toast.show(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('foodType', form.foodType);
      data.append('price', Number(form.price));
      if (imageFile) data.append('image', imageFile);

      await axios.post(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/item/edit-item/${_id}`, data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.show('Item updated', 'success');
      setIsEditing(false);
      setImageFile(null);
      refetch && refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Update failed';
      toast.show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative">
        <img
          src={image || placeholderImg}
          alt={name}
          className="w-full h-40 object-cover"
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
        {/* Food type dot */}
        <div className={`absolute top-3 left-3 h-4 w-4 rounded-sm border-2 border-white ${vegColor}`}></div>
        {/* Category badge */}
        <span className="absolute bottom-3 left-3 text-xs font-medium bg-white/90 text-gray-800 px-2 py-1 rounded-md shadow-sm">
          {category}
        </span>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-xs rounded-md bg-white/90 text-gray-800 shadow-sm hover:bg-white"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-3 py-1 text-xs rounded-md shadow-sm ${deleting ? 'bg-gray-300 text-gray-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate group-hover:text-red-700">
          {name}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {vegLabel}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {category}
            </span>
          </div>
          {price !== undefined && (
            <span className="text-sm font-semibold text-gray-900">₹{price}</span>
          )}
        </div>

        {description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Edit Modal via Portal */}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Item"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-item-form"
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} shadow-md`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      >
        <form id="edit-item-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
            <select
              value={form.foodType}
              onChange={(e) => setForm({ ...form, foodType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              required
            >
              <option>Veg</option>
              <option>Non-Veg</option>
              <option>Vegan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerItemCard;