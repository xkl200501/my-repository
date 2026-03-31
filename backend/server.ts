import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import resourceRoutes from './routes/resources'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'
import { runMigrations } from './db/index'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

// Serve frontend in production
const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(REACT_BUILD_FOLDER))
app.get('*', (_req, res) => {
  res.sendFile(path.join(REACT_BUILD_FOLDER, 'index.html'))
})

// Start server
async function start() {
  try {
    await runMigrations()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
