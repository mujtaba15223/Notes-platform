# 📚 Student Notes Sharing Platform

A full-stack web application that enables students to upload, share, view, and download academic notes. The platform organizes learning resources by subjects and topics, making educational materials easier to access.

## 🚀 Features

- 🔐 **User Authentication** — Secure registration and login.
- 📚 **Notes Management** — Upload, view, download, and manage academic notes.
- 📖 **Subject Organization** — Browse notes by subjects and topics.
- ☁️ **Cloud Storage** — Store documents using Cloudinary.
- 👁️ **Document Preview** — Preview supported files directly in the browser.
- ⬇️ **File Downloads** — Download academic resources.
- 🛡️ **Role-Based Access** — Protect restricted notes with access control.
- 📱 **Responsive Design** — User-friendly interface across devices.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcryptjs

**Database and Storage**
- MongoDB
- Mongoose
- Cloudinary

**Deployment and Tools**
- Render
- Git
- GitHub

## 💻 Getting Started

### Prerequisites

- Node.js and npm
- MongoDB
- Cloudinary account
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/mujtaba15223/Notes-platform.git
cd Notes-platform
```

Install the backend dependencies and start the server:

```bash
cd server
npm install
npm start
```

Install the frontend dependencies and start the development server in a separate terminal:

```bash
cd client
npm install
npm run dev
```

## ☁️ Cloud Storage

The application uses Cloudinary to store uploaded documents independently of the backend server's local filesystem. This helps keep uploaded files accessible after backend restarts and redeployments.

## 🌐 Deployment

The application is deployed using Render.

- **Backend:** Render Web Service
- **Frontend:** Render Static Site
- **Database:** MongoDB Atlas
- **File Storage:** Cloudinary

## 🔒 Security

- Secure authentication and session handling
- Password hashing
- File type and size validation
- Role-based access control
- Protected API endpoints
- Secure handling of application credentials

## 🔮 Future Enhancements

- Advanced search and filtering
- Bookmarks and saved notes
- Ratings and reviews
- User profiles and contribution statistics
- Improved document preview support
- Administrative analytics

## 👨‍💻 Author

**Mohd Mujtaba**

GitHub: [@mujtaba15223](https://github.com/mujtaba15223)

## 📄 License

An appropriate open-source license can be added before distributing the project.

---

⭐ If you find this project useful, consider starring the repository on GitHub.
