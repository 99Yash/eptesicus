import axios from 'axios';
import { env } from '../env';

const _axios = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class API {
  async login(email: string, password: string) {
    const response = await _axios.post('/auth/login', {
      email,
      password,
    });

    return response.data;
  }
}
