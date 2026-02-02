import axiosInstance, { AxiosError, AxiosResponse } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export enum UploadStrategy {
    SINGLE_PART = 'SINGLE_PART',
    MULTI_PART = 'MULTI_PART'
}

export interface InitiateUploadResponse {
    fileId: string;
    strategy: UploadStrategy;
    key: string;
    uploadId?: string;
    preSignedUrls: string[];
}

export interface InitiateUploadPayload {
    filename: string;
    size: number;
    mimeType: string;
    folderId?: string;
}

export interface CompleteUploadPayload {
    fileId: string;
    parts?: {
        ETag: string;
        PartNumber: number;
    }[];
}

/**
 * Upload Service
 * Handles file upload operations
 */
class UploadService {
    private readonly BASE_PATH = '/upload';

    /**
     * Initiate an upload (Single or Multipart)
     */
    async initiateUpload(payload: InitiateUploadPayload): Promise<InitiateUploadResponse> {
        try {
            const response: AxiosResponse<ApiResponse<InitiateUploadResponse>> = await axiosInstance.post(
                `${this.BASE_PATH}/initiate-upload`,
                payload
            );
            if (response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to initiate upload');
        } catch (error) {
            this.handleError(error);

        }
    }

    /**
     * Complete an upload
     */
    async completeUpload(payload: CompleteUploadPayload): Promise<boolean> {
        try {
            const response: AxiosResponse<ApiResponse<any>> = await axiosInstance.post(
                `${this.BASE_PATH}/complete-upload`,
                payload
            );
            return response.data.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    /**
     * Abort an upload
     */
    async abortUpload(fileId: string): Promise<boolean> {
        try {
            const response: AxiosResponse<ApiResponse<any>> = await axiosInstance.post(
                `${this.BASE_PATH}/abort-upload`,
                { fileId }
            );
            return response.data.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    /**
     * Get multipart URLs
     */
    async getMultipartUrls(fileId: string, parts: number): Promise<{ partNumber: number; url: string }[]> {
        try {
            const response: AxiosResponse<ApiResponse<{ partNumber: number; url: string }[]>> = await axiosInstance.post(
                `${this.BASE_PATH}/get-multipart-urls`,
                { fileId, parts }
            );

            if (response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to get multipart URLs');
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Upload file content to S3 via Presigned URL
     */
    async uploadFileToS3(url: string, file: Blob | File, onProgress?: (progress: number) => void): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url);

            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentCompleted = Math.round((event.loaded * 100) / event.total);
                        onProgress(percentCompleted);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const etag = xhr.getResponseHeader('etag');
                    resolve(etag ? etag.replace(/"/g, '') : null);
                } else {
                    reject(new Error(`Failed to upload to S3: ${xhr.status} - ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network Error - Failed to connect to S3'));
            };

            xhr.ontimeout = () => {
                reject(new Error('Upload timed out'));
            };

            xhr.send(file);
        });
    }

    private handleError(error: any): never {
        if (error instanceof AxiosError && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
}

export const uploadService = new UploadService();
