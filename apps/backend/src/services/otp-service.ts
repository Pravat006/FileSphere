import { ApiError } from "@/utils/api-error"
import { getRedis } from "./redis-service"


// generate otp for a perticular email address , --> which is admin email in this case

const createOTP = async (email: string): Promise<string> => {

    try {
        const Redis = await getRedis()
        const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
        await Redis.setValue(`otp:${email}`, otp, 120)
        return otp
    } catch (error) {
        throw new ApiError(400, "Failed to create OTP")
    }
}

// verify the otp 
// --> verify the admin input otp with the otp from the redis  
const verifyOTP = async (email: string, otpIp: string): Promise<boolean> => {

    const Redis = await getRedis()
    // --> get the otp from redis
    const getOtp = await Redis.getValue(`otp:${email}`)
    if (!getOtp) {
        return false
    }

    if (getOtp === otpIp) {
        await Redis.deleteValue(`otp:${email}`)
        return true
    }
    return false

}

const deleteOTP = async (email: string): Promise<boolean> => {
    const Redis = await getRedis()
    const success = await Redis.deleteValue(`otp:${email}`);
    if (!success) {
        throw new ApiError(400, "Failed to delete otp");
    }
    return true;
}



export {
    createOTP,
    verifyOTP,
    deleteOTP
}