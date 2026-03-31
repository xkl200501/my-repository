import { pgTable, text, timestamp, integer, real } from 'drizzle-orm/pg-core'
import { z } from 'zod'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role').notNull().default('student'),
  college: text('college'),
  major: text('major'),
  bio: text('bio'),
  uploadCount: integer('upload_count').notNull().default(0),
  favoriteCount: integer('favorite_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const insertUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  avatar: z.string().nullable().optional(),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
  college: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  uploadCount: z.number().int().optional(),
  favoriteCount: z.number().int().optional(),
  createdAt: z.date().optional(),
})

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

// Resources table
export const resources = pgTable('resources', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull().default(0),
  fileType: text('file_type').notNull().default(''),
  resourceType: text('resource_type').notNull().default('other'),
  course: text('course'),
  college: text('college'),
  tags: text('tags').array().default([]),
  uploaderId: text('uploader_id').notNull().references(() => users.id),
  status: text('status').notNull().default('approved'),
  likeCount: integer('like_count').notNull().default(0),
  downloadCount: integer('download_count').notNull().default(0),
  favoriteCount: integer('favorite_count').notNull().default(0),
  rating: real('rating').notNull().default(0),
  ratingCount: integer('rating_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const insertResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().optional(),
  fileType: z.string().optional(),
  resourceType: z.enum(['courseware', 'notes', 'exam', 'assignment', 'other']).default('other'),
  course: z.string().nullable().optional(),
  college: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  uploaderId: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).default('approved'),
  likeCount: z.number().int().optional(),
  downloadCount: z.number().int().optional(),
  favoriteCount: z.number().int().optional(),
  rating: z.number().optional(),
  ratingCount: z.number().int().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Resource = typeof resources.$inferSelect
export type InsertResource = typeof resources.$inferInsert

// Likes table
export const likes = pgTable('likes', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('user_id').notNull().references(() => users.id),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Like = typeof likes.$inferSelect

// Favorites table
export const favorites = pgTable('favorites', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('user_id').notNull().references(() => users.id),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Favorite = typeof favorites.$inferSelect

// Ratings table
export const ratings = pgTable('ratings', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('user_id').notNull().references(() => users.id),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Rating = typeof ratings.$inferSelect

// Comments table
export const comments = pgTable('comments', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const insertCommentSchema = z.object({
  id: z.string().optional(),
  resourceId: z.string().min(1),
  userId: z.string().min(1),
  content: z.string().min(1).max(500),
  createdAt: z.date().optional(),
})

export type Comment = typeof comments.$inferSelect
export type InsertComment = typeof comments.$inferInsert

// Reports table
export const reports = pgTable('reports', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const insertReportSchema = z.object({
  id: z.string().optional(),
  resourceId: z.string().min(1),
  reporterId: z.string().min(1),
  reason: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(['pending', 'resolved', 'dismissed']).default('pending'),
  createdAt: z.date().optional(),
})

export type Report = typeof reports.$inferSelect
export type InsertReport = typeof reports.$inferInsert

// Downloads table (for tracking)
export const downloads = pgTable('downloads', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('user_id').references(() => users.id),
  resourceId: text('resource_id').notNull().references(() => resources.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Download = typeof downloads.$inferSelect
