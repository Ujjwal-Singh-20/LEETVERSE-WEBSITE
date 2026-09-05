# LeetVerse Backend API

The Express.js + TypeScript REST API backend for the **LeetVerse Website**, deployed on Render and powered by Firebase Firestore (Admin SDK), Cloudinary, and Vercel Blob.

---

## 📑 Table of Contents

1. [Architecture & Design Principles](#-architecture--design-principles)
2. [File-by-File Codebase Map](#-file-by-file-codebase-map)
3. [Environment Configuration](#-environment-configuration)
4. [NPM Scripts](#-npm-scripts)
5. [Database & Storage Schema](#-database--storage-schema)
6. [Authentication & Authorization Flow](#-authentication--authorization-flow)
7. [API Specification & Endpoints](#-api-specification--endpoints)
8. [Zod Validation Schemas](#-zod-validation-schemas)
9. [Error Handling & Error Codes](#-error-handling--error-codes)
10. [File Uploads (Cloudinary Pipeline)](#-file-uploads-cloudinary-pipeline)
11. [Vercel Blob Caching Architecture](#-vercel-blob-caching-architecture)
12. [Rate Limiting Matrix](#-rate-limiting-matrix)

---

## 🏛 Architecture & Design Principles

1. **Zero Client-Side Database Access (Defense-in-Depth):**
   Client-side Firebase SDK access is completely disabled via `firestore.rules` (`allow read, write: if false;`). All database reads and writes pass exclusively through this Express backend using the privileged `firebase-admin` SDK.
2. **Atomic Username Uniqueness:**
   Usernames are tracked globally in a dedicated flat collection `usernames/{username}`. Member creation and deletion run in Firestore transactions to prevent orphan records or duplicate usernames across different domains.
3. **Domain Partitioning:**
   Members are partitioned by domain under `members/{domain}/members_listed/{docId}`.
4. **Strict Serializer Allowlists:**
   Administrative fields (e.g., student `rollNo`, audit timestamps) are strictly stripped out of public responses (`/u/:username`) via explicit serialization functions.
5. **Vercel Blob CDN Caching with Graceful DB Fallback:**
   Public listing endpoints (`/api/members`, `/api/projects`, `/api/gallery`, `/api/reminders`) prioritize pre-compiled static JSON blobs hosted on Vercel Blob CDN. If the blob token is not configured or a blob request fails, the backend falls back gracefully to live Firestore DB queries. Digital business cards (`/api/u/:username`) and Admin management routes (`/api/admin/*`) always query Firestore directly.

---

## 📂 File-by-File Codebase Map

```
backend/
├── .env.example                               # Environment template
├── package.json                               # Dependencies & build scripts
├── tsconfig.json                              # TypeScript compiler configuration
└── src/
    ├── server.ts                              # Express server setup, CORS, Helmet, 404 & error handlers
    ├── config/
    │   ├── env.ts                             # Zod-validated environment variable loader
    │   ├── firebase.ts                        # Firebase Admin SDK initialization (db & auth exports)
    │   └── cloudinary.ts                      # Cloudinary v2 SDK configuration
    ├── constants/
    │   ├── collections.ts                     # Firestore collection names enum
    │   └── errorCodes.ts                      # Standard application error codes enum
    ├── controllers/
    │   ├── public.controller.ts               # Handlers for /u/:username, fallback listings, OG tags
    │   ├── auth.controller.ts                 # Handlers for /api/admin/session & /api/admin/me
    │   ├── admin.member.controller.ts         # Member tree, username check, member CRUD
    │   ├── admin.project.controller.ts        # Project management CRUD
    │   ├── admin.gallery.controller.ts        # Gallery event management CRUD
    │   ├── admin.reminder.controller.ts       # Reminder CRUD & public active reminders
    │   ├── admin.cache.controller.ts          # On-demand Vercel Blob cache regeneration
    │   └── upload.controller.ts               # Single & multi image uploads to Cloudinary
    ├── middlewares/
    │   ├── auth.middleware.ts                 # requireAdminAuth: Bearer token decode & admins check
    │   ├── error.middleware.ts                # AppError class & global error handler middleware
    │   ├── rateLimiter.ts                     # express-rate-limit instances (tiered by route sensitivity)
    │   ├── upload.middleware.ts               # Multer memory storage & MIME type validation
    │   └── validate.middleware.ts             # Zod validation helpers (validateBody, validateParams, validateQuery)
    ├── routes/
    │   ├── index.ts                           # Root router mounting public, auth, and admin routes
    │   ├── public.routes.ts                   # Public & SEO crawler routes
    │   ├── auth.routes.ts                     # Admin authentication routes (/api/admin/session, /api/admin/me)
    │   └── admin.routes.ts                    # Protected admin CRUD routes (members, projects, gallery, upload, reminders, cache)
    ├── schemas/
    │   ├── auth.schema.ts                     # Zod schema for ID token verification
    │   ├── member.schema.ts                   # Zod schemas for member creation, autosave, query/params
    │   ├── project.schema.ts                  # Zod schemas for project creation & updates
    │   ├── gallery.schema.ts                  # Zod schemas for gallery event creation & updates
    │   └── reminder.schema.ts                 # Zod schemas for mascot reminder scheduling
    ├── scripts/
    │   └── generateCache.ts                   # Script to generate & push 4 static JSON blobs to Vercel Blob
    ├── serializers/
    │   ├── member.serializer.ts               # serializePublicMember (strips rollNo) & serializeAdminMember
    │   ├── project.serializer.ts              # serializeProject with ISO 8601 timestamps
    │   └── gallery.serializer.ts              # serializeGalleryListingItem & serializeGalleryDetail
    ├── services/
    │   ├── auth.service.ts                    # Admin auth verification service against Firestore
    │   ├── member.service.ts                  # Member transactions, domain trees, autosave logic
    │   ├── project.service.ts                 # Project CRUD operations against Firestore
    │   ├── gallery.service.ts                 # Gallery event CRUD operations against Firestore
    │   ├── reminder.service.ts                # Reminder scheduling & active window queries
    │   ├── blobCache.service.ts               # Vercel Blob CDN fetcher with in-memory URL resolution
    │   └── cloudinary.service.ts              # Cloudinary buffer upload streams (single & batch)
    └── types/
        └── index.ts                           # Shared TypeScript interfaces & types
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173,http://localhost:3000

# Firebase Admin Credentials (Option A: Individual Variables)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Firebase Admin Credentials (Option B: JSON Service Account string)
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Vercel Blob (Optional for local dev, outputs to dist/cache/ if omitted)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📜 NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `tsx watch src/server.ts` | Runs the server in hot-reload watch mode on `PORT` (default: 5000) |
| `npm run build` | `tsc` | Compiles TypeScript source to `dist/` |
| `npm start` | `node dist/server.js` | Starts compiled production server on Render |
| `npm run cache:generate` | `tsx src/scripts/generateCache.ts` | Builds `members-listing.json`, `projects-listing.json`, `gallery-listing.json` and pushes to Vercel Blob |

---

## 🗄 Database & Storage Schema

Firestore collection constants are defined in `src/constants/collections.ts`:

### 1. `members/{domain}/members_listed/{docId}`
The member document.
- `{domain}`: Domain slug (e.g. `web-dev`, `app-dev`, `ai-ml`, `cp`, `ui-ux`).
- `{docId}`: Firestore auto-generated ID.

```typescript
interface MemberDoc {
  name: string;             // Full display name
  username: string;         // Unique slug, lowercase alphanumeric + hyphens (e.g. "aditya-r")
  status: 'active' | 'alumni';
  position: string;         // e.g. "Domain Lead", "Core Member"
  bio?: string;             // Default ""
  photoUrl?: string | null; // Cloudinary secure URL
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  rollNo: string;           // Admin-only! Stripped from public responses
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. `usernames/{username}`
Flat lookup index document for O(1) resolution:
```json
{
  "domain": "web-dev",
  "docId": "aBcD1234xYz"
}
```
*Creation, checking, and deletion must execute inside a Firestore transaction.*

### 3. `projects/{slug}`
Project showcase document. `{slug}` is the document ID (e.g., `campus-connect`):
```typescript
interface ProjectDoc {
  slug: string;             // Unique slug
  title: string;
  description: string;
  images: string[];         // Cloudinary URLs (images[0] acts as thumbnail)
  members: Array<{          // Cached snapshot of project contributors
    username: string;
    name: string;
    photoUrl: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. `gallery_events/{slug}`
Event gallery document. `{slug}` is the document ID (e.g., `hackathon-2026`):
```typescript
interface GalleryEventDoc {
  slug: string;             // Unique slug
  eventName: string;
  shortDesc: string;
  thumbnail: string;        // Cloudinary URL included in static listing
  images: string[];         // Full image list — excluded from cached blob, fetched live
  date: Timestamp;          // Date of the event
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. `admins/{docId}`
Admin whitelist for Google OAuth authorization:
```typescript
interface AdminDoc {
  email: string;            // Google account email
  name: string;
  active: boolean;          // Set to false to revoke access immediately
  addedAt: Timestamp;
}
```

### 6. `reminders/{docId}`
Time-windowed reminders surfacing on the mascot:
```typescript
interface ReminderDoc {
  text: string;             // Message displayed in Bracket Buddy speech bubble
  startAt: Timestamp;       // Window start
  endAt: Timestamp;         // Window end (endAt > startAt)
  targetSection?: 'hero' | 'members' | 'projects' | 'gallery' | 'global'; // default: 'global'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔐 Authentication & Authorization Flow

Admin authentication uses **Firebase Auth (Google Sign-In) + Firestore Whitelist**:

1. **Frontend Authentication:** The admin signs in with Google using Firebase Client SDK and receives an `idToken`.
2. **Session Verification (`POST /api/admin/session`):**
   - Frontend sends `{ idToken: "..." }`.
   - `auth.service.ts` calls `firebase-admin.auth().verifyIdToken(idToken)`.
   - Backend queries the `admins` collection for a document where `email == decodedToken.email`.
   - If missing or `active === false`, access is rejected with `403 FORBIDDEN` or `ADMIN_INACTIVE`.
   - Returns `{ user: { uid, email, name, role: 'admin' } }`.
3. **Admin Route Guard (`requireAdminAuth` Middleware):**
   - Checks `Authorization: Bearer <idToken>`.
   - Verifies the token and checks the `admins` collection.
   - Attaches `req.admin = { uid, email, name, docId }` to Express request.

---

## 🌐 API Specification & Endpoints

### Base URL: `http://localhost:5000` (or Render deployment URL)

### 1. System & Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Keep-alive check for cron-job.org / Render cold starts |
| `GET` | `/` | Public | API root status and endpoint directory |

### 2. Public Endpoints

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/api/u/:username` | 25 req/min (IP) | **Live** member digital business card JSON (strips `rollNo`). Always queries Firestore. |
| `GET` | `/u/:username` | 25 req/min (IP) | Direct visit helper: redirects browser to frontend SPA, returns JSON if requested by API client. |
| `GET` | `/api/members` | 60 req/min (IP) | Active members grouped by domain (Vercel Blob priority, live Firestore fallback). |
| `GET` | `/api/projects` | 60 req/min (IP) | Projects showcase listing (Vercel Blob priority, live Firestore fallback). |
| `GET` | `/api/gallery` | 60 req/min (IP) | Events gallery listing (Vercel Blob priority, live Firestore fallback). |
| `GET` | `/api/gallery/:slug/images` | 60 req/min (IP) | **Live** fetch of full `images[]` for event modal popup. |
| `GET` | `/api/reminders` | 60 req/min (IP) | Active mascot reminders (Vercel Blob priority, live Firestore fallback). |
| `GET` | `/api/og/:username` | 60 req/min (IP) | Server-rendered OpenGraph HTML for social link crawlers. |
| `GET` | `/api/og/projects/:slug` | 60 req/min (IP) | Server-rendered OpenGraph HTML for project link crawlers. |

### 3. Admin Authentication

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/admin/session` | Public | 8 req/min (IP) | Body: `{ idToken }`. Validates Google ID token against `admins`. |
| `GET` | `/api/admin/me` | Bearer Token | 100 req/min | Returns authenticated admin profile from `req.admin`. |

### 4. Admin Management (Protected: Bearer Token + `admins` Check)

All endpoints below require `Authorization: Bearer <idToken>`.

#### Member Management
- `GET /api/admin/members/tree` — Complete hierarchy: domains and nested members (includes `rollNo` and `docId`).
- `GET /api/admin/usernames/check?username=aditya-r` — Checks if a username is available (`{ available: boolean, username: string }`).
- `POST /api/admin/members` — Creates member and `usernames/{username}` record in an atomic transaction.
- `PATCH /api/admin/members/:domain/:docId` — Single-field autosave on blur (`{ field: string, value: string | null }`).
- `DELETE /api/admin/members/:domain/:docId` — Atomically deletes member doc and username lookup.

#### Project Management
- `GET /api/admin/projects` — Lists all projects ordered by `createdAt` desc.
- `GET /api/admin/projects/:slug` — Retrieves project by slug.
- `POST /api/admin/projects` — Creates new project.
- `PATCH /api/admin/projects/:slug` — Updates project fields.
- `DELETE /api/admin/projects/:slug` — Deletes project.

#### Gallery Management
- `GET /api/admin/gallery` — Lists all gallery events.
- `GET /api/admin/gallery/:slug` — Retrieves gallery event detail including full `images[]`.
- `POST /api/admin/gallery` — Creates gallery event.
- `PATCH /api/admin/gallery/:slug` — Updates gallery event.
- `DELETE /api/admin/gallery/:slug` — Deletes gallery event.

#### Reminders Management
- `GET /api/admin/reminders` — Lists all reminders (past, active, upcoming) ordered by `startAt` desc.
- `POST /api/admin/reminders` — Creates new reminder with `{ text, startAt, endAt, targetSection? }`.
- `DELETE /api/admin/reminders/:docId` — Deletes reminder.

#### Operational Cache Refresh
- `POST /api/admin/cache/refresh` — Triggers cache generation for all blobs (members, projects, gallery, reminders) directly from Admin UI.

#### Image Uploads
- `POST /api/admin/upload/single?folder=members` — Multipart form field: `image`. Returns `{ url, publicId }`.
- `POST /api/admin/upload/multiple?folder=gallery` — Multipart form field: `images` (up to 10 files). Returns `{ urls, count }`.

---

## 🔍 Zod Validation Schemas

### `POST /api/admin/members` Body Schema
```typescript
{
  domain: string;                // e.g. "web-dev"
  name: string;                  // Non-empty
  username: string;              // Lowercase alphanumeric with hyphens (regex: ^[a-z0-9]+(?:-[a-z0-9]+)*$)
  status: 'active' | 'alumni';
  position: string;              // e.g. "Lead"
  bio?: string;                  // Default ""
  photoUrl?: string | null;      // Valid URL or null
  instagram?: string | null;     // Valid URL or null
  linkedin?: string | null;      // Valid URL or null
  github?: string | null;        // Valid URL or null
  rollNo: string;                // Required for university record
}
```

### `PATCH /api/admin/members/:domain/:docId` Autosave Schema
```typescript
{
  field: 'name' | 'status' | 'position' | 'bio' | 'photoUrl' | 'instagram' | 'linkedin' | 'github' | 'rollNo';
  value: string | null;
}
```

### `POST /api/admin/projects` Body Schema
```typescript
{
  slug: string;                  // e.g. "campus-connect"
  title: string;
  description: string;
  images: string[];              // Array of valid URLs
  members: Array<{
    username: string;
    name: string;
    photoUrl: string;
  }>;
}
```

### `POST /api/admin/gallery` Body Schema
```typescript
{
  slug: string;                  // e.g. "hackathon-2026"
  eventName: string;
  shortDesc: string;
  thumbnail: string;             // Valid URL
  images: string[];              // Array of valid URLs
  date: string;                  // Valid ISO 8601 string (e.g. "2026-03-15T00:00:00.000Z")
}
```

---

## ⚠️ Error Handling & Error Codes

All errors return HTTP status code with the standardized schema:
```json
{
  "error": {
    "code": "USERNAME_TAKEN",
    "message": "Username 'aditya-r' is already taken."
  }
}
```

### Registered Error Codes (`src/constants/errorCodes.ts`)

| Category | HTTP | Error Codes |
|---|---|---|
| **Client / Validation** | 400 | `VALIDATION_ERROR`, `USERNAME_TAKEN`, `INVALID_CREDENTIALS`, `INVALID_FILE_TYPE`, `INVALID_DOMAIN`, `MISSING_REQUIRED_FIELD` |
| **Authentication** | 401 | `UNAUTHORIZED`, `INVALID_TOKEN` |
| **Forbidden** | 403 | `FORBIDDEN`, `ADMIN_INACTIVE` |
| **Not Found** | 404 | `NOT_FOUND`, `MEMBER_NOT_FOUND`, `PROJECT_NOT_FOUND`, `GALLERY_NOT_FOUND`, `USERNAME_NOT_FOUND`, `REMINDER_NOT_FOUND` |
| **Rate Limit** | 429 | `RATE_LIMIT_EXCEEDED` |
| **Server / External** | 500 | `INTERNAL_SERVER_ERROR`, `DATABASE_ERROR`, `UPLOAD_FAILED`, `BLOB_STORAGE_ERROR` |

---

## 🖼 File Uploads (Cloudinary Pipeline)

- **Middleware:** `src/middlewares/upload.middleware.ts` uses `multer.memoryStorage()`.
- **Limits:** Max 10MB per file, max 10 files per batch.
- **Allowed MIME Types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.
- **Target Folders:** Controlled via optional `?folder=` query param (default: `leetverse`). Common folders:
  - `leetverse/members`
  - `leetverse/projects`
  - `leetverse/gallery`
- **Stream Processing:** `cloudinary.service.ts` converts the in-memory buffer into an upload stream directly to Cloudinary without writing temporary files to disk.

---

## ⚡ Vercel Blob Caching Architecture

For maximum public performance and to conserve Firestore read quotas during traffic spikes, public listings are compiled into static JSON documents stored on Vercel Blob CDN.

### Priority Hierarchy:
1. **Blob Priority:** Public endpoints (`/api/members`, `/api/projects`, `/api/gallery`, `/api/reminders`) invoke `BlobCacheService` to fetch the CDN blob first.
2. **Database Fallback:** If `BLOB_READ_WRITE_TOKEN` is unconfigured, the file does not exist yet, or the network request fails, the controller automatically falls back to live Firestore database queries.
3. **Direct Live Reads:** Digital business cards (`/api/u/:username`) and Admin management routes (`/api/admin/*`) always read live from Firestore.

### Static Blobs Produced:
1. `members-listing.json`:
   Contains grouped domains and active members only (strips alumni and university `rollNo`).
2. `projects-listing.json`:
   Projects with precomputed `thumbnail` (`images[0]`) and contributor member snapshots.
3. `gallery-listing.json`:
   Events with date, title, and thumbnail (excluding heavy `images[]` array to keep the listing lightweight).
4. `reminders-listing.json`:
   Active and upcoming mascot announcements.

### Triggering Cache Refresh:
- **Via CLI:**
  ```bash
  npm run cache:generate
  ```
- **Via Admin UI:** Click **"Refresh Static Cache"** under the Cache section in `/admin` (triggers `POST /api/admin/cache/refresh`).

---

## 🚦 Rate Limiting Matrix

Configured via `express-rate-limit` in `src/middlewares/rateLimiter.ts`:

| Route Category | Window | Max Requests | Key Generator | Target Endpoints |
|---|---|---|---|---|
| **Business Card** | 1 min | 25 | Client IP | `GET /u/:username` |
| **Admin Login** | 1 min | 8 | Client IP | `POST /api/admin/session` |
| **General Public** | 1 min | 60 | Client IP | `GET /api/projects`, `GET /api/gallery`, `GET /api/members`, etc. |
| **Admin Operations** | 1 min | 100 | Admin UID (or IP) | All `/api/admin/*` protected routes |
