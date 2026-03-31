import {
  ApiResponse,
  PaginatedResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceSearchParams,
  Comment,
  CreateCommentRequest,
  Report,
  CreateReportRequest,
  UploadResponse,
} from '@shared/types/api'
import { API_BASE_URL } from '../config/constants'

class ApiService {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {}
    if (!isFormData) headers['Content-Type'] = 'application/json'
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    return headers
  }

  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
  }

  getToken() {
    return this.token
  }

  // Auth
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<AuthResponse>>
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<AuthResponse>>
  }

  async getMe(): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<User>>
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<User>>
  }

  // Resources
  async getResources(params: ResourceSearchParams = {}): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    const query = new URLSearchParams()
    if (params.keyword) query.set('keyword', params.keyword)
    if (params.course) query.set('course', params.course)
    if (params.college) query.set('college', params.college)
    if (params.resourceType) query.set('resourceType', params.resourceType)
    if (params.sortBy) query.set('sortBy', params.sortBy)
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))
    const res = await fetch(`${API_BASE_URL}/api/resources?${query}`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<PaginatedResponse<Resource>>>
  }

  async getResource(id: string): Promise<ApiResponse<Resource>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource>>
  }

  async createResource(data: CreateResourceRequest): Promise<ApiResponse<Resource>> {
    const res = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<Resource>>
  }

  async updateResource(id: string, data: UpdateResourceRequest): Promise<ApiResponse<Resource>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<Resource>>
  }

  async deleteResource(id: string): Promise<ApiResponse<null>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<null>>
  }

  async getFeaturedResources(): Promise<ApiResponse<Resource[]>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/featured`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource[]>>
  }

  async getMyResources(): Promise<ApiResponse<Resource[]>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/my`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource[]>>
  }

  async getMyFavorites(): Promise<ApiResponse<Resource[]>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/favorites`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource[]>>
  }

  // Interactions
  async likeResource(id: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<{ liked: boolean; likeCount: number }>>
  }

  async favoriteResource(id: string): Promise<ApiResponse<{ favorited: boolean; favoriteCount: number }>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<{ favorited: boolean; favoriteCount: number }>>
  }

  async rateResource(id: string, rating: number): Promise<ApiResponse<{ rating: number; ratingCount: number }>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}/rate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rating }),
    })
    return res.json() as Promise<ApiResponse<{ rating: number; ratingCount: number }>>
  }

  async downloadResource(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${id}/download`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<{ downloadUrl: string }>>
  }

  // Comments
  async getComments(resourceId: string): Promise<ApiResponse<Comment[]>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Comment[]>>
  }

  async createComment(resourceId: string, data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<Comment>>
  }

  async deleteComment(resourceId: string, commentId: string): Promise<ApiResponse<null>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<null>>
  }

  // Reports
  async reportResource(resourceId: string, data: CreateReportRequest): Promise<ApiResponse<Report>> {
    const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/report`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return res.json() as Promise<ApiResponse<Report>>
  }

  // Admin
  async getAdminResources(status?: string): Promise<ApiResponse<Resource[]>> {
    const query = status ? `?status=${status}` : ''
    const res = await fetch(`${API_BASE_URL}/api/admin/resources${query}`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource[]>>
  }

  async approveResource(id: string): Promise<ApiResponse<Resource>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Resource>>
  }

  async rejectResource(id: string, reason?: string): Promise<ApiResponse<Resource>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    })
    return res.json() as Promise<ApiResponse<Resource>>
  }

  async getAdminReports(): Promise<ApiResponse<Report[]>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Report[]>>
  }

  async resolveReport(id: string, action: 'resolve' | 'dismiss'): Promise<ApiResponse<Report>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/reports/${id}/${action}`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<Report>>
  }

  async getAdminStats(): Promise<ApiResponse<{
    totalUsers: number;
    totalResources: number;
    pendingResources: number;
    pendingReports: number;
    totalDownloads: number;
  }>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: this.getHeaders(),
    })
    return res.json() as Promise<ApiResponse<{
      totalUsers: number;
      totalResources: number;
      pendingResources: number;
      pendingReports: number;
      totalDownloads: number;
    }>>
  }

  // File upload
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    })
    return res.json() as Promise<ApiResponse<UploadResponse>>
  }
}

export const apiService = new ApiService()
