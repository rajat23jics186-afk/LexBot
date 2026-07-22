const { sendMessageSchema } = require('../validators/chatValidators');
const validate = require('../middleware/validate');

function mockReqRes(body = {}, params = {}, query = {}) {
  const req = { body, params, query };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('sendMessageSchema', () => {
  it('accepts a valid message payload', () => {
    const result = sendMessageSchema.safeParse({
      body: { message: 'How do I file an FIR?', sessionId: 'a-valid-session-id-1234' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty message', () => {
    const result = sendMessageSchema.safeParse({
      body: { message: '   ', sessionId: 'a-valid-session-id-1234' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing sessionId', () => {
    const result = sendMessageSchema.safeParse({ body: { message: 'hello' } });
    expect(result.success).toBe(false);
  });

  it('rejects an overly long message', () => {
    const result = sendMessageSchema.safeParse({
      body: { message: 'a'.repeat(2001), sessionId: 'a-valid-session-id-1234' },
    });
    expect(result.success).toBe(false);
  });
});

describe('validate middleware', () => {
  it('calls next() and normalizes body on valid input', () => {
    const { req, res, next } = mockReqRes({ message: 'hello there', sessionId: 'session-id-1234' });

    validate(sendMessageSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.message).toBe('hello there');
  });

  it('responds 400 with field errors on invalid input', () => {
    const { req, res, next } = mockReqRes({ message: '' });

    validate(sendMessageSchema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.details.length).toBeGreaterThan(0);
  });
});
