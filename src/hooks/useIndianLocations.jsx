import { useEffect, useState } from "react";
import indianStatesCities from "@/data/indianStatesCities.json";

const useIndianLocations = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load all state names on mount
    const allStates = Object.keys(indianStatesCities);
    setStates(allStates);
  }, []);

  const fetchCities = (stateName) => {
    setLoading(true);
    setTimeout(() => {
      const cityList = indianStatesCities[stateName] || [];
      setCities(cityList);
      setLoading(false);
    }, 300); // tiny delay to simulate loading
  };

  return { states, cities, loading, fetchCities };
};

export default useIndianLocations;
