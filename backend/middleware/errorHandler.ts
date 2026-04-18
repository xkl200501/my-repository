import { Request, Response, NextFunction } from 'express'

// 自定义错误类
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// 错误处理中间件
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err }
  error.message = err.message

  // 日志记录错误
  console.error('Error:', err)

  // 处理特定错误类型
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    error = new AppError(message, 400)
  }

  if (err.name === 'CastError') {
    const message = `Invalid ${(err as any).path}: ${(err as any).value}`
    error = new AppError(message, 400)
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = new AppError(message, 401)
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = new AppError(message, 401)
  }

  // 处理文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size exceeds limit'
    error = new AppError(message, 413)
  }

  // 发送错误响应
  res.status((error as any).statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 处理中间件
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404)
  next(error)
}
