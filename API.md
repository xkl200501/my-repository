# API 文档

本文档描述了校园资源共享平台的API接口。

## 认证相关API

### 注册
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "用户名",
    "college": "计算机学院",
    "major": "计算机科学与技术"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "1",
        "email": "user@example.com",
        "name": "用户名",
        "college": "计算机学院",
        "major": "计算机科学与技术",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      "token": "jwt_token"
    }
  }
  ```

### 登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "1",
        "email": "user@example.com",
        "name": "用户名",
        "college": "计算机学院",
        "major": "计算机科学与技术",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      "token": "jwt_token"
    }
  }
  ```

### 获取当前用户信息
- **URL**: `/api/auth/me`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer jwt_token`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "email": "user@example.com",
      "name": "用户名",
      "college": "计算机学院",
      "major": "计算机科学与技术",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

## 资源相关API

### 获取资源列表
- **URL**: `/api/resources`
- **方法**: `GET`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `category`: 分类
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "resources": [
        {
          "id": "1",
          "title": "资源标题",
          "description": "资源描述",
          "category": "学习资料",
          "fileUrl": "/uploads/file.pdf",
          "fileName": "file.pdf",
          "fileSize": 1024000,
          "fileType": "application/pdf",
          "uploader": {
            "id": "1",
            "name": "用户名"
          },
          "likes": 10,
          "views": 100,
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 100,
      "page": 1,
      "limit": 10
    }
  }
  ```

### 获取资源详情
- **URL**: `/api/resources/:id`
- **方法**: `GET`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "title": "资源标题",
      "description": "资源描述",
      "category": "学习资料",
      "fileUrl": "/uploads/file.pdf",
      "fileName": "file.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "uploader": {
        "id": "1",
        "name": "用户名"
      },
      "likes": 10,
      "views": 100,
      "createdAt": "2024-01-01T00:00:00Z",
      "comments": [
        {
          "id": "1",
          "content": "评论内容",
          "user": {
            "id": "2",
            "name": "评论用户"
          },
          "createdAt": "2024-01-02T00:00:00Z"
        }
      ]
    }
  }
  ```

### 上传资源
- **URL**: `/api/resources`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer jwt_token`
- **请求体** (multipart/form-data):
  - `title`: 资源标题
  - `description`: 资源描述
  - `category`: 资源分类
  - `file`: 文件
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "title": "资源标题",
      "description": "资源描述",
      "category": "学习资料",
      "fileUrl": "/uploads/file.pdf",
      "fileName": "file.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "uploader": {
        "id": "1",
        "name": "用户名"
      },
      "likes": 0,
      "views": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### 点赞资源
- **URL**: `/api/resources/:id/like`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer jwt_token`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "likes": 11
    }
  }
  ```

### 评论资源
- **URL**: `/api/resources/:id/comments`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer jwt_token`
- **请求体**:
  ```json
  {
    "content": "评论内容"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "content": "评论内容",
      "user": {
        "id": "1",
        "name": "用户名"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

## 文件上传API

### 上传文件
- **URL**: `/api/upload`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer jwt_token`
- **请求体** (multipart/form-data):
  - `file`: 文件
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "fileUrl": "/uploads/file.pdf",
      "fileName": "file.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "fileHash": "sha256_hash"
    }
  }
  ```

## 管理员API

### 获取用户列表
- **URL**: `/api/admin/users`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer jwt_token`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "1",
          "email": "user@example.com",
          "name": "用户名",
          "college": "计算机学院",
          "major": "计算机科学与技术",
          "role": "user",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 100,
      "page": 1,
      "limit": 10
    }
  }
  ```

### 获取资源管理列表
- **URL**: `/api/admin/resources`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer jwt_token`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
  - `status`: 状态（pending, approved, rejected）
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "resources": [
        {
          "id": "1",
          "title": "资源标题",
          "description": "资源描述",
          "category": "学习资料",
          "fileUrl": "/uploads/file.pdf",
          "fileName": "file.pdf",
          "fileSize": 1024000,
          "fileType": "application/pdf",
          "uploader": {
            "id": "1",
            "name": "用户名"
          },
          "status": "approved",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 100,
      "page": 1,
      "limit": 10
    }
  }
  ```

### 审核资源
- **URL**: `/api/admin/resources/:id/approve`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer jwt_token`
- **请求体**:
  ```json
  {
    "status": "approved", // 或 "rejected"
    "reason": "审核原因" // 可选
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "status": "approved"
    }
  }
  ```

## 错误响应格式

所有API错误响应都遵循以下格式：

```json
{
  "success": false,
  "message": "错误信息",
  "stack": "错误堆栈（仅在开发环境）"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误
