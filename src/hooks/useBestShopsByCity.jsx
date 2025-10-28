import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const useBestShopsByCity = (city) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const fetchShops = useCallback(async () => {
    if (!city) {
      setShops([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${apiBase}/api/shop/list`, {
        params: { city },
        withCredentials: true,
      });
      if (res.data?.success) {
        setShops(res.data.shops || []);
      } else {
        setShops([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load shops');
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, city]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops };
};

export default useBestShopsByCity;