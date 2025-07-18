"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Location {
  _id: string;
  division: string;
  district: string;
  area: string;
  subarea?: string;
  formatted?: string;
}

interface LocationSelectorProps {
  value: {
    division: string;
    district: string;
    area: string;
    subarea?: string;
  };
  onChange: (location: {
    division: string;
    district: string;
    area: string;
    subarea?: string;
  }) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function LocationSelector({ 
  value, 
  onChange, 
  className = "",
  required = false,
  disabled = false 
}: LocationSelectorProps) {
  // State for dropdown options
  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [subareas, setSubareas] = useState<string[]>([]);
  
  // Loading states for each dropdown
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingSubareas, setLoadingSubareas] = useState(false);
  
  // Error states
  const [error, setError] = useState<string>('');
  
  // Area input mode state
  const [areaInputMode, setAreaInputMode] = useState<'select' | 'input'>('select');
  const [customArea, setCustomArea] = useState('');

  // Synchronize customArea with normalizedValue.area when in input mode
  useEffect(() => {
    if (areaInputMode === 'input') {
      setCustomArea(normalizedValue.area);
    }
  }, [areaInputMode, normalizedValue.area]);

  // Cache for API responses
  const [cache, setCache] = useState<{
    divisions: string[];
    districts: Record<string, string[]>;
    areas: Record<string, string[]>;
    subareas: Record<string, string[]>;
  }>({
    divisions: [],
    districts: {},
    areas: {},
    subareas: {}
  });

  // Normalize value to ensure all properties are strings
  const normalizedValue = useMemo(() => ({
    division: value.division || '',
    district: value.district || '',
    area: value.area || '',
    subarea: value.subarea || ''
  }), [value]);

  // Fetch all divisions on mount (only once)
  useEffect(() => {
    fetchDivisions();
  }, []);

  // Fetch districts when division changes (with caching)
  useEffect(() => {
    if (normalizedValue.division && !cache.districts[normalizedValue.division]) {
      fetchDistricts(normalizedValue.division);
    } else if (normalizedValue.division && cache.districts[normalizedValue.division]) {
      setDistricts(cache.districts[normalizedValue.division]);
    } else {
      setDistricts([]);
    }
  }, [normalizedValue.division, cache.districts]);

  // Fetch areas when district changes (with caching)
  useEffect(() => {
    if (normalizedValue.division && normalizedValue.district) {
      const cacheKey = `${normalizedValue.division}-${normalizedValue.district}`;
      if (!cache.areas[cacheKey]) {
        fetchAreas(normalizedValue.division, normalizedValue.district);
      } else {
        setAreas(cache.areas[cacheKey]);
      }
    } else {
      setAreas([]);
    }
  }, [normalizedValue.division, normalizedValue.district, cache.areas]);

  // Fetch subareas when area changes (with caching)
  useEffect(() => {
    if (normalizedValue.division && normalizedValue.district && normalizedValue.area) {
      const cacheKey = `${normalizedValue.division}-${normalizedValue.district}-${normalizedValue.area}`;
      if (!cache.subareas[cacheKey]) {
        fetchSubareas(normalizedValue.division, normalizedValue.district, normalizedValue.area);
      } else {
        setSubareas(cache.subareas[cacheKey]);
      }
    } else {
      setSubareas([]);
    }
  }, [normalizedValue.division, normalizedValue.district, normalizedValue.area, cache.subareas]);

  const fetchDivisions = useCallback(async () => {
    if (cache.divisions.length > 0) {
      setDivisions(cache.divisions);
      return;
    }

    try {
      setLoadingDivisions(true);
      setError('');
      
      const response = await fetch('/api/locations?limit=10000');
      const data = await response.json();
      
      if (data.success) {
        const uniqueDivisions = [...new Set(data.locations.map((loc: Location) => loc.division))].sort();
        setDivisions(uniqueDivisions);
        setCache(prev => ({ ...prev, divisions: uniqueDivisions }));
      } else {
        setError('Failed to load divisions');
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setError('Failed to load divisions');
    } finally {
      setLoadingDivisions(false);
    }
  }, [cache.divisions]);

  const fetchDistricts = useCallback(async (division: string) => {
    if (cache.districts[division]) {
      setDistricts(cache.districts[division]);
      return;
    }

    try {
      setLoadingDistricts(true);
      setError('');
      
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}&limit=10000`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueDistricts = [...new Set(data.locations.map((loc: Location) => loc.district))].sort();
        setDistricts(uniqueDistricts);
        setCache(prev => ({ 
          ...prev, 
          districts: { ...prev.districts, [division]: uniqueDistricts } 
        }));
      } else {
        setError('Failed to load districts');
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setError('Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  }, [cache.districts]);

  const fetchAreas = useCallback(async (division: string, district: string) => {
    const cacheKey = `${division}-${district}`;
    if (cache.areas[cacheKey]) {
      setAreas(cache.areas[cacheKey]);
      return;
    }

    try {
      setLoadingAreas(true);
      setError('');
      
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}&district=${encodeURIComponent(district)}&limit=10000`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueAreas = [...new Set(data.locations.map((loc: Location) => loc.area))].sort();
        setAreas(uniqueAreas);
        setCache(prev => ({ 
          ...prev, 
          areas: { ...prev.areas, [cacheKey]: uniqueAreas } 
        }));
      } else {
        setError('Failed to load areas');
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setError('Failed to load areas');
    } finally {
      setLoadingAreas(false);
    }
  }, [cache.areas]);

