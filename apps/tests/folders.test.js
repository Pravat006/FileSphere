const request = require('supertest');

// Mock Firebase Admin BEFORE importing app
jest.mock('@repo/firebase/admin', () => ({
    adminAuth: {
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'mock-uid', email: 'test@example.com' })
    }
}));

// Mock Redis to avoid connection issues
jest.mock('@/services/redis-service', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true),
        connect: jest.fn().mockResolvedValue(true),
        quit: jest.fn().mockResolvedValue(true),
    }
}));

// Mock db
jest.mock('@/services/db', () => ({
    user: {
        findUnique: jest.fn().mockResolvedValue({
            id: 'user-123',
            firebaseUid: 'mock-uid',
            email: 'test@example.com',
            plan: { id: 'plan-free', storageLimit: 1024000 }
        })
    },
    folder: {
        findMany: jest.fn().mockResolvedValue([{ id: 'folder-1', name: 'Test Folder' }]),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue({ id: 'folder-2', name: 'New Folder' })
    },
    $transaction: jest.fn((promises) => {
        if (Array.isArray(promises)) {
            return Promise.all(promises);
        }
        return promises(); // Fallback for callback style
    })
}));

const app = require('../backend/src/app').default;

describe('Folder API', () => {
    it('should fetch folders for authenticated user', async () => {
        const res = await request(app)
            .get('/api/v0/folder')
            .set('Authorization', 'Bearer mock-token');

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('folders');
        expect(res.body.data.pagination).toHaveProperty('total', 1);
    });

    it('should search for folders', async () => {
        const res = await request(app)
            .get('/api/v0/folder?search=test')
            .set('Authorization', 'Bearer mock-token');

        expect(res.statusCode).toEqual(200);
    });
});
