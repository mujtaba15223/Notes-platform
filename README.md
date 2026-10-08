# Student Notes Sharing Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for students to upload, organize, search, view, and manage subject-wise notes and study materials.

## 🌟 Features

### Authentication & Authorization
- **Student Registration & Login** - Secure JWT-based authentication with bcrypt password hashing
- **Role-based Access Control** - Two roles: `student` and `admin`
- **Protected Routes** - Frontend and backend route protection
- **Persistent Sessions** - HTTP-only cookies with automatic token refresh

### Student Features
- **Browse & Search Notes** - Full-text search across titles, descriptions, and tags
- **Advanced Filtering** - Filter by subject, topic, file type, uploader, date
- **Sort Options** - Newest, oldest, most viewed, most downloaded
- **Upload Notes** - Drag-and-drop file upload with validation
- **Manage Own Notes** - Edit metadata, delete own uploads
- **Download & View** - Direct file download and online viewing
- **Profile Management** - Update name, bio, avatar
- **Personal Dashboard** - Upload stats, recent activity, popular notes

### Admin Features
- **User Management** - View, activate/deactivate, promote/demote users
- **Subject Management** - Full CRUD for subjects
- **Topic Management** - Full CRUD for topics within subjects
- **Content Moderation** - Approve/reject notes, delete inappropriate content
- **Platform Analytics** - Statistics dashboard with charts

### Technical Features
- **File Storage Abstraction** - Pluggable storage (local, S3, Cloudinary, etc.)
- **File Validation** - MIME type checking, size limits, extension validation
- **Pagination** - Server-side pagination for all list views
- **RESTful API** - Clean, consistent API design with proper HTTP codes
- **Error Handling** - Centralized error handling with user-friendly messages
- **Responsive UI** - Mobile-first design with Tailwind CSS
- **Loading States** - Skeleton loaders, spinners, empty states
- **Toast Notifications** - Real-time feedback for user actions

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Database** | MongoDB with Mongoose ODM |
| **Backend** | Node.js, Express.js |
| **Frontend** | React 18, React Router v6 |
| **Authentication** | JWT, bcryptjs, HTTP-only cookies |
| **File Upload** | Multer (memory storage) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Date Formatting** | date-fns |
| **Notifications** | react-hot-toast |
| **HTTP Client** | Axios |
| **Build Tool** | Vite |

## 📁 Project Structure

```
student-notes-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── NoteGrid.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── FileUploader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── NoteDetails.jsx
│   │   │   ├── UploadNote.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Subjects.jsx
│   │   │   ├── SubjectDetails.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── context/        # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/    # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── subject.controller.js
│   │   │   ├── topic.controller.js
│   │   │   ├── note.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Subject.js
│   │   │   ├── Topic.js
│   │   │   └── Note.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── subject.routes.js
│   │   │   ├── topic.routes.js
│   │   │   ├── note.routes.js
│   │   │   └── admin.routes.js
│   │   ├── services/       # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── note.service.js
│   │   │   └── storage.service.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── generateToken.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── uploads/            # Local file storage
│   ├── package.json
│   ├── server.js
│   └── .env.example
│
├── package.json            # Root package.json
└── README.md
```

## 🗄 MongoDB Schema Design

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: student, admin),
  avatar: String,
  bio: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subject
