const request = require('supertest');
// Use the compiled app or use ts-jest to transpile on the fly
const app = require('../backend/src/app').default;

describe('Auth API', () => {
    it('should return 200 for health check', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'health check hit from backend');
    });

    it('should return 401 for /me without token', async () => {
        const res = await request(app).get('/api/v0/auth/me');
        expect(res.statusCode).toEqual(401);
    });

    afterAll(async () => {
        // Import redis from backend services
        const { redis } = require('../backend/src/services/redis-service');
        await redis.quit();
    });
});
