# CollegeConnect
A modern, Reddit-style college social media platform allowing students to connect, share resources, create posts, build their profiles, and find career opportunities.

## 🚀 Tech Stack

### Frontend
- **React 19** with **Vite**
- **TailwindCSS** for utility-first styling
- **Framer Motion** for smooth, modern animations
- **Socket.io-client** for real-time networking
- **Axios** for API requests
- **React Router v7** for frontend routing
- **Lucide React** for crisp, scalable icons

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** OM
- **Socket.io** for real-time bidirectional event-based communication
- **JWT (JSON Web Tokens)** & **bcryptjs** for secure authentication
- **Multer** for multipart/form-data handling (file/image uploads)

---

## 🛠️ Project Setup & Installation

Follow these steps to get the full stack running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/AryanPandya0/CollegeConnect.git
cd CollegeConnect
```

### 2. Backend Setup
Navigate to the backend directory and set up your environment:
```bash
cd backend/server
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend/server` directory based on the `.env.example` structure:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database configuration
MONGODB_URI=mongodb://localhost:27017/collegeconnect

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

**Start the Backend Server:**
```bash
npm run dev
```
*(The server should now be running on `http://localhost:5000`)*

### 3. Frontend Setup
Open a new terminal tab/window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Start the Frontend Dev Server:**
```bash
npm run dev
```
*(The React application should now be accessible at `http://localhost:5173`)*

---

## ✨ Key Features
- **User Authentication:** Secure JWT-based registration and login system.
- **Real-time Engine:** Active WebSocket connections for instant updates and chatting.
- **Dynamic Feed:** Reddit-esque scrolling feed with posts, comments, and interactions.
- **Resource Sharing:** Upload attachments and links for academic sharing.
- **Profiles & Portfolios:** Dedicated user profile space for showcasing skills, experience, and past posts.
- **Responsive UI:** Fully optimized layout for seamless mobile and desktop experiences using Tailwind CSS.

## 📄 License
© 2026 Aryan Pandya. All Rights Reserved.

This project and its source code are the intellectual property of Aryan Pandya and may not be copied, distributed, or modified without explicit permission.

