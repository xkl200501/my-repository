import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'campus-resource-secret-key'

export type AuthRequest = Request & { user?: { userId: string; role: string } }

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    ;(req as AuthRequest).user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' })
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
      ;(req as AuthRequest).user = decoded
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}
