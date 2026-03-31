import { db } from '../db/index'
import { resources, likes, favorites, ratings, downloads, users, insertResourceSchema } from '../db/schema'
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import type { InsertResource } from '../db/schema'

export class ResourceRepository {
  async findAll(params: {
    keyword?: string
    course?: string
    college?: string
    resourceType?: string
    sortBy?: string
    status?: string
    page?: number
    pageSize?: number
    uploaderId?: string
  } = {}) {
    const { keyword, course, college, resourceType, sortBy = 'newest', status = 'approved', page = 1, pageSize = 12, uploaderId } = params

    const conditions = []
    if (status) conditions.push(eq(resources.status, status))
    if (keyword) conditions.push(or(ilike(resources.title, `%${keyword}%`), ilike(resources.course, `%${keyword}%`))!)
    if (course) conditions.push(ilike(resources.course, `%${course}%`))
    if (college) conditions.push(eq(resources.college, college))
    if (resourceType) conditions.push(eq(resources.resourceType, resourceType))
    if (uploaderId) conditions.push(eq(resources.uploaderId, uploaderId))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    let orderBy
    if (sortBy === 'popular') orderBy = desc(resources.downloadCount)
    else if (sortBy === 'rating') orderBy = desc(resources.rating)
    else orderBy = desc(resources.createdAt)

    const offset = (page - 1) * pageSize

    const items = await db
      .select({
        resource: resources,
        uploaderName: users.name,
        uploaderAvatar: users.avatar,
      })
      .from(resources)
      .leftJoin(users, eq(resources.uploaderId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset)

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(resources)
      .where(whereClause)

    const total = Number(totalResult[0]?.count || 0)

    return {
      items: items.map(r => ({ ...r.resource, uploaderName: r.uploaderName || '', uploaderAvatar: r.uploaderAvatar || undefined })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: string, userId?: string) {
    const result = await db
      .select({
        resource: resources,
        uploaderName: users.name,
        uploaderAvatar: users.avatar,
      })
      .from(resources)
      .leftJoin(users, eq(resources.uploaderId, users.id))
      .where(eq(resources.id, id))
      .limit(1)

    if (!result[0]) return null

    const resource = { ...result[0].resource, uploaderName: result[0].uploaderName || '', uploaderAvatar: result[0].uploaderAvatar || undefined }

    if (userId) {
      const [likeResult, favResult, ratingResult] = await Promise.all([
        db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.resourceId, id))).limit(1),
        db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, id))).limit(1),
        db.select().from(ratings).where(and(eq(ratings.userId, userId), eq(ratings.resourceId, id))).limit(1),
      ])
      return {
        ...resource,
        isLiked: likeResult.length > 0,
        isFavorited: favResult.length > 0,
        userRating: ratingResult[0]?.rating,
      }
    }

    return resource
  }

  async create(data: z.infer<typeof insertResourceSchema>) {
    const result = await db.insert(resources).values(data as unknown as InsertResource).returning()
    return result[0]
  }

  async update(id: string, data: Partial<z.infer<typeof insertResourceSchema>>) {
    const result = await db.update(resources).set({ ...(data as unknown as Partial<InsertResource>), updatedAt: new Date() }).where(eq(resources.id, id)).returning()
    return result[0]
  }

  async delete(id: string) {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning()
    return result.length > 0
  }

  async getFeatured() {
    const result = await db
      .select({ resource: resources, uploaderName: users.name, uploaderAvatar: users.avatar })
      .from(resources)
      .leftJoin(users, eq(resources.uploaderId, users.id))
      .where(eq(resources.status, 'approved'))
      .orderBy(desc(resources.downloadCount))
      .limit(6)
    return result.map(r => ({ ...r.resource, uploaderName: r.uploaderName || '', uploaderAvatar: r.uploaderAvatar || undefined }))
  }

  async toggleLike(userId: string, resourceId: string) {
    const existing = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.resourceId, resourceId))).limit(1)
    if (existing.length > 0) {
      await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.resourceId, resourceId)))
      await db.update(resources).set({ likeCount: sql`${resources.likeCount} - 1` }).where(eq(resources.id, resourceId))
      const r = await db.select({ likeCount: resources.likeCount }).from(resources).where(eq(resources.id, resourceId)).limit(1)
      return { liked: false, likeCount: r[0]?.likeCount || 0 }
    } else {
      await db.insert(likes).values({ userId, resourceId })
      await db.update(resources).set({ likeCount: sql`${resources.likeCount} + 1` }).where(eq(resources.id, resourceId))
      const r = await db.select({ likeCount: resources.likeCount }).from(resources).where(eq(resources.id, resourceId)).limit(1)
      return { liked: true, likeCount: r[0]?.likeCount || 0 }
    }
  }

  async toggleFavorite(userId: string, resourceId: string) {
    const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId))).limit(1)
    if (existing.length > 0) {
      await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId)))
      await db.update(resources).set({ favoriteCount: sql`${resources.favoriteCount} - 1` }).where(eq(resources.id, resourceId))
      const r = await db.select({ favoriteCount: resources.favoriteCount }).from(resources).where(eq(resources.id, resourceId)).limit(1)
      return { favorited: false, favoriteCount: r[0]?.favoriteCount || 0 }
    } else {
      await db.insert(favorites).values({ userId, resourceId })
      await db.update(resources).set({ favoriteCount: sql`${resources.favoriteCount} + 1` }).where(eq(resources.id, resourceId))
      const r = await db.select({ favoriteCount: resources.favoriteCount }).from(resources).where(eq(resources.id, resourceId)).limit(1)
      return { favorited: true, favoriteCount: r[0]?.favoriteCount || 0 }
    }
  }

  async rateResource(userId: string, resourceId: string, rating: number) {
    const existing = await db.select().from(ratings).where(and(eq(ratings.userId, userId), eq(ratings.resourceId, resourceId))).limit(1)
    if (existing.length > 0) {
      await db.update(ratings).set({ rating }).where(and(eq(ratings.userId, userId), eq(ratings.resourceId, resourceId)))
    } else {
      await db.insert(ratings).values({ userId, resourceId, rating })
    }
    const allRatings = await db.select({ rating: ratings.rating }).from(ratings).where(eq(ratings.resourceId, resourceId))
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    await db.update(resources).set({ rating: avg, ratingCount: allRatings.length }).where(eq(resources.id, resourceId))
    return { rating: avg, ratingCount: allRatings.length }
  }

  async recordDownload(userId: string | undefined, resourceId: string) {
    await db.insert(downloads).values({ userId: userId || null, resourceId })
    await db.update(resources).set({ downloadCount: sql`${resources.downloadCount} + 1` }).where(eq(resources.id, resourceId))
  }

  async getUserFavorites(userId: string) {
    const result = await db
      .select({ resource: resources, uploaderName: users.name, uploaderAvatar: users.avatar })
      .from(favorites)
      .innerJoin(resources, eq(favorites.resourceId, resources.id))
      .leftJoin(users, eq(resources.uploaderId, users.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
    return result.map(r => ({ ...r.resource, uploaderName: r.uploaderName || '', uploaderAvatar: r.uploaderAvatar || undefined, isFavorited: true }))
  }

  async totalCount() {
    const result = await db.select({ count: sql<number>`count(*)` }).from(resources)
    return Number(result[0]?.count || 0)
  }

  async totalDownloads() {
    const result = await db.select({ count: sql<number>`count(*)` }).from(downloads)
    return Number(result[0]?.count || 0)
  }
}

export const resourceRepository = new ResourceRepository()
