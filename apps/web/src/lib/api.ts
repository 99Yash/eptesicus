import { env } from 'process';

export class API {
  static async login(email: string, password: string) {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    return response.json();
  }
}
