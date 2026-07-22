jest.mock('../models/User');

const request = require('supertest');
const User = require('../models/User');
const app = require('../server');

describe('POST /api/v1/auth/register', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects a weak password with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Rajat', email: 'rajat@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Rajat', email: 'not-an-email', password: 'pass1234' });

    expect(res.status).toBe(400);
  });

  it('creates an account with valid input', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.hashPassword.mockResolvedValueOnce('hashed');
    User.create.mockResolvedValueOnce({ _id: 'u1', name: 'Rajat', email: 'rajat@example.com' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Rajat', email: 'rajat@example.com', password: 'pass1234' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });
});

describe('GET /api/v1/auth/me', () => {
  it('is rejected with 401 when not logged in', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
