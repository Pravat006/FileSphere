import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getCurrentUser } from '@repo/firebase/client';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v0';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add Firebase auth token to requests
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const user = await getCurrentUser();

            if (user) {
                // Get fresh Firebase ID token
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response;
    },
    async (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Token might be expired
                    console.error('Unauthorized access - please login again');
                    // You might want to trigger logout here
                    break;
                case 403:
                    console.error('Forbidden - insufficient permissions');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error - please try again later');
                    break;
                default:
                    console.error(`API Error (${status}):`, data);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error - please check your connection');
        } else {
            // Something else happened
            console.error('Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

// Export Axios types and classes for use in services
export { AxiosError } from 'axios';
export type { AxiosResponse } from 'axios';
