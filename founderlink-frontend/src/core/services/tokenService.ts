export const TokenService = {
  // Access token (short-lived ~1hr)
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),

  // Refresh token (long-lived ~7 days)
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
  removeRefreshToken: () => localStorage.removeItem("refreshToken"),

  // Clear all auth data at once
  clearAll: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};
