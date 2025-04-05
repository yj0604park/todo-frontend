import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { components } from '../types/api';

// API 응답 타입
type Todo = components['schemas']['TodoResponse'];
type TodoCreate = components['schemas']['TodoCreate'];
type TodoUpdate = components['schemas']['TodoUpdate'];
type TaskCreate = components['schemas']['TaskCreate'];
type TaskUpdate = components['schemas']['TaskUpdate'];
type SubtaskCreate = components['schemas']['SubtaskCreate'];
type SubtaskUpdate = components['schemas']['SubtaskUpdate'];
type User = components['schemas']['User'];
type UserCreate = components['schemas']['UserCreate'];
type Token = components['schemas']['Token'];
type HealthResponse = Record<string, any>;
type DbHealthResponse = Record<string, any>;
type SystemHealthResponse = Record<string, any>;

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  
  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }
  
  // 인증 관련 메서드
  async login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.client.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    this.token = response.data.access_token;
    localStorage.setItem('token', this.token);
    
    return response.data;
  }
  
  async register(userData: UserCreate): Promise<User> {
    const response = await this.client.post<User>('/auth/register', userData);
    return response.data;
  }
  
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }
  
  // Todo 관련 메서드
  async getTodos(params?: { skip?: number; limit?: number; completed?: boolean }): Promise<Todo[]> {
    const response = await this.client.get<Todo[]>('/todos/', { params });
    return response.data;
  }
  
  async getTodo(todoId: string): Promise<Todo> {
    const response = await this.client.get<Todo>(`/todos/${todoId}`);
    return response.data;
  }
  
  async createTodo(todo: TodoCreate): Promise<Todo> {
    const response = await this.client.post<Todo>('/todos/', todo);
    return response.data;
  }
  
  async updateTodo(todoId: string, todo: TodoUpdate): Promise<Todo> {
    const response = await this.client.put<Todo>(`/todos/${todoId}`, todo);
    return response.data;
  }
  
  async deleteTodo(todoId: string): Promise<void> {
    await this.client.delete(`/todos/${todoId}`);
  }
  
  // Task 관련 메서드
  async addTask(todoId: string, task: TaskCreate): Promise<Todo> {
    const response = await this.client.post<Todo>(`/todos/${todoId}/tasks`, task);
    return response.data;
  }
  
  async updateTask(todoId: string, taskIndex: number, task: TaskUpdate): Promise<Todo> {
    const response = await this.client.put<Todo>(`/todos/${todoId}/tasks/${taskIndex}`, task);
    return response.data;
  }
  
  async deleteTask(todoId: string, taskIndex: number): Promise<Todo> {
    const response = await this.client.delete<Todo>(`/todos/${todoId}/tasks/${taskIndex}`);
    return response.data;
  }
  
  // Subtask 관련 메서드
  async addSubtask(todoId: string, taskIndex: number, subtask: SubtaskCreate): Promise<Todo> {
    const response = await this.client.post<Todo>(`/todos/${todoId}/tasks/${taskIndex}/subtasks`, subtask);
    return response.data;
  }
  
  async updateSubtask(todoId: string, taskIndex: number, subtaskIndex: number, subtask: SubtaskUpdate): Promise<Todo> {
    const response = await this.client.put<Todo>(
      `/todos/${todoId}/tasks/${taskIndex}/subtasks/${subtaskIndex}`,
      subtask
    );
    return response.data;
  }
  
  async deleteSubtask(todoId: string, taskIndex: number, subtaskIndex: number): Promise<Todo> {
    const response = await this.client.delete<Todo>(
      `/todos/${todoId}/tasks/${taskIndex}/subtasks/${subtaskIndex}`
    );
    return response.data;
  }
  
  // 시스템 상태 관련 메서드
  async getHealthStatus(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health/');
    return response.data;
  }
  
  async getDbHealth(): Promise<DbHealthResponse> {
    const response = await this.client.get<DbHealthResponse>('/health/db');
    return response.data;
  }
  
  async getSystemHealth(): Promise<SystemHealthResponse> {
    const response = await this.client.get<SystemHealthResponse>('/health/system');
    return response.data;
  }
  
  // 토큰 관리
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }
  
  getToken(): string | null {
    return this.token;
  }
  
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }
  
  // 초기화 메서드
  initialize() {
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
    }
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();
apiClient.initialize();

export default apiClient; 