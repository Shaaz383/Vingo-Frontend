import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchStates, fetchCitiesByState, reverseGeocode } from '@/services/locationApi';

const useIndianLocationsApi = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);

  const loadStates = useCallback(async () => {
    try {
      setError(null);
      setLoadingStates(true);
      const list = await fetchStates('IN');
      setStates(list);
    } catch (e) {
      setError(e?.message || 'Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const loadCities = useCallback(async (stateName) => {
    if (!stateName) {
      setCities([]);
      return;
    }
    try {
      setError(null);
      setLoadingCities(true);
      const list = await fetchCitiesByState(stateName, 'IN');
      setCities(list);
    } catch (e) {
      setError(e?.message || 'Failed to load cities');
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const detectFromCurrentLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
    const { latitude, longitude } = position.coords;
    return await reverseGeocode(latitude, longitude);
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  return {
    states,
    cities,
    loadingStates,
    loadingCities,
    error,
    loadStates,
    loadCities,
    detectFromCurrentLocation,
  };
};

export default useIndianLocationsApi;


