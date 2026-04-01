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
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {}
    if (!isFormData) headers['Content-Type'] = 'application/json'
    return headers
  }

  // 由于token现在存储在cookie中，不需要手动管理token

  // 通用错误处理
  private handleError(error: any): never {
    if (error instanceof Error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('网络连接失败，请检查网络设置')
      }
      throw error
    }
    throw new Error('未知错误')
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      try {
        const errorData = await response.json()
        throw new Error(errorData.message || `请求失败: ${response.status}`)
      } catch (err) {
        throw new Error(`请求失败: ${response.status}`)
      }
    }
    return response.json() as Promise<ApiResponse<T>>
  }

  // Auth
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<AuthResponse>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<AuthResponse>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<User>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<User>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // Resources
  async getResources(params: ResourceSearchParams = {}): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    try {
      const query = new URLSearchParams()
      if (params.keyword) query.set('keyword', params.keyword)
      if (params.course) query.set('course', params.course)
      if (params.college) query.set('college', params.college)
      if (params.resourceType) query.set('resourceType', params.resourceType)
      if (params.sortBy) query.set('sortBy', params.sortBy)
      if (params.page) query.set('page', String(params.page))
      if (params.pageSize) query.set('pageSize', String(params.pageSize))
      const response = await fetch(`${API_BASE_URL}/api/resources?${query}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<PaginatedResponse<Resource>>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getResource(id: string): Promise<ApiResponse<Resource>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async createResource(data: CreateResourceRequest): Promise<ApiResponse<Resource>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<Resource>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateResource(id: string, data: UpdateResourceRequest): Promise<ApiResponse<Resource>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<Resource>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteResource(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<null>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getFeaturedResources(): Promise<ApiResponse<Resource[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/featured`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getMyResources(): Promise<ApiResponse<Resource[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/my`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getMyFavorites(): Promise<ApiResponse<Resource[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/favorites`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // Interactions
  async likeResource(id: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}/like`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<{ liked: boolean; likeCount: number }>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async favoriteResource(id: string): Promise<ApiResponse<{ favorited: boolean; favoriteCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}/favorite`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<{ favorited: boolean; favoriteCount: number }>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async rateResource(id: string, rating: number): Promise<ApiResponse<{ rating: number; ratingCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}/rate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ rating }),
        credentials: 'include'
      })
      return this.handleResponse<{ rating: number; ratingCount: number }>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async downloadResource(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}/download`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<{ downloadUrl: string }>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // Comments
  async getComments(resourceId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Comment[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async createComment(resourceId: string, data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<Comment>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteComment(resourceId: string, commentId: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<null>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // Reports
  async reportResource(resourceId: string, data: CreateReportRequest): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/report`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      })
      return this.handleResponse<Report>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // Admin
  async getAdminResources(status?: string): Promise<ApiResponse<Resource[]>> {
    try {
      const query = status ? `?status=${status}` : ''
      const response = await fetch(`${API_BASE_URL}/api/admin/resources${query}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async approveResource(id: string): Promise<ApiResponse<Resource>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/approve`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Resource>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async rejectResource(id: string, reason?: string): Promise<ApiResponse<Resource>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/reject`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason }),
        credentials: 'include'
      })
      return this.handleResponse<Resource>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAdminReports(): Promise<ApiResponse<Report[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reports`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Report[]>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async resolveReport(id: string, action: 'resolve' | 'dismiss'): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/${id}/${action}`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<Report>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAdminStats(): Promise<ApiResponse<{
    totalUsers: number;
    totalResources: number;
    pendingResources: number;
    pendingReports: number;
    totalDownloads: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: this.getHeaders(),
        credentials: 'include'
      })
      return this.handleResponse<{
        totalUsers: number;
        totalResources: number;
        pendingResources: number;
        pendingReports: number;
        totalDownloads: number;
      }>(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  // File upload
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: formData,
        credentials: 'include'
      })
      return this.handleResponse<UploadResponse>(response)
    } catch (error) {
      this.handleError(error)
    }
  }
}

export const apiService = new ApiService()
