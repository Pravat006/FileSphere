import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadService } from '@/services/upload.service';
import { useQueryClient } from '@tanstack/react-query';

export const useFileUpload = () => {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;
            setFile(result.assets[0]);
            setProgress(0);
            return result.assets[0];
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to pick file");
            return null;
        }
    };

    const clearFile = () => {
        setFile(null);
        setFileId(null);
        setProgress(0);
    };

    const handleUpload = async (folderId?: string) => {
        if (!file) return;
        setUploading(true);
        setProgress(0);

        try {
            // 1. Initiate Upload
            const init = await uploadService.initiateUpload({
                filename: file.name,
                mimeType: file.mimeType || 'application/octet-stream',
                size: file.size || 0,
                folderId: folderId
            });
            setFileId(init.fileId);

            const getBlob = (uri: string): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', uri, true);
                    xhr.send(null);
                });
            };

            const blob = await getBlob(file.uri);

            let parts: { ETag: string; PartNumber: number }[] = [];

            if (init.strategy === 'MULTI_PART') {
                const CHUNK_SIZE = 5 * 1024 * 1024;
                const totalParts = Math.ceil(file.size! / CHUNK_SIZE);

                const multipartUrls = await uploadService.getMultipartUrls(init.fileId, totalParts);
                let uploadedBytes = 0;

                for (let i = 0; i < totalParts; i++) {
                    const start = i * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size!);
                    const chunk = blob.slice(start, end, file.mimeType || 'application/octet-stream');

                    const urlData = multipartUrls.find(u => u.partNumber === i + 1);
                    if (!urlData) throw new Error(`Missing URL for part ${i + 1}`);

                    const etag = await uploadService.uploadFileToS3(urlData.url, chunk as any, (chunkProgress) => {
                        const chunkUploaded = (chunk.size * chunkProgress) / 100;
                        const totalUploaded = uploadedBytes + chunkUploaded;
                        const totalProgress = Math.round((totalUploaded / file.size!) * 100);
                        setProgress(totalProgress);
                    });
                    if (!etag) throw new Error(`Failed to upload part ${i + 1}`);

                    parts.push({
                        ETag: etag,
                        PartNumber: i + 1
                    });

                    uploadedBytes += chunk.size;
                    const progress = Math.round((uploadedBytes / file.size!) * 100);
                    setProgress(progress);
                }
            } else {
                if (init.preSignedUrls && init.preSignedUrls.length > 0) {
                    const uploadBlob = blob.slice(0, blob.size, file.mimeType || 'application/octet-stream');
                    await uploadService.uploadFileToS3(init.preSignedUrls[0], uploadBlob as any, (p) => {
                        setProgress(p);
                    });
                } else {
                    throw new Error("No upload URL received");
                }
            }

            // 4. Complete Upload
            await uploadService.completeUpload({
                fileId: init.fileId,
                parts: parts.length > 0 ? parts : undefined
            });

            Alert.alert("Success", "File uploaded successfully!");
            clearFile();

            // Invalidate queries to refresh lists
            queryClient.invalidateQueries({ queryKey: ['files'] });

            return true;
        } catch (e: any) {
            console.error(e);
            Alert.alert("Upload Failed", e.message || "An unknown error occurred");
            return false;
        } finally {
            setUploading(false);
        }
    };

    const pickAndUpload = async (folderId?: string) => {
        const pickedFile = await pickFile();
        if (pickedFile) {
            // Need to set file state synchronously or ensure upload uses the picked file instance
            // Since setFile is async in behaviour regarding next render, we should pass 'pickedFile' state logic carefully.
            // But handleUpload relies on 'file' state. 
            // In React, setting state and reading it immediately often fails in same closure if not careful.
            // However, we can modify handleUpload to accept file as arg? 
            // Better: update handleUpload to allow passing file or use state.

            // For now, let's just make handleUpload take an optional file arg to override state
            // But state needs to be set for UI progress etc.

            // Refactoring handleUpload to accept optional logical file param would be safer for one-shot.
            // But reusing existing handleUpload logic:

            // We can hack it by re-calling the internal logic or by splitting logic.
            // Let's Split: 'uploadFileInternal' that takes file object.

            return await uploadFileInternal(pickedFile, folderId);
        }
    };

    const uploadFileInternal = async (fileToUpload: DocumentPicker.DocumentPickerAsset, folderId?: string) => {
        // This duplicates logic but allows passing file directly
        setFile(fileToUpload); // Update state for UI
        setUploading(true);
        setProgress(0);

        try {
            // ... Copy-paste logic or extract to shared function ...
            // To avoid duplication, I will rewrite handleUpload to take file argument and default to state file

            // 1. Initiate Upload
            const init = await uploadService.initiateUpload({
                filename: fileToUpload.name,
                mimeType: fileToUpload.mimeType || 'application/octet-stream',
                size: fileToUpload.size || 0,
                folderId: folderId
            });
            setFileId(init.fileId);

            const getBlob = (uri: string): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', uri, true);
                    xhr.send(null);
                });
            };

            const blob = await getBlob(fileToUpload.uri);

            let parts: { ETag: string; PartNumber: number }[] = [];

            if (init.strategy === 'MULTI_PART') {
                const CHUNK_SIZE = 5 * 1024 * 1024;
                const totalParts = Math.ceil(fileToUpload.size! / CHUNK_SIZE);

                const multipartUrls = await uploadService.getMultipartUrls(init.fileId, totalParts);
                let uploadedBytes = 0;

                for (let i = 0; i < totalParts; i++) {
                    const start = i * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, fileToUpload.size!);
                    const chunk = blob.slice(start, end, fileToUpload.mimeType || 'application/octet-stream');

                    const urlData = multipartUrls.find(u => u.partNumber === i + 1);
                    if (!urlData) throw new Error(`Missing URL for part ${i + 1}`);

                    const etag = await uploadService.uploadFileToS3(urlData.url, chunk as any, (chunkProgress) => {
                        const chunkUploaded = (chunk.size * chunkProgress) / 100;
                        const totalUploaded = uploadedBytes + chunkUploaded;
                        const totalProgress = Math.round((totalUploaded / fileToUpload.size!) * 100);
                        setProgress(totalProgress);
                    });
                    if (!etag) throw new Error(`Failed to upload part ${i + 1}`);

                    parts.push({
                        ETag: etag,
                        PartNumber: i + 1
                    });

                    uploadedBytes += chunk.size;
                    const progress = Math.round((uploadedBytes / fileToUpload.size!) * 100);
                    setProgress(progress);
                }
            } else {
                if (init.preSignedUrls && init.preSignedUrls.length > 0) {
                    const uploadBlob = blob.slice(0, blob.size, fileToUpload.mimeType || 'application/octet-stream');
                    await uploadService.uploadFileToS3(init.preSignedUrls[0], uploadBlob as any, (p) => {
                        setProgress(p);
                    });
                } else {
                    throw new Error("No upload URL received");
                }
            }

            await uploadService.completeUpload({
                fileId: init.fileId,
                parts: parts.length > 0 ? parts : undefined
            });

            Alert.alert("Success", "File uploaded successfully!");
            clearFile();
            queryClient.invalidateQueries({ queryKey: ['files'] });
            return true;

        } catch (e: any) {
            console.error(e);
            Alert.alert("Upload Failed", e.message || "An unknown error occurred");
            return false;
        } finally {
            setUploading(false);
        }
    }

    const abortUpload = async () => {
        if (fileId) {
            setUploading(false);
            setProgress(0);
            setFile(null);
            await uploadService.abortUpload(fileId);
        }
    };

    // Public wrapper that uses state if no file passed (for upload screen)
    const handleUploadPublic = async (folderId?: string) => {
        if (file) {
            return uploadFileInternal(file, folderId);
        }
    }

    return {
        file,
        uploading,
        progress,
        pickFile,
        clearFile,
        uploadFile: handleUploadPublic,
        pickAndUpload,
        abortUpload
    };
};
