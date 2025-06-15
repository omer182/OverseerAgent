import { AxiosInstance } from 'axios';
import type { HttpAdapter } from './types.js';

export type { HttpAdapter } from './types.js';

export class AxiosHttpAdapter implements HttpAdapter {
  constructor(private readonly axios: AxiosInstance) {}

  async get<T>(url: string, config?: Record<string, unknown>): Promise<{ data: T }> {
    return this.axios.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<{ data: T }> {
    return this.axios.post<T>(url, data, config);
  }
}
