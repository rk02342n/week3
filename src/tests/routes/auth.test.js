const request = require('supertest');
const express = require('express');

// const router = require('../../routes/auth.js');

describe('GET /me', () => {
    let app;
    const setupApp = () => {
        app = express();
        app.use(express.json());
        const router = require('../../routes/auth.js'); // re-require after mock
        app.use('/api', router);
    };

    afterEach(() => {
        jest.resetModules(); // important
    });

    it('Should return the userId and username', async () => {
        jest.doMock('../../middleware/requireAuth', () => {
            return (req, res, next) => {
                req.user = { sub: 'mockUserId', username: 'mockUsername' };
                next();
            };
        });
        setupApp();

        const res = await request(app).get('/api/me');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            userId: 'mockUserId',
            username: 'mockUsername'
        });
    });

    it('Should return 401 when unauthorized', async () => {
        jest.doMock('../../middleware/requireAuth', () => {
            return (req, res, next) => {
                return res.status(401).json({ error: 'Unauthorized' });
            };
        });

        setupApp();

        const res = await request(app).get('/api/me');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Unauthorized' });
    });
});
