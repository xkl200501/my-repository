-- Initial migration: create all tables

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "avatar" text,
  "role" text NOT NULL DEFAULT 'student',
  "college" text,
  "major" text,
  "bio" text,
  "upload_count" integer NOT NULL DEFAULT 0,
  "favorite_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "resources" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" text NOT NULL,
  "description" text,
  "file_url" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL DEFAULT 0,
  "file_type" text NOT NULL DEFAULT '',
  "resource_type" text NOT NULL DEFAULT 'other',
  "course" text,
  "college" text,
  "tags" text[] DEFAULT '{}',
  "uploader_id" text NOT NULL REFERENCES "users"("id"),
  "status" text NOT NULL DEFAULT 'approved',
  "like_count" integer NOT NULL DEFAULT 0,
  "download_count" integer NOT NULL DEFAULT 0,
  "favorite_count" integer NOT NULL DEFAULT 0,
  "rating" real NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "likes" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "favorites" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ratings" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "rating" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "reporter_id" text NOT NULL REFERENCES "users"("id"),
  "reason" text NOT NULL,
  "description" text,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "downloads" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" text REFERENCES "users"("id"),
  "resource_id" text NOT NULL REFERENCES "resources"("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_college ON resources(college);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_resource ON likes(resource_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
