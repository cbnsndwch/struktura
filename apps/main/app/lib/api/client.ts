/**
 * Base API client utilities for making HTTP requests
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public statusText?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Base API client with error handling and type safety
 */
export class ApiClient {
    private baseUrl: string;
    private isRefreshing = false;
    private refreshPromise: Promise<AuthTokens> | null = null;

    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    private getFullUrl(endpoint: string): string {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Check if we're running on the server-side (SSR)
        if (typeof window === 'undefined') {
            // On server-side, we need absolute URLs
            // Default to localhost:3007 which is the NestJS server port
            const serverBaseUrl = process.env.API_BASE_URL || 'http://localhost:3007';
            return `${serverBaseUrl}${url}`;
        }
        
        // On client-side, relative URLs work fine
        return url;
    }

    private getAuthHeaders(): Record<string, string> {
        // Only try to get auth token on client-side
        if (typeof window !== 'undefined') {
            try {
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    return {
                        'Authorization': `Bearer ${accessToken}`
                    };
                }
            } catch (error) {
                // localStorage access failed, ignore
                console.warn('Failed to access localStorage for auth token:', error);
            }
        }
        return {};
    }

    private async refreshTokens(): Promise<AuthTokens> {
        // If already refreshing, return the existing promise
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        
        const refreshToken = typeof window !== 'undefined' 
            ? localStorage.getItem('refresh_token') 
            : null;

        if (!refreshToken) {
            this.isRefreshing = false;
            throw new ApiError('No refresh token available', 401, 'Unauthorized');
        }

        this.refreshPromise = (async (): Promise<AuthTokens> => {
            try {
                const url = this.getFullUrl('/auth/refresh');
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!response.ok) {
                    throw new ApiError('Failed to refresh token', response.status, response.statusText);
                }

                const tokens: AuthTokens = await response.json();
                
                // Update localStorage with new tokens
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', tokens.accessToken);
                    localStorage.setItem('refresh_token', tokens.refreshToken);
                }

                return tokens;
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    private async requestWithAuth<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        const url = this.getFullUrl(endpoint);
        const authHeaders = this.getAuthHeaders();
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
            ...options,
        });

        // If we get a 401 and have a refresh token, try to refresh and retry once
        if (response.status === 401 && retryCount === 0 && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    await this.refreshTokens();
                    // Retry the request with the new token
                    return this.requestWithAuth<T>(endpoint, options, retryCount + 1);
                } catch {
                    // If refresh fails, clear tokens and redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // You might want to redirect to login page here
                    // window.location.href = '/auth/login';
                    throw new ApiError('Authentication failed', 401, 'Unauthorized');
                }
            }
        }

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // If we can't parse the error, use the default message
            }
            
            throw new ApiError(errorMessage, response.status, response.statusText);
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {} as T;
        }

        try {
            return await response.json();
        } catch {
            throw new ApiError('Failed to parse response as JSON', response.status, response.statusText);
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        return this.requestWithAuth<T>(endpoint, options);
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', ...options });
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });
    }

    async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options });
    }

    /**
     * Check if user is authenticated (has valid tokens)
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        
        try {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            return !!(accessToken && refreshToken);
        } catch {
            return false;
        }
    }

    /**
     * Clear authentication tokens
     */
    clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
}

// Default API client instance
export const apiClient = new ApiClient();