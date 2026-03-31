import { db } from '../db/index'
import { users, insertUserSchema } from '../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { InsertUser } from '../db/schema'

export class UserRepository {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  }

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0] || null
  }

  async create(data: z.infer<typeof insertUserSchema>) {
    const result = await db.insert(users).values(data as unknown as InsertUser).returning()
    return result[0]
  }

  async update(id: string, data: Partial<z.infer<typeof insertUserSchema>>) {
    const result = await db.update(users).set(data as unknown as Partial<InsertUser>).where(eq(users.id, id)).returning()
    return result[0]
  }

  async incrementUploadCount(id: string) {
    const user = await this.findById(id)
    if (!user) return
    await db.update(users).set({ uploadCount: user.uploadCount + 1 }).where(eq(users.id, id))
  }

  async decrementUploadCount(id: string) {
    const user = await this.findById(id)
    if (!user) return
    await db.update(users).set({ uploadCount: Math.max(0, user.uploadCount - 1) }).where(eq(users.id, id))
  }

  async count() {
    const result = await db.select().from(users)
    return result.length
  }
}

export const userRepository = new UserRepository()
