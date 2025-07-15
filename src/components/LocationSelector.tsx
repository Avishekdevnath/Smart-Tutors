"use client";

import { useState, useEffect } from 'react';

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
}

export default function LocationSelector({ value, onChange, className = "" }: LocationSelectorProps) {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [subareas, setSubareas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch divisions on component mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  // Fetch districts when division changes
  useEffect(() => {
    if (value.division) {
      fetchDistricts(value.division);
      // Reset dependent fields
      onChange({ ...value, district: '', area: '', subarea: '' });
    } else {
      setDistricts([]);
      setAreas([]);
      setSubareas([]);
    }
  }, [value.division]);

  // Fetch areas when district changes
  useEffect(() => {
    if (value.division && value.district) {
      fetchAreas(value.division, value.district);
      // Reset dependent fields
      onChange({ ...value, area: '', subarea: '' });
    } else {
      setAreas([]);
      setSubareas([]);
    }
  }, [value.district]);

  // Fetch subareas when area changes
  useEffect(() => {
    if (value.division && value.district && value.area) {
      fetchSubareas(value.division, value.district, value.area);
      // Reset subarea
      onChange({ ...value, subarea: '' });
    } else {
      setSubareas([]);
    }
  }, [value.area]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      const data = await response.json();
      
      if (data.success) {
        const uniqueDivisions = [...new Set(data.locations.map((loc: Location) => loc.division))];
        setDivisions(uniqueDivisions.sort());
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (division: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueDistricts = [...new Set(data.locations.map((loc: Location) => loc.district))];
        setDistricts(uniqueDistricts.sort());
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (division: string, district: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}&district=${encodeURIComponent(district)}`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueAreas = [...new Set(data.locations.map((loc: Location) => loc.area))];
        setAreas(uniqueAreas.sort());
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubareas = async (division: string, district: string, area: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations?division=${encodeURIComponent(division)}&district=${encodeURIComponent(district)}&area=${encodeURIComponent(area)}`);
      const data = await response.json();
      
      if (data.success) {
        const uniqueSubareas = [...new Set(data.locations.map((loc: Location) => loc.subarea).filter(Boolean))];
        setSubareas(uniqueSubareas.sort());
      }
    } catch (error) {
      console.error('Error fetching subareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionChange = (division: string) => {
    onChange({ ...value, division });
  };

  const handleDistrictChange = (district: string) => {
    onChange({ ...value, district });
  };

  const handleAreaChange = (area: string) => {
    onChange({ ...value, area });
  };

  const handleSubareaChange = (subarea: string) => {
    onChange({ ...value, subarea });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Division */}
      <div>
        <label className="block font-semibold mb-1">Division</label>
        <select
          value={value.division}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
          disabled={loading}
        >
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block font-semibold mb-1">District</label>
        <select
          value={value.district}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
          disabled={!value.division || loading}
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* Area */}
      <div>
        <label className="block font-semibold mb-1">Area</label>
        <select
          value={value.area}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
          disabled={!value.district || loading}
        >
          <option value="">Select Area</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Subarea (optional) */}
      {subareas.length > 0 && (
        <div>
          <label className="block font-semibold mb-1">Sub-area (Optional)</label>
          <select
            value={value.subarea || ''}
            onChange={(e) => handleSubareaChange(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
            disabled={!value.area || loading}
          >
            <option value="">Select Sub-area</option>
            {subareas.map((subarea) => (
              <option key={subarea} value={subarea}>
                {subarea}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500 text-center">
          Loading locations...
        </div>
      )}
    </div>
  );
} 