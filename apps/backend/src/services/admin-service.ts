import { ApiError } from "@/interface";
import db from "@/services/db";

interface Admin {
    id: string,
    name: string,
    email: string
}


class AdminService {
    async checKAdminById(adminId: string): Promise<Admin> {
        if (!adminId) {
            console.error("Admin id not found")
        }
        // check the admin from db 
        try {
            const admin = await db.admin.findUnique({
                where: {
                    id: adminId
                },
            })
            return admin
        } catch (error) {
            throw new ApiError(500, "Failed to get Admin")
        }
    }

}


export default new AdminService()

