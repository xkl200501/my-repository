import { db } from '../db/index'
import { comments, reports, users, resources, insertCommentSchema, insertReportSchema } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import type { InsertComment, InsertReport } from '../db/schema'

export class CommentRepository {
  async findByResource(resourceId: string) {
    const result = await db
      .select({ comment: comments, userName: users.name, userAvatar: users.avatar })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.resourceId, resourceId))
      .orderBy(desc(comments.createdAt))
    return result.map(r => ({ ...r.comment, userName: r.userName || '', userAvatar: r.userAvatar || undefined }))
  }

  async create(data: z.infer<typeof insertCommentSchema>) {
    const result = await db.insert(comments).values(data as unknown as InsertComment).returning()
    return result[0]
  }

  async delete(id: string) {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning()
    return result.length > 0
  }

  async findById(id: string) {
    const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1)
    return result[0] || null
  }
}

export class ReportRepository {
  async findAll(status?: string) {
    const result = await db
      .select({
        report: reports,
        reporterName: users.name,
        resourceTitle: resources.title,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .leftJoin(resources, eq(reports.resourceId, resources.id))
      .where(status ? eq(reports.status, status) : undefined)
      .orderBy(desc(reports.createdAt))
    return result.map(r => ({
      ...r.report,
      reporterName: r.reporterName || '',
      resourceTitle: r.resourceTitle || '',
    }))
  }

  async create(data: z.infer<typeof insertReportSchema>) {
    const result = await db.insert(reports).values(data as unknown as InsertReport).returning()
    return result[0]
  }

  async updateStatus(id: string, status: string) {
    const result = await db.update(reports).set({ status }).where(eq(reports.id, id)).returning()
    return result[0]
  }

  async pendingCount() {
    const result = await db.select().from(reports).where(eq(reports.status, 'pending'))
    return result.length
  }
}

export const commentRepository = new CommentRepository()
export const reportRepository = new ReportRepository()
