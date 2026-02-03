import { Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { formatDate } from "@/helper";
import { IFolder } from "@repo/shared";

const RenderFolderItem = ({ item, onPress, onOptions }: { item: IFolder, onPress: (folder: IFolder) => void, onOptions: (folder: IFolder) => void }) => {
    // Calculate total items (files + subfolders)
    const totalSubFolders = item?.subFolders?.length || 0;
    const totalFiles = item.files?.length || 0;
    const totalItems = totalSubFolders + totalFiles;

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            className="w-[48%] bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-start">
                <IconSymbol name="folder.fill" size={40} color="#FBBF24" />
                <TouchableOpacity
                    onPress={() => onOptions(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="ellipsis" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            <Text className="mt-3 text-base font-semibold text-gray-900" numberOfLines={1}>{item.name}</Text>
            <Text className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{formatDate(item.updatedAt || item.createdAt)}</Text>
        </TouchableOpacity>
    );
};


export default RenderFolderItem;