import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

class RedisClient {
    private static instance: RedisClient | null = null;
    private client!: Redis;

    private constructor() { }

    static async getInstance(): Promise<RedisClient> {
        if (!RedisClient.instance) {
            const c = new RedisClient();
            await c.init();
            RedisClient.instance = c;
        }
        return RedisClient.instance;
    }

    private async init() {
        const url = process.env.REDIS_URL;
        this.client = url ? new Redis(url) : new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number(process.env.REDIS_PORT) || 6379,
        });

        await new Promise<void>((resolve, reject) => {
            const onReady = () => { this.client.off("error", onError); resolve(); };
            const onError = (err: any) => { this.client.off("ready", onReady); reject(err); };
            this.client.once("ready", onReady);
            this.client.once("error", onError);
        });

        this.client.on("error", (err) => console.error("Redis error:", err));
        console.log("⌣ Redis connected");
    }

    async setValue(key: string, value: string, expirySec?: number) {
        return expirySec ? this.client.set(key, value, "EX", expirySec) : this.client.set(key, value);
    }

    async getValue(key: string) {
        return this.client.get(key);
    }

    async deleteValue(key: string) {
        return (await this.client.del(key)) > 0;
    }

    // helper
    async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSec?: number): Promise<T> {
        const raw = await this.client.get(key);
        if (raw) return JSON.parse(raw) as T;
        const value = await factory();
        if (ttlSec) {
            await this.client.set(key, JSON.stringify(value), "EX", ttlSec);
        } else {
            await this.client.set(key, JSON.stringify(value));
        }
        return value;
    }

    async clearAll() { return this.client.flushall(); }
}

export default RedisClient;