import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendVerificationEmail, reloadUser, getCurrentUser, handleSignOut, deleteCurrentUser } from '@repo/firebase/client';

export default function VerifyEmail() {
    const [isChecking, setIsChecking] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState('');
    const params = useLocalSearchParams();
    const router = useRouter();

    // Get email from params or current user
    useEffect(() => {
        const getEmail = async () => {
            if (params.email) {
                setEmail(params.email as string);
            } else {
                const user = await getCurrentUser();
                if (user?.email) {
                    setEmail(user.email);
                }
            }
        };
        getEmail();
    }, [params.email]);

    const checkVerification = async () => {
        setIsChecking(true);
        try {
            // Reload user data to get fresh verification status
            await reloadUser();
            const user = await getCurrentUser();

            if (user?.emailVerified) {
                // Sign out the user after verification
                await handleSignOut();

                Alert.alert(
                    'Email Verified! ✅',
                    'Your email has been verified successfully. Please log in to continue.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/(auth)/login')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Not Verified Yet',
                    'Please check your email and click the verification link. It may take a few moments to update.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to check verification status');
        } finally {
            setIsChecking(false);
        }
    };

    const resendEmail = async () => {
        setIsResending(true);
        try {
            const result = await sendVerificationEmail();
            if (result.error) {
                Alert.alert('Error', result.error);
            } else {
                Alert.alert('Success', 'Verification email sent! Please check your inbox and spam folder.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend email');
        } finally {
            setIsResending(false);
        }
    };

    const handleCancel = async () => {
        Alert.alert(
            'Cancel Signup?',
            'Are you sure you want to cancel? Your account will be deleted.',
            [
                {
                    text: 'No, Stay',
                    style: 'cancel'
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteCurrentUser();
                            if (result.error) {
                                // If re-authentication is needed or other error, we might needed to handle it
                                // But for now, we just fallback to signout if delete fails or proceed
                                console.error('Failed to delete user:', result.error);
                            }
                            await handleSignOut();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Error canceling signup:', error);
                            await handleSignOut(); // Fallback
                            router.replace('/(auth)/login');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="h-64 bg-primary rounded-b-[40px] items-center justify-center px-6">
                <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
                    <Ionicons name="mail-outline" size={48} color="#22C55E" />
                </View>
                <Text className="text-white text-3xl font-bold mb-2">Verify Your Email</Text>
                <Text className="text-white/90 text-base text-center">
                    We've sent a verification link to
                </Text>
                <Text className="text-white font-semibold text-base mt-1">{email}</Text>
            </View>

            <View className="flex-1 px-6 -mt-8">
                <View className="bg-white rounded-3xl shadow-lg p-6">
                    <View className="mb-6">
                        <Text className="text-gray-800 text-lg font-semibold mb-4">
                            📧 Check Your Email
                        </Text>
                        <View className="space-y-3">
                            <View className="flex-row items-start">
                                <Text className="text-primary text-lg mr-2">1.</Text>
                                <Text className="text-gray-600 flex-1">
                                    Open your email inbox (check spam folder too!)
                                </Text>
                            </View>
                            <View className="flex-row items-start">
                                <Text className="text-primary text-lg mr-2">2.</Text>
                                <Text className="text-gray-600 flex-1">
                                    Click the verification link in the email
                                </Text>
                            </View>
                            <View className="flex-row items-start">
                                <Text className="text-primary text-lg mr-2">3.</Text>
                                <Text className="text-gray-600 flex-1">
                                    Come back here and tap "I've Verified My Email"
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`rounded-2xl py-4 items-center mb-3 ${isChecking ? 'bg-primary/70' : 'bg-primary'}`}
                        onPress={checkVerification}
                        disabled={isChecking || isResending}
                    >
                        {isChecking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-base">I've Verified My Email</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend Button */}
                    <TouchableOpacity
                        className={`rounded-2xl py-4 items-center mb-3 border-2 ${isResending ? 'border-gray-300' : 'border-primary'}`}
                        onPress={resendEmail}
                        disabled={isChecking || isResending}
                    >
                        {isResending ? (
                            <ActivityIndicator color="#22C55E" />
                        ) : (
                            <Text className="text-primary font-semibold text-base">Resend Verification Email</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center my-4">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="mx-4 text-sm text-gray-400">or</Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        className="py-3 items-center"
                        onPress={handleCancel}
                        disabled={isChecking || isResending}
                    >
                        <Text className="text-gray-500 text-sm">Cancel Signup</Text>
                    </TouchableOpacity>

                    {/* Help Text */}
                    <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <Text className="text-blue-800 text-xs ml-2 flex-1">
                                Didn't receive the email? Check your spam folder or try resending. The link expires after 24 hours.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
