const { signSessionToken, verifySessionToken } = require('../utils/jwt');
const requireSessionAuth = require('../middleware/auth');

function mockReqRes({ headers = {}, body = {}, params = {} } = {}) {
  const req = { headers, body, params };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('jwt sign/verify', () => {
  it('round-trips a sessionId through sign and verify', () => {
    const token = signSessionToken('session-abc');
    const payload = verifySessionToken(token);
    expect(payload.sessionId).toBe('session-abc');
  });

  it('throws on a tampered token', () => {
    const token = signSessionToken('session-abc');
    expect(() => verifySessionToken(token + 'tampered')).toThrow();
  });
});

describe('requireSessionAuth middleware', () => {
  it('rejects requests with no Authorization header', () => {
    const { req, res, next } = mockReqRes();
    requireSessionAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid token', () => {
    const { req, res, next } = mockReqRes({ headers: { authorization: 'Bearer not-a-real-token' } });
    requireSessionAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a valid token used against a DIFFERENT sessionId (ownership check)', () => {
    const token = signSessionToken('session-owner');
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
      params: { sessionId: 'session-someone-else' },
    });
    requireSessionAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a valid token matching the target sessionId', () => {
    const token = signSessionToken('session-owner');
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
      params: { sessionId: 'session-owner' },
    });
    requireSessionAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.sessionId).toBe('session-owner');
  });
});
