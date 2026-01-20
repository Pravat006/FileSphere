import { IAdmin, IUser } from "@repo/shared";



declare global {
    namespace Express {
        interface Request {
            user?: Omit<IUser, 'createdAt' | 'updatedAt'>;
            availableStorage?: BigInt;
            admin?: IAdmin
        }
    }
}
declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString()
}