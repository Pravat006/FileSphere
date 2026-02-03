import { SafeAreaView } from 'react-native-safe-area-context';
import FileBrowser from '@/components/screens/file-browser';

export default function FilesScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <FileBrowser folderId={null} title="My Files" />
        </SafeAreaView>
    );
}