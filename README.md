# MechaniXpress

**MechaniXpress** is a comprehensive On-Demand Vehicle Repair Platform. It connects customers with nearby mechanics for instant service booking, tracking, and payments.

## 🚀 Quick Start (Docker)

The easiest way to run the entire stack is with Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed.

### Run Application
```bash
docker-compose up --build
```
This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🛠 Manual Development Setup

If you prefer running services individually for development.

### 1. Backend (`/backend`)
```bash
cd backend
npm install
npx prisma generate
npx prisma db seed # Seeds mock data (Users, Services)
npm run dev
```
- **Port**: 5000
- **Database**: SQLite (`dev.db`)

### 2. Frontend (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
- **Port**: 3000

---

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn/UI, Axios.
- **Backend**: Express.js, TypeScript, Prisma ORM.
- **Database**: SQLite (Local Dev) / PostgreSQL (Production ready).
- **Authentication**: JWT (JSON Web Tokens).

### Key Features
1.  **User Roles**: Customer, Mechanic, Admin.
2.  **Booking System**: Complete flow from Request -> Accept -> Complete.
3.  **Real-time Logic**: Mock implementations for Payments (JazzCash/EasyPaisa) and Maps (Distance calc).
4.  **Analytics**: Admin dashboard with revenue and rating stats.

---

## 🧪 Testing

We have built-in verification scripts in the `backend` folder.

```powershell
./test_flow.ps1      # Tests Auth & Booking flow
./test_admin.ps1     # Tests Admin Dashboard
./test_payment.ps1   # Tests Payment Integration
```

## 📂 Project Structure

```
mechanixpress/
├── backend/            # Express API
│   ├── prisma/         # Database Schema & Seeds
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── routes/     # API Endpoints
│   │   └── services/   # Mock Services (Payment, Map)
├── frontend/           # Next.js App
│   ├── src/
│   │   ├── app/        # Pages (Auth, Dashboard)
│   │   ├── components/ # Shadcn UI Components
├── docs/               # API Reference
```

## 📜 License
Private Project for Mechanixpress.
