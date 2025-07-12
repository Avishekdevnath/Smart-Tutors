"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface Location {
  _id: string;
  division: string;
  district: string;
  area: string;
  subarea?: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function LocationSearch({ 
  value, 
  onChange, 
  placeholder = "Search for location...", 
  required = false 
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load all locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/locations?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setAllLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Filter locations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = allLocations.filter(location => {
      const searchLower = searchTerm.toLowerCase();
      const fullLocation = `${location.division} ${location.district} ${location.area} ${location.subarea || ''}`.toLowerCase();
      return fullLocation.includes(searchLower);
    }).slice(0, 10); // Limit to 10 suggestions

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [searchTerm, allLocations]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (location: Location) => {
    const locationString = location.subarea 
      ? `${location.area}, ${location.subarea}, ${location.district}, ${location.division}`
      : `${location.area}, ${location.district}, ${location.division}`;
    
    setSearchTerm(locationString);
    onChange(locationString);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const formatLocationDisplay = (location: Location) => {
    if (location.subarea) {
      return `${location.area}, ${location.subarea}, ${location.district}, ${location.division}`;
    }
    return `${location.area}, ${location.district}, ${location.division}`;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              Loading locations...
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((location) => (
                <button
                  key={location._id}
                  onClick={() => handleSuggestionClick(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {location.area}
                      {location.subarea && `, ${location.subarea}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.district}, {location.division}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.trim() && (
            <div className="p-3 text-center text-gray-500">
              No locations found. Try a different search term.
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      {!searchTerm && (
        <p className="text-xs text-gray-500 mt-1">
          Start typing to search for your area (e.g., "Dhanmondi", "Gulshan", "Mohammadpur")
        </p>
      )}
    </div>
  );
} 