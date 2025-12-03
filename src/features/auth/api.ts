import apiClient from '@/lib/axios';
import type { LoginRequest, LoginResponse, User } from './types';

/**
 * Login user with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    await apiClient.post('/auth/logout');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
}
