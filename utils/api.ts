import axios from "axios";
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  });
  
  // Add request interceptor for authentication
  api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });