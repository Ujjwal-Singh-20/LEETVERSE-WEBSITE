# LeetVerse Official Website

The official repository for the **LeetVerse Website** — a platform for coding, DSA, member portfolios, team domains, project showcases, and event galleries.

---

## 📁 Repository Structure

```
LEETVERSE-WEBSITE/
├── docs/                               # Architecture & Database Schema specs
│   ├── leetverse-website-plan (1).md
│   └── leetverse-db-schema.md
├── backend/                            # Express.js + TypeScript API (Render)
│   ├── src/
│   │   ├── config/                     # Firebase Admin, Cloudinary, Env loaders
│   │   ├── constants/                  # Collections & Error codes
│   │   ├── controllers/                # Public, Admin, Auth & Upload controllers
│   │   ├── middlewares/                # Auth, Zod validation, Rate limits, Multer, Error handler
│   │   ├── routes/                     # Public, Admin & Auth routers
│   │   ├── schemas/                    # Zod validation schemas
│   │   ├── scripts/                    # Vercel Blob Cache Refresh job
│   │   ├── serializers/                # Public allowlist serializers (strips rollNo)
│   │   ├── services/                   # Firestore transactions, Cloudinary integration
│   │   ├── types/                      # TypeScript definitions & interfaces
│   │   └── server.ts                   # Express server entrypoint & /health route
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                           # React (Vite + TypeScript) SPA (Vercel) - [Planned]
│   └── README.md
├── .gitignore                          # Monorepo gitignore
├── firestore.rules                     # Deny-all client rules (defense-in-depth)
├── package.json                        # Root workspace scripts
└── README.md                           # Documentation & quickstart
```

---

## 🛠️ Tech Stack

- **Backend:** Express.js, TypeScript, Node.js (v22+)
- **Database:** Firebase Firestore (accessed exclusively via Firebase Admin SDK)
- **Image Hosting:** Cloudinary
- **Caching:** Vercel Blob (with live direct backend fallback in local dev)
- **Rate Limiting:** `express-rate-limit` (tiered by route sensitivity)
- **Validation:** Zod (server-side input validation)
- **Deployment:** Render (Backend API), Vercel (Frontend SPA)
- **Keep-Alive:** cron-job.org (hitting `GET /health` to prevent Render cold starts)

---

## ⚡ Quickstart — Backend

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` inside `backend/`:

```bash
cp .env.example .env
```

Configure the following variables in `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173,http://localhost:3000

# Firebase Admin Credentials (Option A: Split fields)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY----...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Vercel Blob (Optional for local dev, required for cache refresh job)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Run Development Server

```bash
npm run dev
```

The API will be live at `http://localhost:5000`.

---

## 🌐 API Reference

### Public Routes

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/` | None | API root welcome & endpoint directory |
| `GET` | `/health` | None | Lightweight keep-alive status check |
| `GET` | `/u/:username` | 25 req/min (IP) | **Live** member digital business card (strips `rollNo`) |
| `GET` | `/api/gallery/:slug/images` | 60 req/min (IP) | **Live** fetch of full `images[]` for event popup |
| `GET` | `/api/projects` | 60 req/min (IP) | Direct fallback projects listing |
| `GET` | `/api/gallery` | 60 req/min (IP) | Direct fallback gallery listing |
| `GET` | `/api/members` | 60 req/min (IP) | Direct fallback active members by domain |
| `GET` | `/api/og/:username` | 60 req/min (IP) | Server-rendered OpenGraph meta tags for crawlers |
| `GET` | `/api/og/projects/:slug`| 60 req/min (IP) | Server-rendered OpenGraph meta tags for projects |

### Admin Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/session` | Verifies Firebase Google ID token against `admins` collection |
| `GET` | `/api/admin/me` | Returns authenticated admin profile |

### Admin Protected Routes (Bearer Token + `admins` check)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/members/tree` | Expandable tree view of domains and members |
| `GET` | `/api/admin/usernames/check?username=xyz` | Live username availability check |
| `POST` | `/api/admin/members` | Atomic creation of member doc + username lookup |
| `PATCH` | `/api/admin/members/:domain/:docId` | Single-field autosave on blur (`{ field, value }`) |
| `DELETE` | `/api/admin/members/:domain/:docId` | Hard delete member & username lookup in transaction |
| `GET` | `/api/admin/projects` | List all projects |
| `POST` | `/api/admin/projects` | Create new project |
| `PATCH` | `/api/admin/projects/:slug` | Update project fields |
| `DELETE` | `/api/admin/projects/:slug` | Delete project |
| `GET` | `/api/admin/gallery` | List all gallery events |
| `GET` | `/api/admin/gallery/:slug` | Get event detail with all images |
| `POST` | `/api/admin/gallery` | Create gallery event |
| `PATCH` | `/api/admin/gallery/:slug` | Update gallery event |
| `DELETE` | `/api/admin/gallery/:slug` | Delete gallery event |
| `POST` | `/api/admin/upload/single` | Upload single image to Cloudinary |
| `POST` | `/api/admin/upload/multiple` | Upload up to 10 images to Cloudinary |

---

## 🔒 Standard Error Response Shape

Every error response adheres strictly to the unified JSON schema:

```json
{
  "error": {
    "code": "USERNAME_TAKEN",
    "message": "The username 'aditya-r' is already taken."
  }
}
```

---

## 🔄 Cache Refresh Job

To compile active members, projects, and gallery listings into static JSON blobs and upload them to Vercel Blob:

```bash
npm run cache:generate
```

Outputs generated:
- `members-listing.json`
- `projects-listing.json`
- `gallery-listing.json`

---

## 🛡️ Security & Defense-in-Depth

1. **Client SDK Denied:** `firestore.rules` enforces `allow read, write: if false;` on all collections. All database operations happen server-side via the Firebase Admin SDK.
2. **Rate Limiting:** Protects live read endpoints from scrapers and brute force attacks.
3. **MIME Validation:** Server-side file inspection rejects non-image uploads.
4. **Serializer Allowlists:** `rollNo` and administrative fields are strictly excluded from public responses.
