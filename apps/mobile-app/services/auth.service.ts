import axiosInstance, { AxiosError, AxiosResponse } from '@/lib/axios';
import type { ApiResponse, User } from '@/types/api';
/**
 * Auth Service
 * Handles all authentication-related API calls
 */
class AuthService {
    private readonly BASE_PATH = '/auth';

    /**
     * Create a new user in the backend after Firebase authentication
     * This should be called after successful Firebase sign-in
     * 
     * @returns Promise with user data
     * @throws AxiosError if request fails
     */
    async createUser(): Promise<User> {
        try {
            const response: AxiosResponse<ApiResponse<User>> = await axiosInstance.post(
                `${this.BASE_PATH}/create-user`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to create user');
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message || error.message;
                throw new Error(message);
            }
            throw error;
        }
    }

    /**
     * Get current user profile
     * Requires Firebase authentication
     * 
     * @returns Promise with user data
     * @throws AxiosError if request fails
     */
    async getMe(): Promise<User> {
        try {
            const response: AxiosResponse<ApiResponse<User>> = await axiosInstance.get(
                `${this.BASE_PATH}/me`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to get user profile');
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message || error.message;
                throw new Error(message);
            }
            throw error;
        }
    }

    /**
     * Check if user exists in backend and create if not
     * This is a helper method to ensure user exists after Firebase auth
     * 
     * @returns Promise with user data
     */
    async ensureUserExists(): Promise<User> {
        try {
            // Try to get existing user first
            return await this.getMe();
        } catch (error) {
            // If user doesn't exist (404), create new user
            if (error instanceof AxiosError && error.response?.status === 404) {
                return await this.createUser();
            }
            throw error;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing or custom instances
export default AuthService;
