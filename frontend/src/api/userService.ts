import axios from 'axios';

import type { UserProfile } from './types/auth';

const api = axios.create({ baseURL: '/api' });

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>('/users/me');
  return data;
};

export const updateProfile = async (
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  const { data } = await api.patch<UserProfile>('/users/me', updates);
  // Update local storage if needed
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  storage.setItem('user', JSON.stringify(data));
  return data;
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete('/users/me');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};