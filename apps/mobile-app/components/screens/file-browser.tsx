import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IFile, IFolder } from '@repo/shared';
import RenderFolderItem from '@/components/files/render-folder-item';
import RenderFileItem from '@/components/files/render-file-item';
import { useFileManager } from '@/hooks/use-file-manager';
import { InputModal } from '@/components/ui/input-modal';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useDebounce } from '@/hooks/use-debounce';
import { FileListSkeleton } from '@/components/skeletons/file-list-skeleton';
import { FolderGridSkeleton } from '@/components/skeletons/folder-grid-skeleton';

interface FileBrowserProps {
    folderId?: string | null;
    title?: string;
}

export default function FileBrowser({ folderId, title }: FileBrowserProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'files' | 'folders'>('files');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'rename'>('create');
    const [selectedItem, setSelectedItem] = useState<IFolder | IFile | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const {
        files: filesData,
        folders: foldersData,
        isLoading,
        createFolder,
        renameFolder,
        deleteFolder,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useFileManager({
        folderId: folderId,
        searchQuery: debouncedSearchQuery,
        activeType: activeTab
    });

    const { pickAndUpload, uploading: isFileUploading, progress: uploadProgress } = useFileUpload();

    const displayedFolders = useMemo(() => {
        if (!foldersData) return [];
        const folders = Array.isArray(foldersData) ? foldersData : (foldersData as any).folders || [];
        return folders;
    }, [foldersData]);

    const displayedFiles = useMemo(() => {
        if (!filesData) return [];
        return filesData;
    }, [filesData]);

    const handleFolderClick = (folder: IFolder) => {
        router.push({
            pathname: '/folder/[id]',
            params: { id: folder.id, name: folder.name }
        });
    };

    const handleUpload = async () => {
        const success = await pickAndUpload(folderId || undefined);
        if (success) {
            setActiveTab('files');
        }
    };

    const handleAdd = () => {
        Alert.alert(
            "Add New",
            "Choose an option",
            [
                { text: "Upload File", onPress: handleUpload },
                {
                    text: "Create Folder",
                    onPress: () => {
                        setModalMode('create');
                        setSelectedItem(null);
                        setModalVisible(true);
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleFolderOptions = (folder: IFolder) => {
        Alert.alert(
            folder.name,
            "Choose an option",
            [
                {
                    text: "Rename",
                    onPress: () => {
                        setSelectedItem(folder);
                        setModalMode('rename');
                        setModalVisible(true);
                    }
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Delete Folder",
                            `Are you sure you want to delete "${folder.name}"? This action cannot be undone.`,
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await deleteFolder(folder.id);
                                        } catch (error: any) {
                                            console.error("Delete folder error:", error);
                                            Alert.alert("Error", error.message || "Failed to delete folder");
                                        }
                                    }
                                }
                            ]
                        );
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleModalConfirm = async (value: string) => {
        setIsModalLoading(true);
        try {
            if (modalMode === 'create') {
                await createFolder({ name: value, parentFolderId: folderId || undefined });
                setActiveTab('folders');
            } else if (modalMode === 'rename' && selectedItem) {
                await renameFolder({ id: selectedItem.id, name: value });
            }
            setModalVisible(false);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.message || `Failed to ${modalMode} folder`);
        } finally {
            setIsModalLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header Actions */}
            <View className="px-6 pt-2 pb-4">
                <View className={`flex-row ${title ? 'justify-between' : 'justify-end'} items-center mb-4`}>
                    {title && (
                        <Text className="text-3xl font-bold text-gray-900" numberOfLines={1}>{title}</Text>
                    )}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setIsSearchVisible(!isSearchVisible)}
                            disabled={isFileUploading}
                            className={`p-2 rounded-full border border-gray-100 ${isSearchVisible ? 'bg-primary border-primary' : 'bg-gray-50'} ${isFileUploading ? 'opacity-50' : ''}`}
                        >
                            <IconSymbol name="magnifyingglass" size={24} color={isSearchVisible ? 'white' : '#374151'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAdd}
                            disabled={isFileUploading}
                            className={`p-2 bg-primary rounded-full shadow-sm shadow-blue-500/30 ${isFileUploading ? 'opacity-50' : ''}`}
                        >
                            {/* @ts-ignore */}
                            <IconSymbol name="plus" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Upload Progress Indicator */}
                {isFileUploading && (
                    <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="ml-3 text-blue-700 font-semibold">Uploading file...</Text>
                            </View>
                            <Text className="text-blue-600 font-bold">{uploadProgress}%</Text>
                        </View>
                        <View className="h-2 bg-blue-100 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Search Input */}
                {isSearchVisible && (
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-2 border border-gray-100">
                        <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search in folder..."
                            className="flex-1 ml-3 text-gray-700 text-base"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <IconSymbol name="xmark.circle.fill" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Tabs */}
            <View className="px-6 flex-row mb-6 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => setActiveTab('files')}
                    disabled={isFileUploading}
                    className={`pb-3 mr-8 border-b-2 ${activeTab === 'files' ? 'border-primary' : 'border-transparent'} ${isFileUploading ? 'opacity-50' : ''}`}
                >
                    <Text className={`text-lg font-semibold ${activeTab === 'files' ? 'text-primary' : 'text-gray-400'}`}>Files</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('folders')}
                    disabled={isFileUploading}
                    className={`pb-3 border-b-2 ${activeTab === 'folders' ? 'border-primary' : 'border-transparent'} ${isFileUploading ? 'opacity-50' : ''}`}
                >
                    <Text className={`text-lg font-semibold ${activeTab === 'folders' ? 'text-primary' : 'text-gray-400'}`}>Folders</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="flex-1 px-6">
                {isLoading && !isFetchingNextPage && !filesData && !foldersData ? (
                    <View className="flex-1">
                        {activeTab === 'files' ? <FileListSkeleton /> : <FolderGridSkeleton />}
                    </View>
                ) : (
                    <>
                        {activeTab === 'files' ? (
                            <FlatList
                                key="files-list"
                                data={displayedFiles}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <RenderFileItem item={item} />}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                onEndReached={() => {
                                    if (hasNextPage && !isFetchingNextPage) {
                                        fetchNextPage();
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={() => (
                                    isFetchingNextPage ? (
                                        <View className="py-4">
                                            <ActivityIndicator size="small" color="#3B82F6" />
                                        </View>
                                    ) : null
                                )}
                                ListEmptyComponent={() => (
                                    <View className="items-center justify-center mt-20">
                                        <IconSymbol name="doc.text" size={60} color="#E9E7EB" />
                                        <Text className="text-gray-400 mt-4 text-center">No files found</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <FlatList
                                key="folders-grid"
                                data={displayedFolders}
                                keyExtractor={item => item.id}
                                numColumns={2}
                                columnWrapperStyle={{ justifyContent: 'space-between' }}
                                renderItem={({ item }) => (
                                    <RenderFolderItem
                                        item={item}
                                        onPress={handleFolderClick}
                                        onOptions={handleFolderOptions}
                                    />
                                )}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                ListEmptyComponent={() => (
                                    <View className="items-center justify-center mt-20">
                                        <IconSymbol name="folder.fill" size={60} color="#E5E7EB" />
                                        <Text className="text-gray-400 mt-4 text-center">No folders found</Text>
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}
            </View>

            <InputModal
                visible={modalVisible}
                title={modalMode === 'create' ? "Create New Folder" : "Rename Folder"}
                description={modalMode === 'create' ? "Enter a name for the new folder" : "Enter a new name for this folder"}
                initialValue={modalMode === 'rename' && selectedItem ? ('name' in selectedItem ? selectedItem.name : selectedItem.filename) : ''}
                placeholder="Folder Name"
                confirmText={modalMode === 'create' ? "Create" : "Rename"}
                onConfirm={handleModalConfirm}
                onCancel={() => setModalVisible(false)}
                isLoading={isModalLoading}
            />
        </View>
    );
}
