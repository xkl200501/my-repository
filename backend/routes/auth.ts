import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { userRepository } from '../repositories/users'
import { authenticateJWT } from '../middleware/auth'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'campus-resource-secret-key'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  college: z.string().optional(),
  major: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }
    const { email, password, name, college, major } = parsed.data

    const existing = await userRepository.findByEmail(email)
    if (existing) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'student' as const,
      college: college || null,
      major: major || null,
    })

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      success: true,
      data: { user: { ...userWithoutPassword, uploadCount: 0, favoriteCount: 0 } },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: '注册失败' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: '请输入有效的邮箱和密码' })
    }
    const { email, password } = parsed.data

    const user = await userRepository.findByEmail(email)
    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' })
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({ success: true, data: { user: userWithoutPassword } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: '登录失败' })
  }
})

router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const user = await userRepository.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    const { password: _, ...userWithoutPassword } = user
    return res.json({ success: true, data: userWithoutPassword })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取用户信息失败' })
  }
})

router.put('/profile', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const { name, college, major, bio } = req.body as { name?: string; college?: string; major?: string; bio?: string }
    const user = await userRepository.update(userId, { name, college, major, bio })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    const { password: _, ...userWithoutPassword } = user
    return res.json({ success: true, data: userWithoutPassword })
  } catch (err) {
    return res.status(500).json({ success: false, message: '更新失败' })
  }
})

export default router