  const fetchSubareas = useCallback(async (division: string, district: string, area: string) => {
    const cacheKey = `${division}-${district}-${area}`;
    if (cache.subareas[cacheKey]) {
      setSubareas(cache.subareas[cacheKey]);
      return;
    }

    try {
      setLoadingSubareas(true);
      setError('');
      
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}&district=${encodeURIComponent(district)}&area=${encodeURIComponent(area)}&limit=10000`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueSubareas = [...new Set(data.locations.map((loc: Location) => loc.subarea).filter(Boolean))].sort();
        setSubareas(uniqueSubareas);
        setCache(prev => ({ 
          ...prev, 
          subareas: { ...prev.subareas, [cacheKey]: uniqueSubareas } 
        }));
      } else {
        setError('Failed to load subareas');
      }
    } catch (error) {
      console.error('Error fetching subareas:', error);
      setError('Failed to load subareas');
    } finally {
      setLoadingSubareas(false);
    }
  }, [cache.subareas]);

  const handleDivisionChange = useCallback((division: string) => {
    setError('');
    setAreaInputMode('select');
    setCustomArea('');
    onChange({ 
      division, 
      district: '', 
      area: '', 
      subarea: '' 
    });
  }, [onChange]);

  const handleDistrictChange = useCallback((district: string) => {
    setError('');
    setAreaInputMode('select');
    setCustomArea('');
    onChange({ 
      ...normalizedValue, 
      district, 
      area: '', 
      subarea: '' 
    });
  }, [normalizedValue, onChange]);

  const handleAreaChange = useCallback((area: string) => {
    setError('');
    onChange({ 
      ...normalizedValue, 
      area, 
      subarea: '' 
    });
  }, [normalizedValue, onChange]);

  const handleCustomAreaChange = useCallback((area: string) => {
    setCustomArea(area);
    setError('');
    onChange({ 
      ...normalizedValue, 
      area, 
      subarea: '' 
    });
  }, [normalizedValue, onChange]);

  const handleSubareaChange = useCallback((subarea: string) => {
    setError('');
    onChange({ 
      ...normalizedValue, 
      subarea 
    });
  }, [normalizedValue, onChange]);

  const toggleAreaInputMode = useCallback(() => {
    setAreaInputMode(prev => prev === 'select' ? 'input' : 'select');
    if (areaInputMode === 'select') {
      setCustomArea(normalizedValue.area);
    } else {
      setCustomArea('');
      onChange({ 
        ...normalizedValue, 
        area: '', 
        subarea: '' 
      });
    }
  }, [areaInputMode, normalizedValue.area, onChange]);

  // Validation state
  const isValid = useMemo(() => {
    return normalizedValue.division && normalizedValue.district && normalizedValue.area;
  }, [normalizedValue.division, normalizedValue.district, normalizedValue.area]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Division */}
      <div>
        <label className="block font-semibold mb-1">
          Division {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={normalizedValue.division}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 ${
            disabled || loadingDivisions ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          disabled={disabled || loadingDivisions}
          required={required}
        >
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>
        {loadingDivisions && (
          <div className="text-sm text-gray-500 mt-1">Loading divisions...</div>
        )}
      </div>

      {/* District */}
      <div>
        <label className="block font-semibold mb-1">
          District {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={normalizedValue.district}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 ${
            !normalizedValue.division || disabled || loadingDistricts ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          disabled={!normalizedValue.division || disabled || loadingDistricts}
          required={required}
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        {loadingDistricts && (
          <div className="text-sm text-gray-500 mt-1">Loading districts...</div>
        )}
      </div>

      {/* Area */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block font-semibold">
            Area {required && <span className="text-red-500">*</span>}
          </label>
          {normalizedValue.division && normalizedValue.district && (
            <button
              type="button"
              onClick={toggleAreaInputMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {areaInputMode === 'select' ? 'Add New Area' : 'Select Existing'}
            </button>
          )}
        </div>
        
        {areaInputMode === 'select' ? (
          <select
            value={normalizedValue.area}
            onChange={(e) => handleAreaChange(e.target.value)}
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 ${
              !normalizedValue.district || disabled || loadingAreas ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={!normalizedValue.district || disabled || loadingAreas}
            required={required}
          >
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={customArea || ''}
            onChange={(e) => handleCustomAreaChange(e.target.value)}
            placeholder="Enter new area name"
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={disabled}
            required={required}
          />
        )}
        
        {loadingAreas && areaInputMode === 'select' && (
          <div className="text-sm text-gray-500 mt-1">Loading areas...</div>
        )}
        
        {areaInputMode === 'input' && (
          <div className="text-sm text-gray-500 mt-1">
            Type the name of the new area you want to add
          </div>
        )}
      </div>

      {/* Subarea (optional) */}
      {subareas.length > 0 && (
        <div>
          <label className="block font-semibold mb-1">Sub-area (Optional)</label>
          <select
            value={normalizedValue.subarea}
            onChange={(e) => handleSubareaChange(e.target.value)}
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 ${
              !normalizedValue.area || disabled || loadingSubareas ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={!normalizedValue.area || disabled || loadingSubareas}
          >
            <option value="">Select Sub-area</option>
            {subareas.map((subarea) => (
              <option key={subarea} value={subarea}>
                {subarea}
              </option>
            ))}
          </select>
          {loadingSubareas && (
            <div className="text-sm text-gray-500 mt-1">Loading subareas...</div>
          )}
        </div>
      )}

      {/* Validation Feedback */}
      {required && !isValid && (
        <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded">
          Please select division, district, and area
        </div>
      )}
    </div>
  );
} 