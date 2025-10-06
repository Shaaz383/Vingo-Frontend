import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCity } from '../redux/userSlice'

// Detect user city via browser geolocation and reverse geocoding (OpenStreetMap Nominatim)
const useGetCity = () => {
  const dispatch = useDispatch();
  const [detectedCity, setDetectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);

  const reverseGeocode = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VingoApp/1.0 (contact@example.com)'
      }
    });
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    const data = await response.json();
    const address = data?.address || {};
    // Prefer only the city/locality name; no state or country in label
    const locality = address.city || address.town || address.village || address.suburb || address.county;
    const state = address.state;
    const country = address.country;
    const cityLabel = locality || 'Unknown';
    return { label: cityLabel, meta: { locality, state, country } };
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
        const result = await reverseGeocode(latitude, longitude);
        setDetectedCity(result.label);
        dispatch(setCity(result.label));
      } catch (e) {
        setError(e?.message || 'Failed to detect city');
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    }, (geoError) => {
      setError(geoError?.message || 'Location permission denied');
      setLoading(false);
      inFlightRef.current = false;
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }, [dispatch]);

  useEffect(() => {
    requestCity();
  }, [requestCity]);

  return { detectedCity, loading, error, requestCity };
}

export default useGetCity