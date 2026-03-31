import { Router, Request, Response } from 'express'
import { resourceRepository } from '../repositories/resources'
import { commentRepository, reportRepository } from '../repositories/interactions'
import { userRepository } from '../repositories/users'
import { authenticateJWT, optionalAuth, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

// Get featured resources
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const items = await resourceRepository.getFeatured()
    return res.json({ success: true, data: items })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取推荐资源失败' })
  }
})

// Get my resources
router.get('/my', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const result = await resourceRepository.findAll({ uploaderId: userId, status: undefined })
    return res.json({ success: true, data: result.items })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取我的资源失败' })
  }
})

// Get my favorites
router.get('/favorites', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const items = await resourceRepository.getUserFavorites(userId)
    return res.json({ success: true, data: items })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取收藏失败' })
  }
})

// Search/list resources
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string | undefined
    const course = req.query.course as string | undefined
    const college = req.query.college as string | undefined
    const resourceType = req.query.resourceType as string | undefined
    const sortBy = req.query.sortBy as string | undefined
    const page = req.query.page ? Number(req.query.page) : 1
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12
    const result = await resourceRepository.findAll({
      keyword,
      course,
      college,
      resourceType,
      sortBy,
      page,
      pageSize,
    })
    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: '搜索资源失败' })
  }
})

// Get single resource
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    const resource = await resourceRepository.findById(req.params.id as string, userId)
    if (!resource) return res.status(404).json({ success: false, message: '资源不存在' })
    return res.json({ success: true, data: resource })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取资源失败' })
  }
})

// Create resource
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const { title, description, fileUrl, fileName, fileSize, fileType, resourceType, course, college, tags } = req.body as {
      title: string
      description?: string
      fileUrl: string
      fileName: string
      fileSize?: number
      fileType?: string
      resourceType?: string
      course?: string
      college?: string
      tags?: string[]
    }
    const resource = await resourceRepository.create({
      title,
      description,
      fileUrl,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || '',
      resourceType: (resourceType as 'courseware' | 'notes' | 'exam' | 'assignment' | 'other') || 'other',
      course,
      college,
      tags: tags || [],
      uploaderId: userId,
      status: 'approved',
    })
    await userRepository.incrementUploadCount(userId)
    return res.json({ success: true, data: resource })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: '上传资源失败' })
  }
})

// Update resource
router.put('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    const resource = await resourceRepository.findById(req.params.id as string)
    if (!resource) return res.status(404).json({ success: false, message: '资源不存在' })
    if (resource.uploaderId !== userId) return res.status(403).json({ success: false, message: '无权限修改' })
    const { title, description, resourceType, course, college, tags } = req.body as {
      title?: string
      description?: string
      resourceType?: string
      course?: string
      college?: string
      tags?: string[]
    }
    const updated = await resourceRepository.update(req.params.id as string, {
      title,
      description,
      resourceType: resourceType as 'courseware' | 'notes' | 'exam' | 'assignment' | 'other' | undefined,
      course,
      college,
      tags,
    })
    return res.json({ success: true, data: updated })
  } catch (err) {
    return res.status(500).json({ success: false, message: '更新资源失败' })
  }
})

// Delete resource
router.delete('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    const userRole = (req as AuthRequest).user?.role
    const resource = await resourceRepository.findById(req.params.id as string)
    if (!resource) return res.status(404).json({ success: false, message: '资源不存在' })
    if (resource.uploaderId !== userId && userRole !== 'admin') return res.status(403).json({ success: false, message: '无权限删除' })
    await resourceRepository.delete(req.params.id as string)
    await userRepository.decrementUploadCount(resource.uploaderId)
    return res.json({ success: true, data: null })
  } catch (err) {
    return res.status(500).json({ success: false, message: '删除资源失败' })
  }
})

// Like resource
router.post('/:id/like', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const result = await resourceRepository.toggleLike(userId, req.params.id as string)
    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: '操作失败' })
  }
})

// Favorite resource
router.post('/:id/favorite', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const result = await resourceRepository.toggleFavorite(userId, req.params.id as string)
    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: '操作失败' })
  }
})

// Rate resource
router.post('/:id/rate', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const rating = Number((req.body as { rating: number }).rating)
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: '评分范围为1-5' })
    const result = await resourceRepository.rateResource(userId, req.params.id as string, rating)
    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: '评分失败' })
  }
})

// Download resource
router.post('/:id/download', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    const resource = await resourceRepository.findById(req.params.id as string)
    if (!resource) return res.status(404).json({ success: false, message: '资源不存在' })
    await resourceRepository.recordDownload(userId, req.params.id as string)
    return res.json({ success: true, data: { downloadUrl: resource.fileUrl } })
  } catch (err) {
    return res.status(500).json({ success: false, message: '下载失败' })
  }
})

// Get comments
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const comments = await commentRepository.findByResource(req.params.id as string)
    return res.json({ success: true, data: comments })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取评论失败' })
  }
})

// Create comment
router.post('/:id/comments', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const schema = z.object({ content: z.string().min(1).max(500) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, message: '评论内容不能为空' })
    const comment = await commentRepository.create({
      resourceId: req.params.id as string,
      userId,
      content: parsed.data.content,
    })
    return res.json({ success: true, data: comment })
  } catch (err) {
    return res.status(500).json({ success: false, message: '发表评论失败' })
  }
})

// Delete comment
router.delete('/:id/comments/:commentId', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    const comment = await commentRepository.findById(req.params.commentId as string)
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' })
    if (comment.userId !== userId) return res.status(403).json({ success: false, message: '无权限删除' })
    await commentRepository.delete(req.params.commentId as string)
    return res.json({ success: true, data: null })
  } catch (err) {
    return res.status(500).json({ success: false, message: '删除评论失败' })
  }
})

// Report resource
router.post('/:id/report', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '未授权' })
    const schema = z.object({ reason: z.string().min(1), description: z.string().optional() })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, message: '请填写举报原因' })
    const report = await reportRepository.create({
      resourceId: req.params.id as string,
      reporterId: userId,
      reason: parsed.data.reason,
      description: parsed.data.description,
      status: 'pending' as const,
    })
    return res.json({ success: true, data: report })
  } catch (err) {
    return res.status(500).json({ success: false, message: '举报失败' })
  }
})

export default router
