// User related types
interface User {
    id: string;
    firebaseUid: string;
    email: string;
    name: string;
    storageUsed?: BigInt;
    role: 'ADMIN' | 'USER';
    createdAt: Date;
    updatedAt: Date;
}

interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
}


interface UpdateUserRequest {
    name?: string;
    email?: string;
}


interface DeleteUserRequest {
    id: string;
}

export { User, CreateUserRequest, UpdateUserRequest, DeleteUserRequest };