// Location API client using environment variables
// Expected .env entries (vite):
//   VITE_LOCATION_API_BASE=https://example.com/api
//   VITE_LOCATION_API_KEY=your_api_key

const BASE_URL = import.meta.env.VITE_LOCATION_API_BASE;
const API_KEY = import.meta.env.VITE_LOCATION_API_KEY;

function buildHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  return headers;
}

function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error('VITE_LOCATION_API_BASE is not configured');
  }
}

export async function fetchStates(countryCode = 'IN') {
  ensureBaseUrl();
  // Try common patterns: /states?country=IN or /locations/states?country=IN
  const urlCandidates = [
    `${BASE_URL}/states?country=${encodeURIComponent(countryCode)}`,
    `${BASE_URL}/locations/states?country=${encodeURIComponent(countryCode)}`,
  ];
  for (const url of urlCandidates) {
    const res = await fetch(url, { headers: buildHeaders() });
    if (res.ok) {
      const data = await res.json();
      // Normalize to an array of state names
      if (Array.isArray(data)) {
        return data.map((s) => (typeof s === 'string' ? s : (s.name || s.state || s.title))).filter(Boolean);
      }
      if (Array.isArray(data?.states)) {
        return data.states.map((s) => (typeof s === 'string' ? s : (s.name || s.state || s.title))).filter(Boolean);
      }
      if (Array.isArray(data?.data)) {
        return data.data.map((s) => (typeof s === 'string' ? s : (s.name || s.state || s.title))).filter(Boolean);
      }
      return [];
    }
  }
  return [];
}

export async function fetchCitiesByState(stateName, countryCode = 'IN') {
  ensureBaseUrl();
  if (!stateName) return [];
  const urlCandidates = [
    `${BASE_URL}/cities?country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(stateName)}`,
    `${BASE_URL}/locations/cities?country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(stateName)}`,
  ];
  for (const url of urlCandidates) {
    const res = await fetch(url, { headers: buildHeaders() });
    if (res.ok) {
      const data = await res.json();
      // Normalize to an array of city names
      if (Array.isArray(data)) {
        return data.map((c) => (typeof c === 'string' ? c : (c.name || c.city || c.title))).filter(Boolean);
      }
      if (Array.isArray(data?.cities)) {
        return data.cities.map((c) => (typeof c === 'string' ? c : (c.name || c.city || c.title))).filter(Boolean);
      }
      if (Array.isArray(data?.data)) {
        return data.data.map((c) => (typeof c === 'string' ? c : (c.name || c.city || c.title))).filter(Boolean);
      }
      return [];
    }
  }
  return [];
}

export async function reverseGeocode(lat, lon) {
  ensureBaseUrl();
  if (lat == null || lon == null) throw new Error('Latitude/longitude required');
  const urlCandidates = [
    `${BASE_URL}/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
    `${BASE_URL}/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
  ];
  for (const url of urlCandidates) {
    const res = await fetch(url, { headers: buildHeaders() });
    if (res.ok) {
      const data = await res.json();
      // Normalize fields
      const address = data?.address || data?.data || data;
      const state = address?.state || address?.region || address?.administrative_area || null;
      const city = address?.city || address?.town || address?.district || address?.locality || null;
      const pincode = address?.pincode || address?.postal_code || address?.postcode || null;
      const fullAddress = address?.formatted || address?.display_name || address?.label || null;
      return { state, city, pincode, address: fullAddress };
    }
  }
  throw new Error('Reverse geocoding failed');
}


