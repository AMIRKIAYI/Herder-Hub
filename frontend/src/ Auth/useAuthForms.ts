// src/Auth/useAuthForms.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import type { AuthFormData, FormErrors, AuthMode } from './types';

export const useAuthForms = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (formData: AuthFormData, isRegister: boolean): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (isRegister && !formData.username?.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (isRegister && !/^[a-zA-Z0-9_ ]{3,20}$/.test(formData.username || '')) {
      errors.username = 'Username must be 3-20 characters (letters, numbers, _)';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (isRegister && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
      isValid = false;
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRegister = async (formData: AuthFormData) => {
    if (!validateForm(formData, true)) return;

    setLoading(true);
    try {
      await register({
        username: formData.username!,
        email: formData.email,
        password: formData.password
      });
      toast.success('Registration successful! Please sign in.');
      setMode('signin');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setFormErrors({
        email: error.message.includes('already exists') ? 
          'Email is already registered' : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (formData: AuthFormData) => {
    if (!validateForm(formData, false)) return;

    setLoading(true);
    try {
      await login({ 
        email: formData.email, 
        password: formData.password,
        rememberMe: formData.rememberMe 
      });
      toast.success('Login successful!');
      
      setMode(null);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setFormErrors({
        email: ' ',
        password: 'Invalid email or password'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    showPassword,
    setShowPassword,
    loading,
    formErrors,
    handleRegister,
    handleLogin,
    closeAll: () => setMode(null)
  };
};