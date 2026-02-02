import { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/themed-text';
import { uploadService } from '@/services/upload.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadScreen() {
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
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to pick file");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(0);

        console.log({ file });


        try {
            // 1. Initiate Upload
            const init = await uploadService.initiateUpload({
                filename: file.name,
                mimeType: file.mimeType || 'application/octet-stream',
                size: file.size || 0,
            });
            setFileId(init.fileId)
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
                console.log({ multipartUrls });
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
            setFile(null);
            setProgress(0);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Upload Failed", e.message || "An unknown error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleAbortUpload = async () => {
        setUploading(false);
        setProgress(0);
        setFile(null);
        await uploadService.abortUpload(fileId!);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-4">
                <ThemedText type="title">Upload File</ThemedText>
            </View>

            <ScrollView contentContainerClassName="p-5 flex-grow">
                {/* Upload Area */}
                {!file ? (
                    <TouchableOpacity
                        onPress={pickFile}
                        activeOpacity={0.7}
                        className="border-2 border-dashed border-gray-300 rounded-3xl h-64 items-center justify-center bg-gray-50 mb-8"
                    >
                        <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                            <IconSymbol name="cloud.fill" size={40} color="#0a7ea4" />
                        </View>
                        <ThemedText type="defaultSemiBold" className="text-gray-700 mb-2">
                            Tap to browse files
                        </ThemedText>
                        <ThemedText className="text-gray-400 text-sm">
                            Documents, Images, Audio, Video
                        </ThemedText>
                    </TouchableOpacity>
                ) : (
                    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
                                    <IconSymbol name="doc.fill" size={24} color="#666" />
                                </View>
                                <View className="flex-1">
                                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                                        {file.name}
                                    </ThemedText>
                                    <ThemedText className="text-gray-500 text-xs">
                                        {formatSize(file.size || 0)}
                                    </ThemedText>
                                </View>
                            </View>
                            {!uploading && (
                                <TouchableOpacity onPress={() => setFile(null)} className="p-2">
                                    <IconSymbol name="xmark.seal.fill" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {(uploading || progress > 0) && (
                            <View className="mb-2">
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                                    <View
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </View>
                                <View className="flex-row justify-between mt-1">
                                    <ThemedText className="text-xs text-gray-500">
                                        {uploading ? 'Uploading...' : 'Completed'}
                                    </ThemedText>
                                    <ThemedText className="text-xs text-gray-500 font-bold">
                                        {progress}%
                                    </ThemedText>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <View className="flex-row flex-wrap gap-4 mb-8">
                    <View className="flex-1 bg-blue-50 p-4 rounded-xl">
                        <IconSymbol name="shield.fill" size={24} color="#0a7ea4" style={{ marginBottom: 8 }} />
                        <ThemedText type="defaultSemiBold" className="text-blue-900 text-sm mb-1">Secure</ThemedText>
                        <ThemedText className="text-blue-700 text-xs">Your files are encrypted and safe.</ThemedText>
                    </View>
                    <View className="flex-1 bg-purple-50 p-4 rounded-xl">
                        <IconSymbol name="bolt.fill" size={24} color="#7c3aed" style={{ marginBottom: 8 }} />
                        <ThemedText type="defaultSemiBold" className="text-purple-900 text-sm mb-1">Fast</ThemedText>
                        <ThemedText className="text-purple-700 text-xs">Lightning fast global uploads.</ThemedText>
                    </View>
                </View>

                {file && !uploading && (
                    <TouchableOpacity
                        onPress={handleUpload}
                        className="bg-primary py-4 rounded-2xl items-center shadow-md shadow-blue-200"
                    >
                        <ThemedText className="text-white font-bold text-lg">
                            Upload Now
                        </ThemedText>
                    </TouchableOpacity>
                )}

                {uploading && (
                    <TouchableOpacity
                        onPress={handleAbortUpload}
                        className="bg-red-500 py-4 rounded-2xl items-center shadow-md shadow-blue-200"
                    >
                        <ThemedText className="text-white font-bold text-lg">
                            Cancel Upload
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}