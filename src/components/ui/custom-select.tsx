import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  emptyMessage = 'No options available',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`w-full p-2 text-sm border rounded-lg focus:outline-none flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-200 focus:ring-2 focus:ring-[#4F39F6] bg-white hover:border-gray-300'
        }`}
      >
        <span
          className={
            selectedOption && !disabled ? 'text-gray-900' : 'text-gray-500'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                    value === option.value
                      ? 'bg-primary-50 text-[#4F39F6]'
                      : 'text-gray-900'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-[#4F39F6] animate-in fade-in duration-150" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
