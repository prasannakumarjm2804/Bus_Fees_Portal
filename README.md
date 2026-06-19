# 🚌 College Bus Fees Management System

A full-stack web application built with **MySQL + Express.js + React.js + Node.js (MERN-like stack)** for managing college bus transportation fees.

---

## 📌 Features

### Admin Panel
- 📊 **Dashboard** — Real-time stats, charts (pie + bar), route-wise collection summary
- 👨‍🎓 **Student Management** — Add/edit/deactivate students, assign routes
- 🗺️ **Route Management** — Create bus routes with stop details and fee structures
- 💰 **Fee Management** — Generate monthly fees in bulk, collect payments, view receipts
- 🧾 **Receipts** — Auto-generated receipt numbers, printable receipts

### Student Portal
- 🏠 **Dashboard** — Fee summary, route info, pending alerts
- 💳 **My Fees** — Complete fee history, filter by status, view receipts

---

## 🗂️ Project Structure

```
bus-fees-management/
├── backend/
│   ├── config/database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── routeController.js
│   │   └── feeController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Route.js
│   │   ├── Fee.js
│   │   └── index.js
│   ├── routes/index.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js + App.css
│       ├── context/AuthContext.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── admin/ (Dashboard, Students, Routes, Fees)
│       │   └── student/ (Dashboard, Fees)
│       └── components/shared/Layout.js
└── database/schema.sql
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MySQL 8.0+
- npm

### 1. Database Setup
```sql
-- Open MySQL and run:
CREATE DATABASE bus_fees_db;
-- Tables will auto-create when you start the server (Sequelize sync)
-- OR manually run: database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔐 Default Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | Admin@123 |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Get current user | Any |
| GET | /api/routes | List all routes | Any |
| POST | /api/routes | Create route | Admin |
| GET | /api/students | List students | Admin |
| POST | /api/students | Add student | Admin |
| GET | /api/fees | List fees | Admin |
| POST | /api/fees/generate | Bulk generate fees | Admin |
| PUT | /api/fees/:id/collect | Collect payment | Admin |
| GET | /api/fees/my | Student's own fees | Student |
| GET | /api/fees/dashboard | Stats & charts | Admin |

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT Auth, bcryptjs
- **Database**: MySQL
- **Frontend**: React.js, React Router v6, Axios, Recharts
- **Styling**: Pure CSS with CSS variables (no external UI library)
# Bus_Fees_Portal
