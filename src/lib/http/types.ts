export interface HttpAdapter {
    get<T>(url: string, config?: Record<string, unknown>): Promise<{ data: T }>;
    post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<{ data: T }>;
}
