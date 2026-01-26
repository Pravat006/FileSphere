import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {



    const router = useRouter()
    useEffect(() => {
        const check = async () => {
            const appLaunched = await AsyncStorage.getItem("hasLaunched")
            if (!appLaunched) {
                await AsyncStorage.setItem("hasLaunched", "true")
                router.replace("/onboarding")
            } else {
                router.replace("/login")
            }

        }
        check()
    }, [])

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" />
        </View>
    )

}