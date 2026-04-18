import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { authenticateJWT } from '../middleware/auth'
import { validatePasswordStrength, simulateVirusScan } from '../utils'

const router = Router()

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, uniqueSuffix + ext)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1 // 限制单个请求只能上传一个文件
  },
  fileFilter: (_req, file, cb) => {
    // 允许的文件扩展名
    const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg']
    // 允许的MIME类型
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'image/png',
      'image/jpeg'
    ]
    
    const ext = path.extname(file.originalname).toLowerCase()
    const mimeType = file.mimetype
    
    if (allowedExts.includes(ext) && allowedMimeTypes.includes(mimeType)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件格式或MIME类型'))
    }
  },
})

router.post('/', authenticateJWT, async (req: Request, res: Response, _next: NextFunction) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('文件上传错误:', err)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: '文件大小超过限制（最大50MB）' })
      }
      return res.status(400).json({ success: false, message: err.message || '上传失败' })
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择文件' })
      }
      
      // 模拟病毒扫描
      const hasVirus = await simulateVirusScan(req.file.path)
      if (hasVirus) {
        // 删除包含病毒的文件
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ success: false, message: '文件包含病毒，上传失败' })
      }
      
      // 计算文件哈希值，用于文件完整性校验
      const fileStream = fs.createReadStream(req.file.path)
      const hash = crypto.createHash('sha256')
      
      fileStream.on('data', (data) => {
        hash.update(data)
      })
      
      fileStream.on('end', () => {
        const fileHash = hash.digest('hex')
        const fileUrl = `/uploads/${req.file.filename}`
        
        console.log('文件上传成功:', {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          fileHash: fileHash,
          uploadedBy: req.user?.userId
        })
        
        return res.json({
          success: true,
          data: {
            fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            fileHash: fileHash,
          },
        })
      })
      
      fileStream.on('error', (error) => {
        console.error('文件哈希计算错误:', error)
        return res.status(500).json({ success: false, message: '文件处理失败' })
      })
    } catch (error) {
      console.error('上传处理错误:', error)
      return res.status(500).json({ success: false, message: '上传失败' })
    }
  })
})

export default router
