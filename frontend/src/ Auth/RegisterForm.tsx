// src/Auth/RegisterForm.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { AuthFormData, FormErrors } from './types';

interface RegisterFormProps {
  onSubmit: (formData: AuthFormData) => Promise<void>;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  formErrors: FormErrors;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isMobile?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onClose,
  onSwitchToSignIn,
  formErrors,
  loading,
  showPassword,
  setShowPassword,
  isMobile = false
}) => {
  const [formData, setFormData] = React.useState<AuthFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const passwordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const strengthColor = () => {
    const strength = passwordStrength();
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`${isMobile ? 'fixed inset-0 bg-white z-50 p-4 overflow-y-auto' : ''}`}>
      <div className={isMobile ? 'mt-10' : ''}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
              placeholder="Enter your username"
              disabled={loading}
            />
            {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
                placeholder="Enter your password"
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
            <div className="mt-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`flex-1 rounded-full ${
                      passwordStrength() >= i ? strengthColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {formData.password && (
                <p className="text-xs mt-1 text-gray-500">
                  {passwordStrength() >= 4 ? 'Strong password' : 
                   passwordStrength() >= 2 ? 'Moderate password' : 'Weak password'}
                </p>
              )}
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A]`}
                placeholder="Confirm your password"
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
            {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
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
                Registering...
              </span>
            ) : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              onClose();
              onSwitchToSignIn();
            }} 
            className="text-[#A52A2A] font-medium hover:underline"
          >
            Already have an account? Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;