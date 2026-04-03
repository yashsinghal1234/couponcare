# CouponCare

CouponCare is a full-stack web app for donating and requesting discount coupons. Donors can list coupons, recipients can request them, and approvals are handled when required.

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT

## Repository structure

- backend/ - Express API and database models
- frontend/ - React UI
- docker-compose.yml - Local MongoDB container

## Local setup

### 1) Start MongoDB (optional)

If you do not already have MongoDB running locally:

```bash
docker compose up -d
```

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

Create backend/.env with:

```
MONGODB_URI=mongodb://localhost:27017/couponcare
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Create frontend/.env with:

```
VITE_API_BASE=http://localhost:4000
```

## Scripts

Backend:

- npm run dev
- npm run build
- npm run start

Frontend:

- npm run dev
- npm run build
- npm run preview
