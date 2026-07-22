jest.mock('../models/User');
jest.mock('../utils/jwt', () => ({
  signUserToken: jest.fn(() => 'fake.jwt.token'),
}));

const User = require('../models/User');
const authService = require('../services/authService');

describe('authService.register', () => {
  afterEach(() => jest.clearAllMocks());

  it('creates a user and returns a token when email is free', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.hashPassword.mockResolvedValueOnce('hashed_pw');
    User.create.mockResolvedValueOnce({ _id: 'u1', name: 'Rajat', email: 'rajat@example.com' });

    const result = await authService.register({ name: 'Rajat', email: 'rajat@example.com', password: 'pass1234' });

    expect(result.token).toBe('fake.jwt.token');
    expect(result.user.email).toBe('rajat@example.com');
    expect(User.hashPassword).toHaveBeenCalledWith('pass1234');
  });

  it('rejects a duplicate email with 409', async () => {
    User.findOne.mockResolvedValueOnce({ _id: 'existing' });

    await expect(
      authService.register({ name: 'Rajat', email: 'rajat@example.com', password: 'pass1234' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('authService.login', () => {
  afterEach(() => jest.clearAllMocks());

  it('logs in with correct credentials', async () => {
    const fakeUser = {
      _id: 'u1',
      name: 'Rajat',
      email: 'rajat@example.com',
      comparePassword: jest.fn().mockResolvedValueOnce(true),
      save: jest.fn().mockResolvedValueOnce(true),
    };
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(fakeUser) });

    const result = await authService.login({ email: 'rajat@example.com', password: 'pass1234' });

    expect(result.token).toBe('fake.jwt.token');
    expect(fakeUser.save).toHaveBeenCalled(); // lastLoginAt updated
  });

  it('rejects a non-existent email with 401 (not 404 — avoid user enumeration)', async () => {
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(null) });

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'pass1234' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a wrong password with 401', async () => {
    const fakeUser = { comparePassword: jest.fn().mockResolvedValueOnce(false) };
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(fakeUser) });

    await expect(
      authService.login({ email: 'rajat@example.com', password: 'wrongpass' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
