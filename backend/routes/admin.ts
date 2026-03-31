import { Router, Request, Response } from 'express'
import { resourceRepository } from '../repositories/resources'
import { reportRepository } from '../repositories/interactions'
import { userRepository } from '../repositories/users'
import { authenticateJWT, AuthRequest } from '../middleware/auth'

const router = Router()

function requireAdmin(req: Request, res: Response, next: () => void) {
  const role = (req as AuthRequest).user?.role
  if (role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' })
  next()
}

router.use(authenticateJWT)
router.use(requireAdmin)

// Get stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalResources, totalDownloads, pendingReports] = await Promise.all([
      userRepository.count(),
      resourceRepository.totalCount(),
      resourceRepository.totalDownloads(),
      reportRepository.pendingCount(),
    ])
    const pendingResult = await resourceRepository.findAll({ status: 'pending', pageSize: 1 })
    return res.json({
      success: true,
      data: {
        totalUsers,
        totalResources,
        totalDownloads,
        pendingResources: pendingResult.total,
        pendingReports,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取统计失败' })
  }
})

// Get resources for admin
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const result = await resourceRepository.findAll({ status: status || undefined, pageSize: 100 })
    return res.json({ success: true, data: result.items })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取资源失败' })
  }
})

// Approve resource
router.post('/resources/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const resource = await resourceRepository.update(id, { status: 'approved' })
    return res.json({ success: true, data: resource })
  } catch (err) {
    return res.status(500).json({ success: false, message: '审核失败' })
  }
})

// Reject resource
router.post('/resources/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const resource = await resourceRepository.update(id, { status: 'rejected' })
    return res.json({ success: true, data: resource })
  } catch (err) {
    return res.status(500).json({ success: false, message: '拒绝失败' })
  }
})

// Get reports
router.get('/reports', async (_req: Request, res: Response) => {
  try {
    const reports = await reportRepository.findAll()
    return res.json({ success: true, data: reports })
  } catch (err) {
    return res.status(500).json({ success: false, message: '获取举报失败' })
  }
})

// Resolve report
router.post('/reports/:id/resolve', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const report = await reportRepository.updateStatus(id, 'resolved')
    return res.json({ success: true, data: report })
  } catch (err) {
    return res.status(500).json({ success: false, message: '处理失败' })
  }
})

// Dismiss report
router.post('/reports/:id/dismiss', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const report = await reportRepository.updateStatus(id, 'dismissed')
    return res.json({ success: true, data: report })
  } catch (err) {
    return res.status(500).json({ success: false, message: '处理失败' })
  }
})

export default router
