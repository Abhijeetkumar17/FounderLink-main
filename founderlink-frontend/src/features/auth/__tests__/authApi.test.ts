import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axiosConfig module (which is the axios instance)
vi.mock('../../../core/interceptors/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../../../core/interceptors/axiosConfig';
import { login, register, refreshToken } from '../api/authApi';

const mockedApi = vi.mocked(api);

describe('Auth API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: login
  // ═══════════════════════════════════════════════════════════

  it('should call POST /auth/login with correct payload', async () => {
    const mockResponse = { data: { data: { token: 'abc', role: 'ROLE_FOUNDER' } } };
    mockedApi.post.mockResolvedValue(mockResponse);

    const result = await login({ email: 'test@test.com', password: 'password123' });

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result).toEqual(mockResponse);
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: register
  // ═══════════════════════════════════════════════════════════

  it('should call POST /auth/register with correct payload', async () => {
    const registerData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      password: 'Pass123!',
      role: 'ROLE_FOUNDER',
    };
    const mockResponse = { data: { data: { userId: 1, message: 'Registered' } } };
    mockedApi.post.mockResolvedValue(mockResponse);

    const result = await register(registerData);

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', registerData);
    expect(result).toEqual(mockResponse);
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: refreshToken
  // ═══════════════════════════════════════════════════════════

  it('should call POST /auth/refresh with refresh token data', async () => {
    const refreshData = { refreshToken: 'old-refresh-token' };
    const mockResponse = { data: { data: { token: 'new-access', refreshToken: 'new-refresh' } } };
    mockedApi.post.mockResolvedValue(mockResponse);

    const result = await refreshToken(refreshData);

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/refresh', refreshData);
    expect(result).toEqual(mockResponse);
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception: Network error
  // ═══════════════════════════════════════════════════════════

  it('should propagate errors from login API', async () => {
    mockedApi.post.mockRejectedValue(new Error('Network Error'));

    await expect(login({ email: 'a', password: 'b' })).rejects.toThrow('Network Error');
  });

  it('should propagate errors from register API', async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 409, data: { message: 'Email exists' } } });

    await expect(register({ email: 'dup@test.com' })).rejects.toEqual(
      expect.objectContaining({ response: expect.objectContaining({ status: 409 }) }),
    );
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Empty payload
  // ═══════════════════════════════════════════════════════════

  it('should call API even with empty payload', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await login({});
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {});
  });
});
