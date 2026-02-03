import { Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { formatDate, formatSize } from "@/helper";
import { IFile } from "@repo/shared";

const RenderFileItem = ({ item }: { item: IFile }) => (
    <View className="flex-row items-center py-4 border-b border-gray-100">
        <View className={`w-12 h-12 rounded-xl items-center justify-center ${item.mimeType?.startsWith('image') ? 'bg-purple-100' : 'bg-blue-100'}`}>
            {/* @ts-ignore */}
            <IconSymbol name={item.mimeType?.startsWith('image') ? 'photo' : 'doc.text'} size={24} color={item.mimeType?.startsWith('image') ? '#8B5CF6' : '#3B82F6'} />
        </View>
        <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>{item.filename}</Text>
            <Text className="text-sm text-gray-500">{formatSize(item.size)} • {formatDate(item.updatedAt || item.createdAt)}</Text>
        </View>
        <TouchableOpacity className="p-2">
            <IconSymbol name="ellipsis" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    </View>
);

export default RenderFileItem