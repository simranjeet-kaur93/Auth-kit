import { LoginResponse, RegisterPayload, TokenPair, UserProfile } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  apiUrl: API_URL,
  register: (payload: RegisterPayload) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyEmail: (token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  verifyMfa: (challengeId: string, code: string) =>
    request<TokenPair>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId, code }),
    }),
  refresh: (refreshToken: string) =>
    request<TokenPair>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  me: (accessToken: string) => request<UserProfile>('/auth/me', { method: 'GET' }, accessToken),
  updateMfa: (
    accessToken: string,
    method: 'email' | 'sms' | 'none',
    phoneNumber?: string,
  ) =>
    request<{ message: string }>('/auth/mfa', {
      method: 'PATCH',
      body: JSON.stringify({ method, phoneNumber }),
    }, accessToken),
};
