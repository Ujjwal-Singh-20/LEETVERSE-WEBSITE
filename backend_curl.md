1. Environment Setup
Ensure you have a .env file in the 

backend/
 directory:

bash
# In backend directory
cp .env.example .env
Fill in your Firebase credentials, Cloudinary keys, and optional BLOB_READ_WRITE_TOKEN.

2. Start the Backend Server
bash
cd backend
# Development mode (with live reload via tsx watch)
npm run dev
# Or build and start production bundle
npm run build
npm start
3. Verify Endpoints via Terminal (curl / PowerShell)
Health & Root Check
bash
curl http://localhost:5000/health
curl http://localhost:5000/
Public Member Card (/u/:username)
bash
curl http://localhost:5000/u/aditya-r
Fallback Listings & Gallery
bash
# Get active members grouped by domain
curl http://localhost:5000/api/members
# Get projects listing
curl http://localhost:5000/api/projects
# Get gallery event listing
curl http://localhost:5000/api/gallery
# Get live event popup images
curl http://localhost:5000/api/gallery/hackathon-2026/images
Social / OG Tag Render Check
bash
# Member card OG HTML
curl http://localhost:5000/api/og/aditya-r
# Project OG HTML
curl http://localhost:5000/api/og/projects/campus-connect
4. Test Admin Endpoints (Requires Firebase ID Token)
Admin Session Login
bash
curl -X POST http://localhost:5000/api/admin/session \
  -H "Content-Type: application/json" \
  -d "{\"idToken\": \"<YOUR_FIREBASE_ID_TOKEN>\"}"
Fetch Full Member Tree
bash
curl http://localhost:5000/api/admin/members/tree \
  -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>"
Check Username Availability
bash
curl "http://localhost:5000/api/admin/usernames/check?username=new-user" \
  -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>"
Create a Member
bash
curl -X POST http://localhost:5000/api/admin/members \
  -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "web-dev",
    "name": "Jane Doe",
    "username": "jane-doe",
    "status": "active",
    "position": "Frontend Developer",
    "bio": "Building with React & Vite",
    "rollNo": "22CS101"
  }'
5. Run the Cache Generation Script
This script reads from Firestore and writes members-listing.json, projects-listing.json, and gallery-listing.json to Vercel Blob (or locally to dist/cache/ if BLOB_READ_WRITE_TOKEN is not set):

bash
npm run cache:generate
