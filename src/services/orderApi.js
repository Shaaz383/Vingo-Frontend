import axios from 'axios';

const API_URL = 'http://localhost:3000/api/order';

// Create axios instance with credentials
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Place a new order
export const placeOrder = async (orderData) => {
  try {
    const response = await api.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to place order' };
  }
};

// Get all orders for the current user
export const getMyOrders = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch orders' };
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch order details' };
  }
};