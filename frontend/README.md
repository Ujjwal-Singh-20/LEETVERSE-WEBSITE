# LeetVerse Frontend (SPA)

The official client-side web application for **LeetVerse** — built with React 18, Vite, TypeScript, and a bespoke atmospheric design system without Tailwind bloat.

---

## 🎨 Design System & Palette

- **Background:** `#060d0a` (deep obsidian green)
- **Primary Accent:** `#3dffa0` (mint green) — used for interactive highlights, links, glow states, and focus rings
- **Secondary Surface:** `#0d1f16` (cards, panels, speech bubble surfaces)
- **Text Hierarchy:** `#f0f7f3` (primary headings & text) & `#7a9e8b` (subtle secondary text & captions)
- **Accent Border:** `rgba(61, 255, 160, 0.25)` to `rgba(61, 255, 160, 0.55)`
- **Typography:** Modern Sans-serif (`Outfit`, `Inter`) for UI elements and headings; Monospace (`JetBrains Mono`, `Fira Code`) reserved for tags, metrics, code symbols, and the ASCII mascot.

---

## 🗺️ Key Routes & Surfaces

### Public Surfaces
1. **Home (`/`):**
   - Interactive low-poly faceted triangle mesh canvas responding in real time to cursor position.
   - Club mission statement with dynamic statistics calculated live from API (`members`, `projects`, `events`).
   - Teaser previews for featured projects and recent events.
   - Minimal "SCROLL" visual cue.
2. **Members Directory (`/members`):**
   - Filterable domain tabs (`All`, `Web Dev`, `App Dev`, `AI/ML`, `CP`, `UI/UX`).
   - Responsive member cards with photo avatar, position, bio, social links, and direct links to `/u/:username`.
3. **Digital Business Card (`/u/:username`):**
   - Fetches live card data directly from `GET /api/u/:username`.
   - Verified badge, profile link copy button, GitHub/LinkedIn/Instagram badges, and graceful not-found state.
4. **Projects Showcase (`/projects`):**
   - Horizontal drag-and-scroll card gallery with a subtle vertical arc.
   - Contributor avatar badges linking to creator profiles.
   - Interactive modal with full image carousel, technology tags, and external project links.
5. **Event Gallery (`/gallery`):**
   - Tactile photo deck with loose polaroid stacking and throw animations.
   - Event context card with date, title, and description.
   - Fullscreen lightbox fetching high-resolution `images[]` live from `GET /api/gallery/:slug/images`.
6. **Not Found (`404` / `*`):**
   - Minimalist code-inspired `[ 404 ] { not_found }` bracket lockup.
   - Subtle, ambient circular radar sweep animation in the background.
   - Direct button to return safely to the home page.

### ASCII Bracket Buddy (Mascot)
- **Default State (No active reminder):** Stays invisible on initial load. Right-clicking anywhere on the screen summons the mascot to the cursor with a bounce animation, displays a random tip, and fades out.
- **Active Reminder State:** Anchored automatically at the reminder's `targetSection` (or bottom-right floating default). Pulses with an idle breathing animation; hovering reveals the active announcement bubble.

### Admin Panel (`/admin`)
- **Strictly Unlinked:** Excluded from public navigation and footers.
- **Internal Tool Layout:** Dark sidebar navigation with dedicated management tabs.
- **Authentication:** Google Sign-In via Firebase Web SDK + session exchange with backend `POST /api/admin/session` and `GET /api/admin/me`.
- **Management Tabs:**
  - **Members & Domains:** Expandable domain tree, member creation with real-time username availability check, Cloudinary photo upload, single-field autosave on blur (`PATCH`), and deletion.
  - **Projects:** Project table, modal with contributor selector from active member directory, and Cloudinary multi-image upload.
  - **Gallery Events:** Event table, modal with cover photo upload and multi-photo album upload (up to 10 images), and date picker.
  - **Mascot Reminders:** Active banner, scheduled reminders list, and creation modal with date-time range and target section.
  - **Cache Management:** One-click **"Refresh Static Cache"** button triggering backend `POST /api/admin/cache/refresh` to recompile Vercel Blob CDN snapshots.

---

## ⚡ Quickstart — Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the required environment variables:
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

### 3. Run Development Server
```bash
npm run dev
```
The application will be running at `http://localhost:5173`.

### 4. Production Build
```bash
npm run build
```
Generates production-optimized static assets into `dist/`.
