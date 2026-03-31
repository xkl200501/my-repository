# 校园资源共享平台

A campus learning resource sharing platform built with React + Tailwind CSS v4 + Express.js + PostgreSQL.

## Project Structure

```
├── frontend/                    # React frontend (Vite + Tailwind v4)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx        # App shell, navigation, routing
│   │   │   ├── HomePage.tsx     # Hero, categories, featured resources
│   │   │   ├── ResourcesView.tsx # Search, filter, sort, paginate resources
│   │   │   ├── ResourceDetailView.tsx # Resource detail, download, like, comment, report
│   │   │   ├── UploadView.tsx   # File upload + resource metadata form
│   │   │   ├── ProfileView.tsx  # User profile, my uploads, my favorites
│   │   │   ├── AdminView.tsx    # Admin dashboard: stats, moderation, reports
│   │   │   └── AuthView.tsx     # Login / Register with school email
│   │   ├── components/ui/       # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── api.ts           # ApiService class (all API calls)
│   │   │   └── utils.ts         # cn() utility
│   │   └── config/constants.ts  # Colleges, resource types, sort options
│   └── index.html
├── backend/
│   ├── server.ts                # Express app entry point
│   ├── routes/
│   │   ├── auth.ts              # POST /register, /login, GET /me, PUT /profile
│   │   ├── resources.ts         # CRUD + like/favorite/rate/download/comment/report
│   │   ├── admin.ts             # Admin stats, resource moderation, report handling
│   │   └── upload.ts            # POST /api/upload (multer, local disk)
│   ├── repositories/
│   │   ├── users.ts             # User CRUD
│   │   ├── resources.ts         # Resource CRUD + interactions
│   │   └── interactions.ts      # Comments + Reports
│   ├── middleware/auth.ts        # JWT authenticateJWT + optionalAuth
│   └── db/
│       ├── index.ts             # Drizzle + postgres.js connection + migrations
│       ├── schema.ts            # All table definitions + Zod schemas
│       └── migrations/
│           └── 1774953743391_init.sql
└── shared/types/api.ts          # Shared TypeScript types (frontend + backend)
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, shadcn/ui, react-router-dom (HashRouter), sonner
- **Backend**: Express.js, TypeScript, Drizzle ORM, postgres.js, bcryptjs, JWT, multer
- **Database**: PostgreSQL
- **Shared**: TypeScript types in `shared/types/api.ts`

## Key Features

1. **User Auth**: Register/login with school email, JWT tokens, role-based (student/teacher/admin)
2. **Resource Upload**: File upload (PDF, DOC, PPT, etc. up to 50MB), metadata tagging
3. **Resource Search**: Keyword search, filter by college/type, sort by newest/popular/rating
4. **Resource Interactions**: Like, favorite, star rating (1-5), download tracking, comments
5. **Content Moderation**: Report resources, admin dashboard for approval/rejection/report handling
6. **Profile**: View uploaded resources, favorites, edit personal info

## API Routes

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /api/resources` - Search/list resources
- `POST /api/resources` - Create resource (auth)
- `GET /api/resources/:id` - Get resource detail
- `PUT /api/resources/:id` - Update resource (owner)
- `DELETE /api/resources/:id` - Delete resource (owner/admin)
- `POST /api/resources/:id/like` - Toggle like
- `POST /api/resources/:id/favorite` - Toggle favorite
- `POST /api/resources/:id/rate` - Rate resource
- `POST /api/resources/:id/download` - Record download
- `GET/POST /api/resources/:id/comments` - Comments
- `POST /api/resources/:id/report` - Report resource
- `GET /api/admin/stats` - Admin stats
- `GET /api/admin/resources` - All resources (admin)
- `POST /api/admin/resources/:id/approve` - Approve
- `POST /api/admin/resources/:id/reject` - Reject
- `GET /api/admin/reports` - All reports
- `POST /api/admin/reports/:id/resolve` - Resolve report
- `POST /api/upload` - Upload file

## Code Generation Guidelines

- All shared types in `shared/types/api.ts`, import with `@shared/types/api`
- Frontend API calls via `apiService` in `frontend/src/lib/api.ts`
- Backend uses repository pattern: routes → repositories → Drizzle
- HashRouter for all navigation, never BrowserRouter
- No localStorage for data - always use backend APIs
