# FileSphere - File Management System

FileSphere is a modern, scalable file management and storage application built on a Turborepo monorepo architecture. It features a robust backend API for handling file operations, user management, and subscription plans.

## What's inside?

This Turborepo includes the following packages/apps:

-   `apps/backend`: An [Express.js](https://expressjs.com/) server that handles all the business logic, API endpoints, and database interactions.
-   `apps/web`: A [Next.js](https://nextjs.org/) app for the user-facing web client (frontend).
-   `packages/db`: Contains the Prisma schema, generated client, and migration files for the PostgreSQL database.
-   `packages/ui`: A stub React component library to be shared across web applications.
-   `@repo/eslint-config`: Shared ESLint configurations.
-   `@repo/typescript-config`: Shared `tsconfig.json` configurations.

---

## Work Completed

Here is a summary of the development work and architectural decisions made so far:

### 1. Database Schema Design & Refactoring

The entire database schema has been designed and implemented using **Prisma** with a PostgreSQL database.

-   **Core Models**: Created robust models for `User`, `Folder`, `File`, `SubscriptionPlan`, and `SubscriptionHistory`.
-   **Schema Refactoring**: The initial `FileTrash` model was identified as redundant and has been **removed**.
-   **Simplified Trash Logic**:
    -   A direct `ownerId` relationship was added to the `File` model, ensuring every file has a clear owner, whether it's in a folder or in the trash. This simplifies ownership queries significantly.
    -   The `File` model now includes `isInTrash: Boolean`, `deletedAt: DateTime?`, and `originalFolderId: String?` fields. This allows for moving files to and from the trash without data loss and enables easy restoration.
-   **Database Migrations**: Successfully created and applied database migrations to reflect the schema changes.

### 2. Backend API Development (`apps/backend`)

A significant portion of the core backend logic has been implemented in the Express.js application.

-   **File Controllers (`file-controller.ts`)**:
    -   **File Upload**: An endpoint to handle multipart file uploads, create file metadata in the database, and associate files with a user and an optional folder.
    -   **File Retrieval**: Endpoints to get a list of all non-trashed files for a user (`getAllFiles`) and to retrieve a single file by its ID (`getFileById`).
    -   **Trash Management**:
        -   `moveFileToTrash`: An endpoint that moves a file to the trash by setting `isInTrash` to `true`, clearing its `folderId`, and recording its `originalFolderId` for potential restoration.
        -   `deleteFileFromTrash`: An endpoint to permanently delete a file that is already in the trash.
        -   `deleteFilePermanently`: A separate endpoint for immediate, permanent deletion of a file.

### 3. Automated Background Jobs

-   **Automatic Trash Cleanup**:
    -   A script (`jobs/cleanup-trash.ts`) has been created to automatically purge files that have been in the trash for a specified duration (e.g., 30 days).
    -   This script is designed to be run by a **cron job**, ensuring the system automatically manages storage by deleting old, unwanted files.
    -   **Important**: The script includes a placeholder for deleting files from the actual cloud storage provider, which is a critical next step.

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [pnpm](https://pnpm.io/installation) (recommended package manager)
-   [PostgreSQL](https://www.postgresql.org/download/) database running

### 1. Setup

Clone the repository and install dependencies:

```sh
git clone https://github.com/Pravat006/FileSphere.git
cd FileSphere
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the `packages/db` directory and add your database connection string:

```env
# packages/db/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 3. Database Migration

Apply the schema changes to your database:

```sh
pnpm exec prisma migrate dev
```

### 4. Run Development Servers

To run the backend and frontend applications in development mode:

```sh
pnpm dev
```

You can also run a specific app:

```sh
# Run only the backend server
pnpm dev --filter=backend
```
