import type { User, Listing, Order, Message, Notification } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Important for cookies
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const accountService = {
  getProfile: (): Promise<User> => fetchWithAuth('/account/profile'),
  
  updateProfile: (updates: Partial<User>): Promise<User> => 
    fetchWithAuth('/account/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  
  getListings: (): Promise<Listing[]> => fetchWithAuth('/account/listings'),
  
  getOrders: (): Promise<Order[]> => fetchWithAuth('/account/orders'),
  
  getMessages: (): Promise<Message[]> => fetchWithAuth('/account/messages'),
  
  getNotifications: (): Promise<Notification[]> => fetchWithAuth('/account/notifications'),
  
  markNotificationsAsRead: (): Promise<void> => 
    fetchWithAuth('/account/notifications/read', { method: 'PATCH' })
};