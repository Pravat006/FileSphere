import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FileBrowser from '@/components/screens/file-browser';

export default function FolderScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'left', 'right']}>
            <Stack.Screen
                options={{
                    title: name || 'Folder',
                    headerBackTitle: 'Back'

                }}
            />
            <FileBrowser folderId={id} />
        </SafeAreaView>
    );
}
