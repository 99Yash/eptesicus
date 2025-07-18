import axios from 'axios';
import { env } from '../env';

const _axios = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

class API {
  async login(email: string, password: string) {
    const response = await _axios.post('/users', {
      email,
      password,
    });

    return response.data;
  }

  async getCurrentUser() {
    const response = await _axios.get('/users');
    return response.data;
  }
}

export const api = new API();
