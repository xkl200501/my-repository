# 部署指南

## 环境要求

- Node.js 18+ 
- PostgreSQL 14+
- Git

## 前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后根据实际情况修改配置：

```bash
cp .env.example .env
```

### 3. 构建项目

```bash
npm run build
```

### 4. 部署到静态服务器

将 `dist` 目录部署到任何静态服务器，如 Nginx、Vercel、Netlify 等。

## 后端部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并添加以下配置：

```env
# 数据库连接信息
DATABASE_URL=postgresql://username:password@localhost:5432/campus_resource_db

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 服务器端口
PORT=3001

# 环境
NODE_ENV=production
```

### 3. 构建项目

```bash
npm run build
```

### 4. 运行数据库迁移

```bash
# 确保数据库已创建
# 运行迁移脚本
```

### 5. 启动服务器

```bash
npm start
```

## Vercel 部署

本项目已配置好 Vercel 部署配置，可直接部署到 Vercel：

1. 登录 Vercel 账号
2. 连接 GitHub 仓库
3. 选择项目根目录进行部署
4. 在环境变量中添加必要的配置

## 数据库配置

### 1. 创建数据库

```sql
CREATE DATABASE campus_resource_db;
```

### 2. 运行迁移

项目使用 Drizzle ORM 进行数据库迁移，迁移文件位于 `backend/db/migrations` 目录。

## 注意事项

1. **安全性**：确保在生产环境中使用强密码和安全的 JWT 密钥
2. **文件存储**：上传的文件存储在 `uploads` 目录，确保该目录有足够的存储空间
3. **CORS 配置**：在生产环境中，建议限制 CORS 来源为特定域名
4. **日志记录**：建议在生产环境中配置更完善的日志记录系统
5. **备份**：定期备份数据库和上传的文件

## 常见问题

### 1. 数据库连接失败

- 检查数据库连接字符串是否正确
- 确保 PostgreSQL 服务正在运行
- 验证数据库用户权限

### 2. 文件上传失败

- 检查 `uploads` 目录是否存在且具有写入权限
- 确保文件大小不超过限制（50MB）
- 验证文件类型是否在允许列表中

### 3. 前端无法连接后端

- 检查 `VITE_API_URL` 环境变量是否正确配置
- 确保后端服务器正在运行
- 验证 CORS 配置是否正确

## 监控和维护

- 定期检查服务器日志
- 监控数据库性能
- 定期清理过期的上传文件
- 更新依赖包以修复安全漏洞
