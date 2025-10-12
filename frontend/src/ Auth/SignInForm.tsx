// src/Auth/SignInForm.tsx
import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { AuthFormData, FormErrors } from './types';
import { useState } from 'react';

interface SignInFormProps {
  onSubmit: (formData: AuthFormData) => Promise<void>;
  onClose: () => void;
  onSwitchToRegister: () => void;
  formErrors: FormErrors;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isMobile?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  onClose,
  onSwitchToRegister,
  formErrors,
  loading,
  showPassword,
  setShowPassword,
  isMobile = false
}) => {
  const [formData, setFormData] = React.useState<AuthFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showSignInForm, setShowSignInForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className={`${isMobile ? 'fixed inset-0 bg-white z-50 p-4 overflow-y-auto' : ''}`}>
      
      <div className={isMobile ? 'mt-10' : ''}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address" 
              className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
              disabled={loading}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                className={`w-full px-4 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
                disabled={loading}
              />
              <button 
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe || false}
                onChange={handleChange}
                className="mr-2 border-gray-300 rounded text-[#A52A2A] focus:ring-[#A52A2A] h-4 w-4" 
                disabled={loading}
              /> 
              Remember me
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-[#A52A2A] hover:underline"
              onClick={onClose}
            >
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit"
            className="mt-6 w-full bg-[#A52A2A] hover:bg-[#8a2323] text-white py-3 rounded-lg text-center font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }} 
            className="text-[#A52A2A] font-medium hover:underline"
          >
            Don't have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;