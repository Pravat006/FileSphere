# FileSphere - Modern Cloud Storage System

FileSphere is a high-performance, scalable file management and cloud storage platform built with a **Turborepo monorepo** architecture. It leverages modern technologies like Next.js, Express, Prisma, AWS S3, and Redis to provide a seamless file management experience.

## 🏗️ Architecture & Packages

This monorepo uses **PNPM Workspaces** and **Turbo** to manage dependencies and build pipelines.

### Apps
- **`apps/backend`**: Node.js/Express server handling core business logic, file processing, and API endpoints. High-performance caching is implemented with Redis.
- **`apps/frontend`**: User-facing web client built with **Next.js 15** and **Tailwind CSS**, providing a responsive and interactive UI.

### Shared Packages (@repo/*)
- **`packages/db`**: Database layer using **Prisma ORM** with PostgreSQL. Includes schema definitions and automated migrations.
- **`packages/firebase`**: centralized authentication service providing both **Firebase Admin SDK** (for backend verification) and **Firebase Client SDK** (for frontend login).
- **`packages/shared`**: Shared TypeScript interfaces, Zod schemas, validation logic, and constants used across the entire stack.
- **`packages/ui`**: Reusable UI component library shared between frontend applications.
- **`packages/typescript-config`**: Shared `tsconfig.json` configurations.
- **`packages/eslint-config`**: Standardized ESLint rules for maintaining code quality.

---

## 🚀 Core Features & Work Completed

### 1. Advanced Storage Management
- **AWS S3 Integration**: Integrated Amazon S3 for secure and scalable file storage.
- **Smart Upload Strategy**: 
    - **Single-Part Upload**: Fast uploads for smaller files via presigned URLs.
    - **Multi-Part Upload**: Efficient handling of large files (100MB+) with chunked uploads and session management.
- **Trash Lifecycle**: Robust "Soft-Delete" system. Files moved to trash retain metadata and original location for easy restoration.
- **Auto-Cleanup**: Automated background jobs (cron-ready) to purge files from trash after a retention period.

### 2. Performance & Caching
- **Redis Integration**: Implemented Redis for lightning-fast user session caching.
- **Quota Management**: Real-time storage limit checks are cached in Redis to prevent excessive database hits during large file uploads.

### 3. Identity & Security
- **Firebase Auth Integration**: Secure authentication flow using Firebase tokens.
- **User Quota System**: Dynamic subscription plans (Free, Pro, Enterprise) with enforced storage limits and feature flags.

### 4. Database Design
- **Normalized Schema**: Optimized PostgreSQL schema with Prisma, handling complex relations between Users, Folders, Files, and Subscription Histories.
- **Transaction Support**: Critical operations (like completing an upload or upgrading a plan) are wrapped in Prisma Transactions for data integrity.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18 or later
- **PNPM**: v9 or later (recommended)
- **PostgreSQL**: Running instance
- **Docker**: Optional (for running Redis/PostgreSQL locally)

### 1. Installation
```bash
git clone https://github.com/Pravat006/FileSphere.git
cd FileSphere
pnpm install
```

### 2. Environment Setup
You will need to set up `.env` files in multiple locations:

**Root `.env` (passed to apps):**
```env
PORT=3000
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=your_bucket
```

**Firebase Package `.env` (`packages/firebase/.env`):**
```env
# Client Side
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_id
FIREBASE_APP_ID=your_app_id

# Admin SDK (Backend)
FIREBASE_ADMIN_PROJECT_ID=your_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Database Migration
```bash
pnpm exec prisma migrate dev
```

### 4. Development
Run the entire stack in development mode:
```bash
pnpm dev
```
Run only the backend:
```bash
pnpm dev --filter=backend
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
