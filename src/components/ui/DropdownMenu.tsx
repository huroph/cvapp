import { useState, useEffect, useRef } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface DropdownOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface DropdownMenuProps {
  options: DropdownOption[];
  triggerClassName?: string;
  menuClassName?: string;
  title?: string;
  direction?: 'left' | 'right';
  hoverBorder?: string;
}

export default function DropdownMenu({ 
  options, 
  triggerClassName = "", 
  menuClassName = "",
  title = "Actions",
  direction = "left",
  hoverBorder = "blue-300"
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Construire les classes de border dynamiquement
  const getBorderClasses = () => {
    if (!hoverBorder) return "";
    
    // Mappage des couleurs courantes pour éviter les problèmes de purge CSS
    const borderMap: { [key: string]: string } = {
      'blue-300': 'hover:border-2 hover:border-blue-300',
      'purple-300': 'hover:border-2 hover:border-purple-300',
      'green-300': 'hover:border-2 hover:border-green-300',
      'red-300': 'hover:border-2 hover:border-red-300',
      'yellow-300': 'hover:border-2 hover:border-yellow-300',
      'gray-300': 'hover:border-2 hover:border-gray-300',
      'indigo-300': 'hover:border-2 hover:border-indigo-300',
      'pink-300': 'hover:border-2 hover:border-pink-300',
    };
    
    return borderMap[hoverBorder] || `hover:border-2 hover:border-${hoverBorder}`;
  };

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: DropdownOption) => {
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative dropdown-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`py-2 btn-custom px-4 rounded transition-all flex-shrink-0 group cursor-pointer ${getBorderClasses()} ${triggerClassName}`}
        title={title}
      >
        <EllipsisVerticalIcon className="h-4 w-4 text-blue-600  transition-colors" />
      </button>

      {isOpen  && (
        <div className={`absolute ${direction === 'left' ? 'right-0' : 'left-0'} top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${menuClassName}`}>
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`w-full text-left px-4 py-2 text-sm   hover:bg-gray-100 flex items-center gap-2 ${option.className || 'text-gray-700'}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}