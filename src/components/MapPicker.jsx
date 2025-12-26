import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapPicker = ({ value, onChange, height = 300, address }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize map with current location or default
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    
    // Default to India if no location provided
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const initialCenter = value || defaultCenter;
    
    // Create map
    const map = L.map(containerRef.current).setView([initialCenter.lat, initialCenter.lng], 13);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([initialCenter.lat, initialCenter.lng], { 
      draggable: true,
      autoPan: true
    }).addTo(map);
    markerRef.current = marker;

    // Update coordinates when marker is dragged
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange?.({ lat: pos.lat, lng: pos.lng });
    });

    // Update marker position when map is clicked
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange?.({ lat, lng });
    });

    // Try to get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        marker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude], 15);
        onChange?.({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.log("Geolocation error:", error);
        // Keep default location if geolocation fails
      }
    );

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update map when address changes
  useEffect(() => {
    if (!address || !mapRef.current || !markerRef.current || isLoading) return;
    
    const addressString = typeof address === 'string' 
      ? address 
      : Object.values(address).filter(Boolean).join(', ');
    
    if (!addressString) return;
    
    setIsLoading(true);
    
    // Geocode address to coordinates
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          markerRef.current.setLatLng([lat, lon]);
          mapRef.current.setView([lat, lon], 15);
          onChange?.({ lat: parseFloat(lat), lng: parseFloat(lon), source: 'search' });
        }
      })
      .catch(err => console.error("Geocoding error:", err))
      .finally(() => setIsLoading(false));
  }, [address]);

  // Keep marker position in sync if value changes externally
  useEffect(() => {
    if (!value || !markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.panTo([value.lat, value.lng]);
  }, [value]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border" style={{ height }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      <button 
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              if (markerRef.current && mapRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
                mapRef.current.setView([latitude, longitude], 15);
                onChange?.({ lat: latitude, lng: longitude });
              }
            },
            (error) => console.log("Geolocation error:", error)
          );
        }}
        className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-[1000] text-sm"
      >
        Use My Location
      </button>
    </div>
  );
};

export default MapPicker;