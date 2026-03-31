// Shared API types used by both frontend and backend

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  college?: string;
  major?: string;
  bio?: string;
  uploadCount: number;
  favoriteCount: number;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  college?: string;
  major?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Resource types
export type ResourceType = 'courseware' | 'notes' | 'exam' | 'assignment' | 'other';
export type ResourceStatus = 'pending' | 'approved' | 'rejected';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  resourceType: ResourceType;
  course?: string;
  college?: string;
  tags: string[];
  uploaderId: string;
  uploaderName: string;
  uploaderAvatar?: string;
  status: ResourceStatus;
  likeCount: number;
  downloadCount: number;
  favoriteCount: number;
  rating: number;
  ratingCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  resourceType: ResourceType;
  course?: string;
  college?: string;
  tags?: string[];
}

export interface UpdateResourceRequest {
  title?: string;
  description?: string;
  resourceType?: ResourceType;
  course?: string;
  college?: string;
  tags?: string[];
}

export interface ResourceSearchParams {
  keyword?: string;
  course?: string;
  college?: string;
  resourceType?: ResourceType;
  sortBy?: 'newest' | 'popular' | 'rating';
  page?: number;
  pageSize?: number;
}

// Comment types
export interface Comment {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Report types
export interface Report {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CreateReportRequest {
  reason: string;
  description?: string;
}

// Upload types
export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}
