import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const useItemsByCity = (city) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const fetchItems = useCallback(async () => {
    if (!city) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${apiBase}/api/item/list`, {
        params: { city },
        withCredentials: true,
      });
      if (res.data?.success) {
        setItems(res.data.items || []);
      } else {
        setItems([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, city]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
};

export default useItemsByCity;