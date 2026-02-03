import axiosInstance, { AxiosError, AxiosResponse } from '@/lib/axios';
import type { ApiResponse, Folder } from '@/types/api';

/**
 * Folder Service
 * Handles folder management
 */
class FolderService {
    private readonly BASE_PATH = '/folder';

    /**
     * Create a new folder
     */
    async createFolder(name: string, parentFolderId?: string): Promise<Folder> {
        try {
            const response: AxiosResponse<ApiResponse<Folder>> = await axiosInstance.post(
                `${this.BASE_PATH}/create`,
                { name, parentFolderId }
            );
            if (response.data.data) return response.data.data;
            throw new Error('Failed to create folder');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get root folders or folders by parent
     */
    async getFolders(parentFolderId?: string, search?: string): Promise<Folder[]> {
        try {
            const response: AxiosResponse<ApiResponse<Folder[]>> = await axiosInstance.get(
                `${this.BASE_PATH}`,
                { params: { parentFolderId, search } }
            );
            return response.data.data || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    /**
     * Get folder details
     */
    async getFolder(id: string): Promise<Folder> {
        try {
            const response: AxiosResponse<ApiResponse<Folder>> = await axiosInstance.get(`${this.BASE_PATH}/${id}`);
            if (response.data.data) return response.data.data;
            throw new Error('Folder not found');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Rename folder
     */
    async updateFolder(id: string, name: string): Promise<Folder> {
        try {
            const response: AxiosResponse<ApiResponse<Folder>> = await axiosInstance.patch(
                `${this.BASE_PATH}/${id}`,
                { name }
            );
            if (response.data.data) return response.data.data;
            throw new Error('Failed to update folder');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Delete folder
     */
    async deleteFolder(id: string): Promise<boolean> {
        try {
            const response: AxiosResponse<ApiResponse<null>> = await axiosInstance.delete(`${this.BASE_PATH}/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete folder');
            }
            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    private handleError(error: any): never {
        if (error instanceof AxiosError && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
}

export const folderService = new FolderService();
export default FolderService;
