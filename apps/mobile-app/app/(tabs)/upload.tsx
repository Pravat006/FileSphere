import { View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFileUpload } from '@/hooks/use-file-upload';

export default function UploadScreen() {
    const {
        file,
        pickFile,
        uploadFile,
        clearFile,
        uploading,
        progress,
        abortUpload
    } = useFileUpload();

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
                                <TouchableOpacity onPress={clearFile} className="p-2">
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
                        onPress={() => uploadFile()}
                        className="bg-primary py-4 rounded-2xl items-center shadow-md shadow-blue-200"
                    >
                        <ThemedText className="text-white font-bold text-lg">
                            Upload Now
                        </ThemedText>
                    </TouchableOpacity>
                )}

                {uploading && (
                    <TouchableOpacity
                        onPress={abortUpload}
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