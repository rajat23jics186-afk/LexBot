const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
  it('returns 200 and a success payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /metrics', () => {
  it('returns Prometheus-formatted metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('lexbot_chat_source_total');
  });
});

describe('GET /api-docs', () => {
  it('serves the Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/session', () => {
  it('issues a sessionId and a JWT token', async () => {
    const res = await request(app).post('/api/v1/session');
    expect(res.status).toBe(201);
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.body.data.token).toBeDefined();
  });
});

describe('POST /api/v1/chat without a token', () => {
  it('is rejected with 401', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({ message: 'How do I file an FIR?', sessionId: 'some-session-id-123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/history/:sessionId without a token', () => {
  it('is rejected with 401', async () => {
    const res = await request(app).get('/api/v1/history/some-session-id-123');
    expect(res.status).toBe(401);
  });
});

describe('Unknown route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
  });
});
