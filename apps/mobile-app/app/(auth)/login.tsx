import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Ionicons } from '@expo/vector-icons';
import { sendVerificationEmail, reloadUser, getCurrentUser } from '@repo/firebase/client';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();

    const { signIn, isLoading, error: authError } = useEmailAuth();
    const { signInWithGoogle, isLoading: isGoogleLoading, error: googleError, isReady } = useGoogleSignIn();

    // Email validation
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    // Password validation
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleEmailLogin = async () => {
        // Validate inputs
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        try {
            const result = await signIn(email, password);
            console.log({ result })
            if (result.error) {
                Alert.alert('Login Failed', result.error);
            } else {
                // Check if email is verified
                const user = await getCurrentUser();
                if (user && !user.emailVerified) {
                    Alert.alert(
                        'Email Not Verified',
                        'Please verify your email address before logging in. Check your inbox for the verification link.',
                        [
                            {
                                text: 'Resend Email',
                                onPress: async () => {
                                    const resendResult = await sendVerificationEmail();
                                    if (resendResult.error) {
                                        Alert.alert('Error', resendResult.error);
                                    } else {
                                        Alert.alert('Success', 'Verification email sent! Please check your inbox.');
                                    }
                                }
                            },
                            {
                                text: 'OK',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error: any) {
            console.error('Login exception:', error);
            Alert.alert('Error', error.message || 'An error occurred during login');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            if (googleError) {
                Alert.alert('Google Sign-In Failed', googleError);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign in with Google');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-primary-light"
        >
            <ScrollView
                contentContainerClassName="flex-grow"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image Section */}
                <View className="h-64 bg-primary rounded-b-[40px] overflow-hidden">
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-white text-4xl font-bold mb-2">FileSphere</Text>
                        <Text className="text-white/90 text-base">Log in to your account</Text>
                    </View>
                </View>

                {/* Form Card */}
                <View className="flex-1 px-6 -mt-8">
                    <View className="bg-white rounded-3xl shadow-lg p-6">
                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
                            <View className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
                                <TextInput
                                    className="text-base text-gray-900"
                                    placeholder="john@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading && !isGoogleLoading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-gray-700 text-sm font-medium">Password</Text>
                                <TouchableOpacity>
                                    <Text className="text-green-600 text-sm font-medium">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 flex-row items-center">
                                <TextInput
                                    className="flex-1 text-base text-gray-900"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isLoading && !isGoogleLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remember Me */}
                        <TouchableOpacity
                            className="flex-row items-center mb-6"
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View className={`w-5 h-5 rounded border-2 ${rememberMe ? 'bg-green-500 border-green-500' : 'border-gray-300'} items-center justify-center mr-2`}>
                                {rememberMe && (
                                    <Ionicons name="checkmark" size={14} color="white" />
                                )}
                            </View>
                            <Text className="text-gray-600 text-sm">Remember me next time</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            className={`rounded-2xl py-4 items-center mb-4 ${isLoading || isGoogleLoading ? 'bg-green-400' : 'bg-green-500'}`}
                            onPress={handleEmailLogin}
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Log in</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center my-4">
                            <View className="flex-1 h-px bg-gray-200" />
                            <Text className="mx-4 text-sm text-gray-400">or</Text>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        {/* Social Login Buttons */}
                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center border-2 border-gray-200 rounded-2xl py-3"
                                onPress={handleGoogleSignIn}
                                disabled={!isReady || isLoading || isGoogleLoading}
                            >
                                {isGoogleLoading ? (
                                    <ActivityIndicator color="#4285F4" />
                                ) : (
                                    <>
                                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                                        <Text className="ml-2 text-gray-700 font-medium text-sm">Continue with Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                <Text className="text-primary-dark font-semibold text-sm">Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}