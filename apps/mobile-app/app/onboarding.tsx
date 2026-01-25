
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
    const router = useRouter();

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving data', error);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <IconSymbol name="paperplane.fill" size={100} color="#4F46E5" />
                <ThemedText type="title" style={styles.title}>
                    Welcome to FileSphere
                </ThemedText>
                <ThemedText style={styles.description}>
                    Manage your files with ease and style. Secure, fast, and always accessible.
                </ThemedText>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <ThemedText style={styles.buttonText}>Get Started</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        justifyContent: 'space-between',
        paddingBottom: 60,
        paddingTop: 100,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    title: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 18,
        opacity: 0.8,
    },
    button: {
        backgroundColor: '#4F46E5', // Indigo-600
        paddingVertical: 16,
        borderRadius: 9999,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
