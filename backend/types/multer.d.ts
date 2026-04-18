import 'express'
import multer from 'multer'

declare global {
  namespace Express {
    interface Request {
      file?: multer.Multer.File
      files?: multer.Multer.File[]
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}
