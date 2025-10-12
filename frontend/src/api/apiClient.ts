import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // ✅ important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
