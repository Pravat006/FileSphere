# FileSphere Project Report

**Date:** January 11, 2026
**Project Name:** FileSphere
**Version:** 1.0.0

---

## 1. Executive Summary

**FileSphere** is a comprehensive, cloud-based file storage and management application designed to offer secure, scalable, and user-friendly storage solutions. Similar to industry giants like Google Drive or Dropbox, FileSphere allows individual users to upload, organize, and manage their digital assets. It features a robust subscription model (Free, Pro, Enterprise), integrated payment gateways (Razorpay), and a powerful administration dashboard for managing users, revenue, and system health.

The system is built on a modern tech stack utilizing **Next.js** (inferred), **Node.js/Express** (Backend), **PostgreSQL**, **Prisma ORM**, and **Firebase Authentication**.

---

## 2. Features

### 2.1 For End-Users

*   **Secure Authentication**: Seamless login and registration using Firebase (Email/Password, Social Login).
*   **File Management**:
    *   **Upload & Store**: Support for Images, Videos, Audio, and Documents.
    *   **Organization**: Create and manage Folders to categorize files.
    *   **Trash System**: "Soft delete" functionality allowing users to restore files deleted by accident (similar to a Recycle Bin).
    *   **File Details**: View file metadata like size, type, and upload date.
*   **Storage Quotas**: Visual indicators of used vs. available storage based on the user's plan.
*   **Subscription Management**:
    *   Upgrade tiers (Free → Pro → Enterprise) for more storage and features.
    *   View detailed subscription history and validity.
    *   Secure payments via **Razorpay**.
*   **Transaction History**: Access a log of all past payments and invoices.

### 2.2 For Admins

*   **Dashboard Overview**: High-level metrics on total users, active subscriptions, and system storage usage.
*   **Plan Management**:
    *   Dynamic CRUD capabilities for Subscription Plans (Create, Read, Update, Delete).
    *   Configure pricing, storage limits (e.g., 10GB vs 1TB), and feature lists without code changes.
*   **User Management**:
    *   View all registered users.
    *   Monitor individual storage usage.
    *   Access transaction logs for support and debugging.
*   **Revenue Analytics**: Track income generated through Razorpay transactions.

---

## 3. Advantages & Disadvantages

### 3.1 Advantages

*   **Data Sovereignty**: Being a self-hosted/custom solution, you own the data layout and access policies.
*   **Scalable Architecture**: Built on PostgreSQL and Prisma, the database handles complex relationships efficiently.
*   **Flexible Monetization**: The `SubscriptionPlan` model is generic, allowing for daily/monthly changes to pricing strategies without schema migrations.
*   **Safety First**: The `isInTrash` implementation prevents immediate data loss, significantly reducing user support tickets for accidental deletions.
*   **Type Safety**: End-to-end TypeScript integration ensures high code reliability and fewer runtime errors.

### 3.2 Disadvantages

*   **Folder Depth**: Currently, the DB schema supports a flat folder structure or single-level depth. Deeply nested folders (e.g., `/Work/Projects/2024/Jan`) require schema evolution.
*   **BigInt Complexity**: Handling file sizes in `BigInt` requires strict serialization logic when sending JSON responses to the frontend.
*   **Dependency on Firebase**: While convenient, user management is tightly coupled with Firebase Auth, making it harder to migrate to a self-hosted auth solution later if needed.

---

## 4. Technical Architecture & Tech Stack

*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: Firebase Admin SDK
*   **Payments**: Razorpay
*   **Backend**: Node.js / Express (inferred from file structure)
*   **Frontend**: React / Next.js (TurboRepo structure)

---

## 5. API Documentation

### 5.1 User Endpoints

#### Authentication
*   `POST /api/auth/login`: Verify Firebase token and create session.
*   `POST /api/auth/register`: Create a new user profile in Postgres.

#### Files & Folders
*   `GET /api/files`: List all files (supports filtering by Folder ID).
*   `POST /api/files/upload`: Multipart upload for new files.
*   `PATCH /api/files/:id/trash`: Move a file to trash.
*   `PATCH /api/files/:id/restore`: Restore a file from trash.
*   `DELETE /api/files/:id`: **Permanent** deletion.
*   `POST /api/folders`: Create a new folder.
*   `GET /api/folders`: List user's folders.

#### Subscriptions & Payments
*   `GET /api/plans`: List available subscription plans.
*   `POST /api/payments/create-order`: Initialize a Razorpay order.
*   `POST /api/payments/verify`: Verify Razorpay signature and activate subscription.
*   `GET /api/transactions`: List user's payment history.

### 5.2 Admin Endpoints

#### Management
*   `GET /api/admin/users`: List all users with pagination.
*   `GET /api/admin/stats`: Aggregate system stats (Total Storage, Revenue).
*   `POST /api/admin/plans`: Create a new Subscription Plan.
*   `PUT /api/admin/plans/:id`: Update an existing plan.

---

## 6. Future Migrations & Roadmap

To evolve FileSphere into an Enterprise-grade product, the following migrations are planned:

1.  **Nested Folders (Recursive)**:
    *   *Schema Change*: Add `parentFolderId` (Self-relation) to the `Folder` model.
    *   *Feature*: Allow infinite directory nesting.
2.  **File Sharing & Permissions**:
    *   *Schema Change*: Create a `SharedFile` link table with `User`, `File`, and `PermissionLevel` (READ/WRITE).
    *   *Feature*: Allow users to share files with specific email addresses or generate public links.
3.  **Team workspaces**:
    *   *Schema Change*: Introduce `Organization` or `Team` models.
    *   *Feature*: Shared storage quotas for companies.
4.  **Advanced Security**:
    *   *Feature*: Two-Factor Authentication (2FA) enforcement for Admins.
    *   *Feature*: Audit Logs for all file access actions.
5.  **Audit Logs**:
    *   Create a dedicated table to track admin actions (e.g., "Admin X changed Plan Y price").

---
*Report generated by Antigravity*
