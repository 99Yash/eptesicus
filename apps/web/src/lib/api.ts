import {
  type Issue,
  type IssueCreateType,
  type IssueUpdateType,
  type Organization,
  type User,
} from '@workspace/db/helpers';
import axios from 'axios';
import { env } from '../env';

// Frontend-specific type that excludes user_id (handled by backend)
export type CreateIssueData = IssueCreateType;

const _axios = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true, // Ensures the token cookie is sent and the Set-Cookie header is processed. If baseURL is incorrect (e.g., not matching the backend), the request fails silently.
  headers: {
    'Content-Type': 'application/json',
  },
});

class API {
  /* -------------------- Organization -------------------- */
  async listOrganizations() {
    const response = await _axios.get<Organization[]>('/organizations');
    return response.data;
  }

  async createOrganization(data: {
    name: string;
    logo_url?: string;
    bio?: string;
  }) {
    const response = await _axios.post<Organization>('/organizations', data);
    return response.data;
  }

  /* -------------------- Auth -------------------- */
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

  // Issue-related methods
  async createIssue(data: CreateIssueData) {
    console.log('[api.createIssue] Sending request:', data);
    const response = await _axios.post<Issue>('/issues', data);
    console.log('[api.createIssue] Response:', response.data);
    return response.data;
  }

  async getIssue(id: string) {
    console.log('[api.getIssue] Fetching issue:', id);
    const response = await _axios.get<Issue>(`/issues/${id}`);
    console.log('[api.getIssue] Response:', response.data);
    return response.data;
  }

  async listIssues(params?: { organization_id?: string }) {
    console.log('[api.listIssues] Fetching issues with params:', params);
    const response = await _axios.get<Issue[]>('/issues', { params });
    console.log('[api.listIssues] Response:', response.data);
    return response.data;
  }

  async updateIssue(id: string, data: IssueUpdateType) {
    console.log('[api.updateIssue] Updating issue:', id, data);
    const response = await _axios.put<Issue>(`/issues/${id}`, data);
    console.log('[api.updateIssue] Response:', response.data);
    return response.data;
  }

  async deleteIssue(id: string) {
    console.log('[api.deleteIssue] Deleting issue:', id);
    await _axios.delete(`/issues/${id}`);
    console.log('[api.deleteIssue] Issue deleted successfully');
  }
}

export const api = new API();
