import { describe, it, expect, beforeEach } from 'vitest';
import { TokenService } from '../tokenService';

describe('TokenService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  //  Access Token
  // ═══════════════════════════════════════════════════════════

  describe('Access Token (getToken / setToken / removeToken)', () => {
    it('should return null when no token is stored', () => {
      expect(TokenService.getToken()).toBeNull();
    });

    it('should store and retrieve a token', () => {
      TokenService.setToken('my-jwt-token');
      expect(TokenService.getToken()).toBe('my-jwt-token');
    });

    it('should overwrite an existing token', () => {
      TokenService.setToken('old-token');
      TokenService.setToken('new-token');
      expect(TokenService.getToken()).toBe('new-token');
    });

    it('should remove the token', () => {
      TokenService.setToken('to-be-removed');
      TokenService.removeToken();
      expect(TokenService.getToken()).toBeNull();
    });

    it('should handle removeToken when no token exists (no-op)', () => {
      expect(() => TokenService.removeToken()).not.toThrow();
      expect(TokenService.getToken()).toBeNull();
    });

    // Boundary: empty string token
    it('should store an empty string token without throwing', () => {
      TokenService.setToken('');
      expect(TokenService.getToken()).toBe('');
    });

    // Boundary: very long token
    it('should handle very long token strings', () => {
      const longToken = 'x'.repeat(10000);
      TokenService.setToken(longToken);
      expect(TokenService.getToken()).toBe(longToken);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Refresh Token
  // ═══════════════════════════════════════════════════════════

  describe('Refresh Token (getRefreshToken / setRefreshToken / removeRefreshToken)', () => {
    it('should return null when no refresh token is stored', () => {
      expect(TokenService.getRefreshToken()).toBeNull();
    });

    it('should store and retrieve a refresh token', () => {
      TokenService.setRefreshToken('my-refresh-token');
      expect(TokenService.getRefreshToken()).toBe('my-refresh-token');
    });

    it('should remove the refresh token', () => {
      TokenService.setRefreshToken('to-remove');
      TokenService.removeRefreshToken();
      expect(TokenService.getRefreshToken()).toBeNull();
    });

    // Boundary: tokens don't collide with each other
    it('should not collide with access token', () => {
      TokenService.setToken('access-token-value');
      TokenService.setRefreshToken('refresh-token-value');
      expect(TokenService.getToken()).toBe('access-token-value');
      expect(TokenService.getRefreshToken()).toBe('refresh-token-value');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  clearAll
  // ═══════════════════════════════════════════════════════════

  describe('clearAll', () => {
    it('should remove token, refreshToken, and user from localStorage', () => {
      TokenService.setToken('access');
      TokenService.setRefreshToken('refresh');
      localStorage.setItem('user', JSON.stringify({ userId: 1 }));

      TokenService.clearAll();

      expect(TokenService.getToken()).toBeNull();
      expect(TokenService.getRefreshToken()).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should not throw when localStorage is already empty', () => {
      expect(() => TokenService.clearAll()).not.toThrow();
    });

    // Edge case: unrelated keys should survive clearAll
    it('should preserve non-auth localStorage keys', () => {
      localStorage.setItem('unrelated-key', 'keep-me');
      TokenService.setToken('access');

      TokenService.clearAll();

      expect(localStorage.getItem('unrelated-key')).toBe('keep-me');
    });
  });
});
