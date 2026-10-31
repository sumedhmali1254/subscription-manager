/**
 * RECURIX — API Layer Entry Point
 * 
 * Exports all endpoint constants and the configured Axios client.
 * Import from this file when connecting to the backend.
 * 
 * Usage:
 *   import { apiClient, AUTH_ENDPOINTS } from '../api';
 *   const res = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password });
 */

export { default as apiClient } from '../services/api';
export * from './endpoints';

