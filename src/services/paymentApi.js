import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/payment`;

const api = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const createRazorpayOrder = async (items) => {
  const res = await api.post(`${API_URL}/create-order`, { items });
  return res.data;
};

export const verifyRazorpayPayment = async (payload) => {
  const res = await api.post(`${API_URL}/verify`, payload);
  return res.data;
};