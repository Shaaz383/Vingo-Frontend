import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeliveryBoy = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/delivery/my-orders', { withCredentials: true });
        setOrders(response.data.orders || []);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const response = await axios.patch(`/api/delivery/${orderId}/status`, { status }, { withCredentials: true });
      setOrders(orders.map(order => (order._id === orderId ? response.data.order : order)));
    } catch (err) {
      alert('Failed to update order status.');
      console.error(err);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '20px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
    },
    welcome: {
      fontSize: '18px',
      color: '#555',
    },
    orderList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
    },
    orderCard: {
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, boxShadow 0.2s',
    },
    orderId: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '10px',
    },
    orderDetails: {
      fontSize: '14px',
      marginBottom: '5px',
    },
    orderActions: {
      marginTop: '15px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
    },
    actionButton: {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.2s',
    },
    acceptButton: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    rejectButton: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Delivery Dashboard</h1>
        <p style={styles.welcome}>Welcome, Delivery Hero!</p>
      </div>
      <h2 style={{ fontSize: '22px', color: '#444', marginBottom: '15px' }}>Your Active Orders</h2>
      <div style={styles.orderList}>
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderId}>Order #{order.order._id}</div>
              <div style={styles.orderDetails}><strong>Shop:</strong> {order.shop.name}</div>
              <div style={styles.orderDetails}><strong>Address:</strong> {order.order.deliveryAddress.line1}, {order.order.deliveryAddress.city}</div>
              <div style={styles.orderDetails}><strong>Status:</strong> {order.status}</div>
              <div style={styles.orderActions}>
                {order.status === 'pending' && (
                  <>
                    <button 
                      style={{...styles.actionButton, ...styles.acceptButton}} 
                      onClick={() => handleStatusUpdate(order._id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button 
                      style={{...styles.actionButton, ...styles.rejectButton}} 
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No active orders at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;