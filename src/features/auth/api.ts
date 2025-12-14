import api from '@/lib/api-client';
import type { LoginRequest, LoginResponse, User } from './types';

/**
 * Login user with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials);
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    await api.post('/auth/logout');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me');
}
