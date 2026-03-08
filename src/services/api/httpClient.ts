const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8762'
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080'

export class HttpClient {
  private baseURL: string
  defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Add Authorization header if token exists
    const token = localStorage.getItem('tfm_access_token')
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      localStorage.removeItem('tfm_access_token')
      localStorage.removeItem('tfm_refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('display_name')
      localStorage.removeItem('email')
      delete this.defaultHeaders['Authorization']
      delete this.defaultHeaders['X-User-Id']
      sessionStorage.setItem('session_expired', 'true')
      window.location.href = '/login'
      throw new Error('SESSION_EXPIRED')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    })
  }

  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    })
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}

export const httpClient = new HttpClient()
export const setAuthHeader = (userId: string) => {
  httpClient.defaultHeaders['X-User-Id'] = userId
}
export const clearAuthHeader = () => {
  delete httpClient.defaultHeaders['X-User-Id']
  delete httpClient.defaultHeaders['Authorization']
}
export { USE_REAL_API, KEYCLOAK_URL }
