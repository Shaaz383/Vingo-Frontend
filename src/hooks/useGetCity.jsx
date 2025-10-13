import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCity } from '../redux/userSlice'

// Detect user city via browser geolocation and reverse geocoding (Geoapify)
const useGetCity = () => {
  const dispatch = useDispatch();
  const [detectedCity, setDetectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const reverseGeocode = async (latitude, longitude) => {
    if (!apiKey) throw new Error('VITE_GEOAPIKEY is not configured');
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=json&apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    const data = await response.json();
    const result = Array.isArray(data?.results) ? data.results[0] : data;
    // Prefer finer-grained locality over broad administrative areas
    const locality = result?.city || result?.town || result?.village || result?.suburb || result?.state_district || result?.county;
    const cityLabel = locality || 'Unknown';
    return cityLabel;
  };

  const detectByIp = async () => {
    if (!apiKey) throw new Error('VITE_GEOAPIKEY is not configured');
    const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error('IP geolocation failed');
    }
    const data = await response.json();
    // Normalize likely shapes
    const label = data?.city?.name || data?.city || data?.location?.city?.name || data?.location?.city || 'Unknown';
    return label;
  };

  const requestCity = useCallback(() => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    if (!('geolocation' in navigator)) {
      setLoading(false);
      setError('Geolocation not supported');
      inFlightRef.current = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const label = await reverseGeocode(latitude, longitude);
        setDetectedCity(label);
        dispatch(setCity(label));
      } catch (e) {
        try {
          const label = await detectByIp();
          setDetectedCity(label);
          dispatch(setCity(label));
        } catch (fallbackErr) {
          setError(fallbackErr?.message || e?.message || 'Failed to detect city');
        }
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    }, async (geoError) => {
      try {
        const label = await detectByIp();
        setDetectedCity(label);
        dispatch(setCity(label));
      } catch (fallbackErr) {
        setError(geoError?.message || fallbackErr?.message || 'Location permission denied');
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }, [dispatch, apiKey]);

  useEffect(() => {
    requestCity();
  }, [requestCity]);

  return { detectedCity, loading, error, requestCity };
}

export default useGetCity