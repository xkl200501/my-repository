import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'campus-resource-secret-key'

export type AuthRequest = Request & { user?: { userId: string; role: string } }

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined
  
  // 从cookie中获取token
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token
  }
  // 从Authorization头中获取token（向后兼容）
  else {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' })
    }
    token = authHeader.split(' ')[1]
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    ;(req as AuthRequest).user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' })
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  let token: string | undefined
  
  // 从cookie中获取token
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token
  }
  // 从Authorization头中获取token（向后兼容）
  else {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
      ;(req as AuthRequest).user = decoded
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}
