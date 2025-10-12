import React from 'react';
import { FiX } from 'react-icons/fi';

interface AuthModalProps {
  mode: 'signin' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'register') => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  children,
  isMobile = false
}) => {
  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isMobile ? 'p-4' : ''}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden ${isMobile ? 'my-auto' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A52A2A] to-amber-300" />
        
        {/* Modal header - fixed and always visible */}
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#A52A2A]">
              {mode === 'signin' ? 'Sign In' : 'Register'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Form content */}
        <div className="p-6 overflow-y-auto">
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;