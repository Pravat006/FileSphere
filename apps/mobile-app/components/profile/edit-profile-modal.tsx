import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    initialDisplayName?: string | null;
    initialPhotoURL?: string | null;
    onSave: (displayName: string, photoURL: string) => Promise<void>;
}

export function EditProfileModal({ visible, onClose, initialDisplayName, initialPhotoURL, onSave }: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setDisplayName(initialDisplayName || '');
            setPhotoURL(initialPhotoURL || '');
        }
    }, [visible, initialDisplayName, initialPhotoURL]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await onSave(displayName, photoURL);
            onClose();
        } catch (error) {
            console.error('Failed to save profile', error);
            // Optionally handle error state here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center items-center bg-black/50"
            >
                <View className="bg-white mx-4 rounded-3xl p-6 w-[90%] shadow-xl max-w-sm">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                            <IconSymbol name="xmark.seal.fill" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-4 mb-6">
                        <View>
                            <Text className="text-gray-700 font-medium mb-2 text-sm">Display Name</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View>
                            <Text className="text-gray-700 font-medium mb-2 text-sm">Profile Photo URL</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                                value={photoURL}
                                onChangeText={setPhotoURL}
                                placeholder="https://..."
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`bg-primary py-4 rounded-xl items-center flex-row justify-center ${isLoading ? 'opacity-70' : ''}`}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" className="mr-2" />
                        ) : (
                            <IconSymbol name="checkmark.seal.fill" size={20} weight="medium" color="white" style={{ marginRight: 8 }} />
                        )}
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
