import { type User } from '@workspace/db/helpers';
import axios from 'axios';
import { env } from '../env';

const _axios = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true, // Ensures the token cookie is sent and the Set-Cookie header is processed. If baseURL is incorrect (e.g., not matching the backend), the request fails silently.
  headers: {
    'Content-Type': 'application/json',
  },
});

class API {
  async login({
    email,
    name,
    username,
  }: {
    email: string;
    name?: string;
    username?: string;
  }) {
    const response = await _axios.post<{ message: string }>('/auth/login', {
      email,
      name,
      username,
    });

    return response.data;
  }

  async verifyEmail({ email, code }: { email: string; code: string }) {
    const response = await _axios.post<{ user: User; token: string }>(
      '/auth/verify-email',
      {
        email,
        code,
      }
    );
    return response.data;
  }

  async getCurrentUser() {
    try {
      const response = await _axios.get<User>('/users');
      console.log('[api.getCurrentUser] response:', response);
      return response.data;
    } catch (error) {
      console.error('[api.getCurrentUser] error:', error);
      throw error;
    }
  }

  async signout() {
    const response = await _axios.post('/auth/signout');
    return response;
  }

  async checkUsernameAvailability(username: string) {
    const response = await _axios.get<{
      available: boolean;
      message: string;
    }>(`/users/check-username/${username}`);
    return response.data;
  }
}

export const api = new API();
