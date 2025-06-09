import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5150/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          success: false,
          message: 'خطا در ارتباط با سرور'
        };

        if (error.response) {
          const data = error.response.data as any;
          apiError.message = data?.message || 'خطای سرور';
          apiError.errors = data?.errors;
        } else if (error.request) {
          apiError.message = 'عدم دسترسی به سرور';
        }

        return Promise.reject({ response: { data: apiError } });
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
