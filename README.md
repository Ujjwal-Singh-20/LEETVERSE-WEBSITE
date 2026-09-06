# LeetVerse Official Website

The official repository for the **LeetVerse Website** — a web application for member portfolios, team domains, project showcases, event galleries, and club administration.

---

## 📁 Repository Structure

```
LEETVERSE-WEBSITE/
├── docs/                               # Architecture & Database Schema specifications
│   ├── leetverse-website-plan (1).md
│   └── leetverse-db-schema.md
├── backend/                            # Express.js + TypeScript REST API (Node.js 22+)
│   ├── src/
│   │   ├── config/                     # Firebase Admin, Cloudinary, Env loaders
│   │   ├── constants/                  # Collections & Error codes enums
│   │   ├── controllers/                # Public, Admin, Auth, Upload & Reminders controllers
│   │   ├── middlewares/                # Auth, Zod validation, Rate limits, Multer, Error handler
│   │   ├── routes/                     # Public, Admin & Auth routers
│   │   ├── schemas/                    # Zod validation schemas
│   │   ├── scripts/                    # Vercel Blob Cache Refresh job
│   │   ├── serializers/                # Public allowlist serializers (strips rollNo)
│   │   ├── services/                   # Firestore transactions, Cloudinary & Vercel Blob services
│   │   ├── types/                      # TypeScript definitions & interfaces
│   │   └── server.ts                   # Express server entrypoint & /health route
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                       # Comprehensive Backend architecture & API reference
├── frontend/                           # React 18 (Vite + TypeScript) SPA
│   ├── src/
│   │   ├── components/                 # Canvas mesh hero, navigation, mascot, gallery deck, modals
│   │   ├── context/                    # AuthContext (Google Sign-In + Admin token exchange)
│   │   ├── pages/                      # Home, Members, Projects, Gallery, BusinessCard, NotFound, Admin
│   │   ├── services/                   # Axios API service client
│   │   ├── types/                      # Frontend TypeScript interfaces
│   │   └── index.css                   # Atmospheric design tokens & global styling
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md                       # Frontend design system & component documentation
├── firestore.rules                     # Deny-all client rules
└── README.md                           # Documentation & quickstart
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Lucide Icons, HTML5 Canvas (3D low-poly interactive mesh)
- **Backend:** Express.js, TypeScript, Node.js (v22+)
- **Database:** Firebase Firestore (accessed exclusively via Firebase Admin SDK; client access denied)
- **Image Hosting:** Cloudinary CDN
- **Caching:** Vercel Blob CDN (public endpoints prioritize Vercel Blob static JSON, falling back gracefully to live Firestore DB)
- **Rate Limiting:** `express-rate-limit` (tiered by route sensitivity)
- **Validation:** Zod (strict runtime schema validation)
- **Authentication:** Firebase Auth (Google Sign-In) + server-side Firestore `admins` whitelist verification
- **Deployment:** Render (Backend API), Vercel (Frontend SPA)
- **Keep-Alive:** cron-job.org (pinging `GET /health` to prevent Render free-tier cold starts)

---

## ⚡ Quickstart

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure the environment variables in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173,http://localhost:3000

# Firebase Admin Credentials
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Vercel Blob (Required for static cache generation & CDN acceleration)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxx
```

Start the backend development server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Configure `frontend/.env`:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000

# Firebase Client SDK Credentials (for /admin Google Sign-In)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend development server:

```bash
npm run dev
```

The web application will be live at `http://localhost:5173`.

---

## 🌐 API Reference

### Public Routes

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/` | None | API root status & endpoint index |
| `GET` | `/health` | None | Lightweight keep-alive status check |
| `GET` | `/api/u/:username` | 25 req/min (IP) | **Live** member digital business card (strips `rollNo`) |
| `GET` | `/u/:username` | 25 req/min (IP) | Direct visit helper (redirects browser to frontend SPA) |
| `GET` | `/api/members` | 60 req/min (IP) | Active members grouped by domain (Vercel Blob priority, DB fallback) |
| `GET` | `/api/projects` | 60 req/min (IP) | Projects showcase listing (Vercel Blob priority, DB fallback) |
| `GET` | `/api/gallery` | 60 req/min (IP) | Events gallery listing (Vercel Blob priority, DB fallback) |
| `GET` | `/api/gallery/:slug/images` | 60 req/min (IP) | **Live** fetch of full `images[]` array for event lightboxes |
| `GET` | `/api/reminders` | 60 req/min (IP) | Active & upcoming mascot reminders (Vercel Blob priority, DB fallback) |
| `GET` | `/api/og/:username` | 60 req/min (IP) | Server-rendered OpenGraph metadata for social link crawlers |
| `GET` | `/api/og/projects/:slug` | 60 req/min (IP) | Server-rendered OpenGraph metadata for project link crawlers |

### Admin Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/session` | Exchanges Firebase Google ID token for verified admin session |
| `GET` | `/api/admin/me` | Returns current authenticated admin profile |

