import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'large';
}

const sizeClasses = {
  sm: 'max-w-sm sm:max-w-md',
  md: 'max-w-md sm:max-w-lg',
  lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
  large: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
    >
      {/* Overlay - click to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal content */}
      <div 
        className={`relative bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3 sm:px-6 sm:py-4 bg-gray-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4 truncate">{title}</h3>
          <button 
            onClick={onClose} 
            className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-xl sm:text-2xl font-bold transition-colors hover:bg-gray-200 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="px-4 py-4 sm:px-6 sm:py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {actions && (
          <div className="px-4 py-3 sm:px-6 sm:py-3 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 