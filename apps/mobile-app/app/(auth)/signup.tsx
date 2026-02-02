import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const router = useRouter();

    const { signUp, isLoading, error } = useEmailAuth();

    const handleSignup = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!agreeToTerms) {
            Alert.alert('Error', 'Please agree to the terms of use');
            return;
        }

        try {
            const result = await signUp(email, password, fullName);

            if (result.error) {
                Alert.alert('Signup Failed', "Email already in use");
            } else {
                // Redirect to verification screen
                router.replace({
                    pathname: '/(auth)/verify-email',
                    params: { email }
                });
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during signup');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-primary-dark/20"
        >
            <ScrollView
                contentContainerClassName="flex-grow"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image Section */}
                <View className="h-64 bg-primary-dark rounded-b-[40px] overflow-hidden">
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-white text-4xl font-bold mb-2">FileSphere</Text>
                        <Text className="text-white/90 text-base">Create an account</Text>
                    </View>
                </View>

                {/* Form Card */}
                <View className="flex-1 px-6 -mt-8">
                    <View className="bg-white rounded-3xl shadow-lg p-6">
                        {/* Full Name Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 text-sm font-medium mb-2">Full Name</Text>
                            <View className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
                                <TextInput
                                    className="text-base text-gray-900"
                                    placeholder="John Doe"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="words"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 text-sm font-medium mb-2">Your Email Address</Text>
                            <View className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
                                <TextInput
                                    className="text-base text-gray-900"
                                    placeholder="john@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 text-sm font-medium mb-2">Choose a Password</Text>
                            <View className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 flex-row items-center">
                                <TextInput
                                    className="flex-1 text-base text-gray-900"
                                    placeholder="min 8 characters"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isLoading}
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

                        {/* Terms Agreement */}
                        <TouchableOpacity
                            className="flex-row items-start mb-6"
                            onPress={() => setAgreeToTerms(!agreeToTerms)}
                        >
                            <View className={`w-5 h-5 rounded border-2 ${agreeToTerms ? 'bg-green-500 border-green-500' : 'border-gray-300'} items-center justify-center mr-2 mt-0.5`}>
                                {agreeToTerms && (
                                    <Ionicons name="checkmark" size={14} color="white" />
                                )}
                            </View>
                            <Text className="text-gray-600 text-sm flex-1">
                                I agree with <Text className="text-green-600 font-medium">terms of use</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            className={`rounded-2xl py-4 items-center mb-4 ${isLoading ? 'bg-green-400' : 'bg-green-500'}`}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Sign in</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center my-4">
                            <View className="flex-1 h-px bg-gray-200" />
                            <Text className="mx-4 text-sm text-gray-400">or</Text>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center border-2 border-gray-200 rounded-2xl py-3"
                                disabled
                            >
                                <Ionicons name="logo-google" size={20} color="#4285F4" />
                                <Text className="ml-2 text-gray-700 font-medium text-sm">Continue with Google</Text>
                            </TouchableOpacity>


                        </View>

                        <View className="flex-row justify-center">
                            <Text className="text-gray-600 text-sm">Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text className="text-green-600 font-semibold text-sm">Log in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
