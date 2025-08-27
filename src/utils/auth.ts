interface TokenInfo {
  access_token: string;
  refresh_token: string;
}

const TOKEN_KEY = 'token';

export function getToken(): TokenInfo | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? JSON.parse(token) : null;
}

export function setToken(accessToken: string, refreshToken: string): void {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      accessToken,
      refreshToken
    })
  );
}

export function isLogin(): boolean {
  return getToken() !== null;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
