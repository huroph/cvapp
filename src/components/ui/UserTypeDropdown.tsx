import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserType, USER_TYPE_OPTIONS, type UserTypeOption } from '../../types/user';

interface UserTypeDropdownProps {
  value: UserType;
  onChange: (userType: UserType) => void;
  error?: string;
}

export default function UserTypeDropdown({ value, onChange, error }: UserTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = USER_TYPE_OPTIONS.find(option => option.value === value);

  const handleSelect = (option: UserTypeOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
        Je suis un(e) *
      </label>
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center space-x-3">
          {selectedOption && (
            <>
              <span className="text-lg">{selectedOption.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{selectedOption.label}</div>
                <div className="text-sm text-gray-500">{selectedOption.description}</div>
              </div>
            </>
          )}
        </div>
        <ChevronDownIcon 
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {USER_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg ${
                value === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}