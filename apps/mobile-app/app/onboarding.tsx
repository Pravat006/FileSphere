

import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRef } from "react"

const { width } = Dimensions.get("window")

export default function OnboardingScreen() {
    const router = useRouter();

    const scrollRef = useRef<ScrollView>(null)

    // next slide
    const nextSlide = (index: number) => {
        scrollRef.current?.scrollTo({
            x: width * (index + 1),
            animated: true
        })
    }


    return (
        <View className='flex-1 bg-white'>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
            >
                {/* slide 1 */}
                <View style={{ width }} className="flex-1 items-center justify-center px-8">
                    <Text className="text-2xl font-bold text-center mb-4">
                        Your files shouldn’t live in one device
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-10">
                        Access documents, photos, and important files anytime — from anywhere in the world.
                    </Text>
                    <TouchableOpacity
                        className="bg-black px-10 py-3 rounded-xl"
                        onPress={() => nextSlide(0)}
                    >
                        <Text className="text-white text-base font-semibold">Next</Text>
                    </TouchableOpacity>
                </View>

                {/* slide 2 */}
                <View style={{ width }} className="flex-1 items-center justify-center px-8">
                    <Text className="text-2xl font-bold text-center mb-4">
                        Everything. Safe. Simple.
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-10">
                        Secure cloud storage that keeps your files fast to reach, easy to manage, and always organized.
                    </Text>
                    <TouchableOpacity
                        className="bg-black px-10 py-3 rounded-xl"
                        onPress={() => nextSlide(1)}
                    >
                        <Text className="text-white text-base font-semibold">Next</Text>
                    </TouchableOpacity>
                </View>

                {/* Slide 3 */}
                <View style={{ width }} className="flex-1 items-center justify-center px-8">
                    <Text className="text-2xl font-bold text-center mb-4">
                        Ready to get started?
                    </Text>
                    <Text className="text-base text-gray-500 text-center mb-10">
                        Upload, manage, and share your files in one powerful space.
                    </Text>

                    <TouchableOpacity
                        className="bg-indigo-600 px-10 py-3 rounded-xl mb-4"
                        onPress={() => router.replace("/login")}
                    >
                        <Text className="text-white text-base font-semibold">Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace("/login")}>
                        <Text className="text-indigo-600 text-base font-medium">Sign In</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