```javascript
{
  name: String,
  code: String (unique),
  description: String,
  semester: Number,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Topic
```javascript
{
  name: String,
  description: String,
  subject: ObjectId (ref: Subject),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Note
```javascript
{
  title: String,
  description: String,
  subject: ObjectId (ref: Subject),
  topic: ObjectId (ref: Topic),
  uploadedBy: ObjectId (ref: User),
  fileUrl: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  tags: [String],
  downloads: Number,
  views: Number,
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List subjects (paginated) |
| GET | `/api/subjects/:id` | Get subject with topics |
| POST | `/api/subjects` | Create subject (admin) |
| PUT | `/api/subjects/:id` | Update subject (admin) |
| DELETE | `/api/subjects/:id` | Delete subject (admin) |

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics` | List topics (paginated) |
| GET | `/api/topics/:id` | Get topic details |
| POST | `/api/topics` | Create topic (admin) |
| PUT | `/api/topics/:id` | Update topic (admin) |
| DELETE | `/api/topics/:id` | Delete topic (admin) |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List notes (paginated, filtered) |
| GET | `/api/notes/:id` | Get note details |
| POST | `/api/notes` | Upload note |
| PUT | `/api/notes/:id` | Update note metadata |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/notes/:id/download` | Download file |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:id/notes` | Get user's notes |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/notes` | List all notes |
| PUT | `/api/admin/notes/:id/approve` | Approve note |
| PUT | `/api/admin/notes/:id/reject` | Reject note |

## 🔐 Authentication Flow

1. **Registration/Login** → Server validates credentials → Generates JWT → Sets HTTP-only cookie
2. **Protected Routes** → Middleware extracts token from cookie/header → Verifies JWT → Attaches user to request
3. **Role Authorization** → Middleware checks user.role against required roles
4. **Frontend** → AuthContext manages user state → ProtectedRoute components guard pages

## 📤 File Upload Architecture

```
React Frontend
    ↓ (multipart/form-data)
Express + Multer (memory storage)
    ↓ (validation)
Storage Service
    ↓ (save to disk/cloud)
File URL
    ↓ (save to DB)
MongoDB Note Document
```

**Storage Abstraction** (`server/src/services/storage.service.js`):
- `saveFile(file)` - Validates and stores file
- `deleteFile(fileUrl)` - Removes file from storage
- `getFilePath(fileUrl)` - Resolves file path for downloads
- Easily swappable for S3, Cloudinary, etc.

**Validation**:
- MIME type verification (not just extension)
- File size limits (default 10MB)
- Unique filename generation (crypto.randomBytes)
- Executable file blocking

## ⚙️ Environment Variables

Create `.env` files from examples:

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-notes
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
STORAGE_PATH=./uploads
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Installation & Running

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Quick Start

```bash
# Clone and enter project
cd student-notes-platform

# Install all dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# Seed database with sample data
npm run seed

# Start development servers (both frontend & backend)
npm run dev
```

### Individual Commands

```bash
# Backend only
npm run server

# Frontend only
npm run client

# Seed database
npm run seed

# Production build
npm run build
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🚀 Deploy frontend and API to Vercel

The repository includes a root `vercel.json` for deploying the Vite client and Express API together on one Vercel domain. The API is exposed under `/api`, the frontend uses its same-origin `/api` base URL, and client-side routes fall back to `index.html`.

### 1. Prepare MongoDB

Use a hosted MongoDB deployment such as MongoDB Atlas; `localhost` is not reachable from Vercel. Create a database user with a strong password, configure Atlas network access for Vercel (prefer a supported static-egress/IP allowlist where available), and copy the application's connection URI.

### 2. Import the repository

In Vercel, create a project from this repository and leave the **Root Directory** set to the repository root. The checked-in configuration installs the client/server dependencies, builds `client`, deploys the catch-all Express function, proxies `/uploads/*` to that function, and serves the Vite SPA.

### 3. Configure environment variables

Add these in **Project Settings → Environment Variables** for Production and Preview as needed:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Hosted MongoDB connection string for the production database |
| `JWT_SECRET` | A unique, random secret (at least 32 characters); do not use the development default |
| `JWT_EXPIRES_IN` | `7d` (or your chosen token lifetime) |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | The exact frontend origin, e.g. `https://your-project.vercel.app`; set the custom domain here if using one |
| `MAX_FILE_SIZE` | `4000000` (about 4 MB; Vercel Functions have a request-body limit around 4.5 MB) |

`PORT` is assigned by Vercel. `STORAGE_PATH` defaults to a writable `/tmp` directory when running on Vercel; do not point it at the deployed source directory.

### 4. Seed the hosted database (optional)

If you want the demo subjects/topics/notes, run the seed script once from your computer with `MONGODB_URI` temporarily set to the hosted database URI:

```bash
npm run seed
```

Use the same `MONGODB_URI` as the Vercel deployment. Do not deploy the demo credentials for a public production site; remove/change demo accounts and passwords before opening access.

### 5. Deploy and verify

Deploy from Vercel, then check:

- `https://your-domain/api/health` returns a JSON health response.
- `https://your-domain/` loads the NotesHub frontend.
- Register/login and browse subjects and notes.

### Important: persistent file storage

The current storage service writes files to the local filesystem. Vercel's `/tmp` storage is temporary and not shared reliably between function invocations or deployments. The API can accept a file upload, but files stored this way may disappear and later previews/downloads can fail. **Before using uploads in production, replace local storage with persistent object storage** (for example, Vercel Blob or an S3-compatible bucket) and save the durable object URL in MongoDB. The Vercel Functions request-size limit also means the current 10 MB development upload limit cannot be used as-is in production; the 4 MB setting above reduces that limit, while direct-to-object-storage uploads are the recommended production solution.

## 🌱 Seeding Database

```bash
npm run seed
```

Creates:
- 1 admin user + 4 student users
- 6 subjects (Data Structures, DBMS, OS, Networks, ML, Web Dev)
- 30+ topics across subjects
- 15 sample notes with metadata and detailed, multi-section PDF study material
- Downloadable sample PDF files for seeded notes

**Demo Credentials**:
- Admin: `admin@notesplatform.com` / `admin123`
- Student: `sricharan@example.com` / `student123`

Seeding is safe to rerun: it adds missing demo records without deleting existing data. It also refreshes the bundled sample-note PDFs with complete study content and updates their file metadata; uploaded student files are not replaced.

## 📝 API Request Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

### Upload Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/notes.pdf" \
  -F "title=My Notes" \
  -F "description=Study notes for exam" \
  -F "subject=<subject-id>" \
  -F "topic=<topic-id>" \
  -F "tags=exam,study,important"
```

### Search Notes
```bash
curl "http://localhost:5000/api/notes?search=data+structures&subject=<id>&page=1&limit=20"
```

### View or download a note
```bash
curl -OJ http://localhost:5000/api/notes/<note-id>/download
curl -i http://localhost:5000/api/notes/<note-id>/view
```

The view endpoint serves browser-previewable PDFs, text files, and images inline. Other document formats remain downloadable.

## 🧪 Testing Checklist

- [ ] User registration with validation
- [ ] User login/logout with JWT cookies
- [ ] Protected routes (frontend + backend)
- [ ] Role-based access (student vs admin)
- [ ] Subject CRUD (admin only)
- [ ] Topic CRUD (admin only)
- [ ] Note upload with file validation
- [ ] Note download increments counter
- [ ] Note view increments counter
- [ ] Search across title, description, tags
- [ ] Filter by subject, topic, file type
- [ ] Sort by date, views, downloads
- [ ] Pagination on all list views
- [ ] File type validation (MIME + extension)
- [ ] File size limit enforcement
- [ ] Note edit/delete ownership checks
- [ ] Admin user management
- [ ] Admin content moderation
- [ ] Profile update
- [ ] Responsive UI on mobile/desktop

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Security** - HTTP-only, secure, same-site cookies
- **Input Validation** - Server-side validation on all endpoints
- **File Validation** - MIME type checking, size limits
- **Rate Limiting** - Auth endpoints protected
- **Helmet** - Security headers
- **CORS** - Configured for specific origin
- **Error Handling** - No stack traces in production

## 🎨 UI/UX Highlights

- **Search-First Design** - Prominent search on notes page
- **Subject Cards** - Visual subject browsing
- **Topic Navigation** - Hierarchical subject → topic → notes
- **Note Cards** - Rich metadata display (type, subject, topic, uploader, stats)
- **Drag-and-Drop Upload** - Visual feedback, progress
- **Skeleton Loaders** - Perceived performance
- **Empty States** - Helpful guidance when no data
- **Toast Notifications** - Non-intrusive feedback
- **Confirmation Dialogs** - Destructive action protection

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔮 Future Improvements

- [ ] Real-time notifications (WebSockets)
- [ ] Collaborative editing
- [ ] Note versioning/history
- [ ] Rich text note editor
- [ ] PDF preview in-browser
- [ ] Email notifications
- [ ] Social features (follow, like, comment)
- [ ] AI-powered tag suggestions
- [ ] Offline support (PWA)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for admins

## 📄 License

MIT License - feel free to use for learning or production!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ for students everywhere**