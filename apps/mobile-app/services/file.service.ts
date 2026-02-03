import axiosInstance, { AxiosError, AxiosResponse } from '@/lib/axios';
import type { ApiResponse, File } from '@/types/api';

/**
 * File Service
 * Handles all file-related API calls
 */
class FileService {
    private readonly BASE_PATH = '/file';

    /**
     * Get all files
     * Supports pagination and filtering via query params
     */
    async getFiles(params?: { folderId?: string; type?: string; page?: number; limit?: number; search?: string }): Promise<{ files: File[]; total: number }> {
        try {
            const response: AxiosResponse<ApiResponse<{ files: File[]; total: number }>> = await axiosInstance.get(
                `${this.BASE_PATH}`,
                { params }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch files');
        } catch (error) {
            this.handleError(error);
            return { files: [], total: 0 }; // Unreachable but TS compliant
        }
    }

    /**
     * Search files globally
     */
    async searchFiles(query: string): Promise<File[]> {
        try {
            const response: AxiosResponse<ApiResponse<File[]>> = await axiosInstance.get(
                `${this.BASE_PATH}/search`,
                { params: { q: query } }
            );

            return response.data.data || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    /**
     * Get trash files
     */
    async getTrashFiles(): Promise<File[]> {
        try {
            const response: AxiosResponse<ApiResponse<File[]>> = await axiosInstance.get(
                `${this.BASE_PATH}/trash`
            );
            return response.data.data || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    /**
     * Get file details
     */
    async getFile(id: string): Promise<File> {
        try {
            const response: AxiosResponse<ApiResponse<File>> = await axiosInstance.get(`${this.BASE_PATH}/${id}`);
            if (response.data.data) return response.data.data;
            throw new Error('File not found');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Update file metadata (rename, etc.)
     */
    async updateMetadata(id: string, metadata: { name?: string; description?: string }): Promise<File> {
        try {
            const response: AxiosResponse<ApiResponse<File>> = await axiosInstance.patch(
                `${this.BASE_PATH}/${id}/metadata`,
                metadata
            );
            if (response.data.data) return response.data.data;
            throw new Error('Failed to update file');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Move file to trash
     */
    async moveToTrash(id: string): Promise<boolean> {
        return this.performAction(`${this.BASE_PATH}/${id}/trash`, 'post');
    }

    /**
     * Restore file from trash
     */
    async restoreFromTrash(id: string): Promise<boolean> {
        return this.performAction(`${this.BASE_PATH}/${id}/restore`, 'post');
    }

    /**
     * Empty trash
     */
    async emptyTrash(): Promise<boolean> {
        return this.performAction(`${this.BASE_PATH}/trash/empty`, 'delete');
    }

    /**
     * Permanently delete file
     */
    async deletePermanently(id: string): Promise<boolean> {
        return this.performAction(`${this.BASE_PATH}/${id}`, 'delete');
    }

    /**
     * Download file (returns presigned URL or redirects)
     */
    async getDownloadUrl(id: string): Promise<string> {
        try {
            const response: AxiosResponse<ApiResponse<{ url: string }>> = await axiosInstance.get(
                `${this.BASE_PATH}/${id}/download`
            );
            if (response.data.data?.url) return response.data.data.url;
            throw new Error('Download URL not found');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private handleError(error: any): never {
        if (error instanceof AxiosError && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }

    private async performAction(url: string, method: 'post' | 'delete' | 'patch'): Promise<boolean> {
        try {
            const response: AxiosResponse<ApiResponse<any>> = await axiosInstance[method](url);
            return response.data.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }
}

export const fileService = new FileService();
