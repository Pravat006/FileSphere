import { User } from "@repo/shared";

declare global {
    namespace Express {
        interface Request {
            user?: User;
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