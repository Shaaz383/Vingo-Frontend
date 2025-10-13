import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchStates, fetchCitiesByState, reverseGeocodeGeoapify } from '@/services/locationApi';
import indianStatesCities from '@/data/indianStatesCities.json';

const useIndianLocationsApi = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);
  const locationApiBase = import.meta.env.VITE_LOCATION_API_BASE;

  const loadStates = useCallback(async () => {
    try {
      setError(null);
      setLoadingStates(true);
      if (locationApiBase) {
        const list = await fetchStates('IN');
        setStates(list);
      } else {
        const list = Object.keys(indianStatesCities || {});
        setStates(list);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  }, [locationApiBase]);

  const loadCities = useCallback(async (stateName) => {
    if (!stateName) {
      setCities([]);
      return;
    }
    try {
      setError(null);
      setLoadingCities(true);
      if (locationApiBase) {
        const list = await fetchCitiesByState(stateName, 'IN');
        setCities(list);
      } else {
        const list = indianStatesCities?.[stateName] || [];
        setCities(list);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load cities');
    } finally {
      setLoadingCities(false);
    }
  }, [locationApiBase]);

  const detectFromCurrentLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
    const { latitude, longitude } = position.coords;
    return await reverseGeocodeGeoapify(latitude, longitude);
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