### Admin Protected Routes (Bearer Token + `admins` Check)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/members/tree` | Hierarchical domain tree with nested member records |
| `GET` | `/api/admin/usernames/check?username=xyz` | Real-time username availability checker |
| `POST` | `/api/admin/members` | Atomic creation of member record and global username lookup |
| `PATCH` | `/api/admin/members/:domain/:docId` | Single-field autosave on blur (`{ field, value }`) |
| `DELETE` | `/api/admin/members/:domain/:docId` | Deletes member doc and username lookup in atomic transaction |
| `GET` | `/api/admin/projects` | Lists all projects |
| `POST` | `/api/admin/projects` | Creates a new project |
| `PATCH` | `/api/admin/projects/:slug` | Updates project details |
| `DELETE` | `/api/admin/projects/:slug` | Deletes a project |
| `GET` | `/api/admin/gallery` | Lists all gallery events |
| `GET` | `/api/admin/gallery/:slug` | Retrieves event detail with full `images[]` |
| `POST` | `/api/admin/gallery` | Creates a new gallery event |
| `PATCH` | `/api/admin/gallery/:slug` | Updates gallery event fields |
| `DELETE` | `/api/admin/gallery/:slug` | Deletes gallery event |
| `GET` | `/api/admin/reminders` | Lists all scheduled mascot reminders |
| `POST` | `/api/admin/reminders` | Creates a new timed mascot reminder |
| `DELETE` | `/api/admin/reminders/:docId` | Deletes a mascot reminder |
| `POST` | `/api/admin/upload/single` | Uploads single image to Cloudinary (returns `{ url, publicId }`) |
| `POST` | `/api/admin/upload/multiple` | Uploads up to 10 images to Cloudinary (returns `{ urls, count }`) |
| `POST` | `/api/admin/cache/refresh` | Triggers on-demand static cache rebuild directly from Admin UI |

---

## 🔄 Cache Refresh Architecture

To deliver near-zero latency for public visitors without consuming Firestore read quotas, public listings are compiled into static JSON files hosted on Vercel Blob CDN:

```bash
cd backend
npm run cache:generate
```

Generated JSON Blobs:
1. `members-listing.json` — Active members grouped by domain (strips `rollNo` and alumni).
2. `projects-listing.json` — Project summaries with precalculated thumbnails and contributor snapshots.
3. `gallery-listing.json` — Gallery events list with thumbnails and descriptions (excluding heavy `images[]` array).
4. `reminders-listing.json` — Active and upcoming mascot announcements.

*Note: Admins can also trigger this cache refresh directly inside `/admin` under the **Cache** section.*

---

## 🛡️ Security & Defense-in-Depth

1. **Deny-All Client Rules:** `firestore.rules` blocks all client-side reads and writes (`allow read, write: if false;`). Every database operation occurs via the Firebase Admin SDK on the backend.
2. **Tiered Rate Limiting:** Prevents scraper abuse on live public routes while ensuring high throughput for authenticated admin operations.
3. **MIME Type Inspection:** Multer memory storage inspects file signatures to block non-image uploads.
4. **Strict Serializers:** Student university roll numbers (`rollNo`) and audit timestamps are strictly scrubbed from all public API outputs.

---

## 🖼️ Social Previews & Dynamic OpenGraph (OG)

Because React is a Client-Side Rendered (CSR) Single Page Application, social media crawlers (WhatsApp, Twitter/X, Discord, LinkedIn, Facebook) cannot execute JavaScript to parse dynamic metadata. LeetVerse resolves this using a hybrid edge-routing and server-rendered OpenGraph architecture:

1. **Edge Scraper Interception (`vercel.json`):**
   - Vercel edge routes inspect incoming `User-Agent` headers.
   - When a social crawler (e.g. `WhatsApp`, `facebookexternalhit`, `Twitterbot`, `Discordbot`, `LinkedInBot`) requests `/u/:username` or `/projects/:slug`, Vercel proxies the request directly to the backend OpenGraph endpoints (`/api/og/:username` or `/api/og/projects/:slug`).
   - Regular human visitors are served the React SPA (`index.html`).
2. **Dynamic Member vs. Brand OG Image Rendering:**
   - **Member Link (`/u/:username`):** Dynamically retrieves the member profile and serves their uploaded portrait photo (`member.photoUrl`) in `og:image` and `twitter:image`.
   - **Fallback & General Routes:** If a member has no photo, or when sharing project/general club links, it falls back to the high-resolution brand banner card (`/og-logo.jpeg`).
3. **Cloudinary Quota Protection:**
   - Raw image URLs are delivered directly with zero on-the-fly transformations (`w_1200,h_630,c_fill`). This protects the monthly Cloudinary free-tier transformation credit pool from depletion and avoids 400 errors from strict face detection filters.
4. **Social Cache Busting:**
   - Social scrapers (especially WhatsApp) aggressively cache link previews by URL. When testing newly updated member photos or metadata, append a version query parameter (e.g. `https://leetverse-website.vercel.app/u/aditya-r?v=2`).

