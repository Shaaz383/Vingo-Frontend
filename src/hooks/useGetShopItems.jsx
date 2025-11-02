import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const useGetShopItems = () => {
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:3000/api/item/shop-items', {
        withCredentials: true,
      });

      if (response.data.success) {
        setItems(response.data.items);
        setItemCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching shop items:', err);
      setError(err?.response?.data?.message || 'Failed to fetch items');
      toast.error(err?.response?.data?.message || 'Failed to fetch shop items');
      setItems([]);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  return {
    items,
    itemCount,
    loading,
    error,
    refetch: fetchShopItems,
  };
};

export default useGetShopItems;