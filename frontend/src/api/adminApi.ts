import { mockAdmin } from '../mock/adminMock';
import { Admin, AdminResponse, Credentials } from '../types/api';
import { ApiError, apiGet, apiPost } from './client';
import { USE_MOCK } from './config';

let mockSession: Admin | null = null;

export async function getCurrentAdmin(): Promise<Admin | null> {
  if (USE_MOCK) {
    return mockSession;
  }
  try {
    const { admin } = await apiGet<AdminResponse>('/admin/me');
    return admin;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function login(credentials: Credentials): Promise<Admin> {
  if (USE_MOCK) {
    if (credentials.username !== mockAdmin.username) {
      throw new ApiError('Invalid credentials', 401);
    }
    mockSession = mockAdmin;
    return mockAdmin;
  }
  const { admin } = await apiPost<AdminResponse>('/admin/login', credentials);
  return admin;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    mockSession = null;
    return;
  }
  await apiPost('/admin/logout');
}
