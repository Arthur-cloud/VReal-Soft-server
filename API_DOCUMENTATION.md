# VReal Backend API Documentation

Backend для файлового сховища з функціями управління файлами, папками, дозволами та real-time синхронізацією.

## 🚀 Запуск проекту

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm або yarn

````

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vreal

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
PORT=3000
UPLOAD_FOLDER=./uploads
````

## 📚 API Endpoints

Base URL: `http://localhost:3000`

---

## 🔐 Authentication

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer {refreshToken}

Response: 200
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {accessToken}

Response: 200
```

---

## 👤 Users

### Get Current User

```http
GET /users/me
Authorization: Bearer {accessToken}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T10:00:00.000Z"
}
```

### Get All Users

```http
GET /users
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2025-11-15T10:00:00.000Z"
  }
]
```

---

## 📁 Folders

### Create Folder

```http
POST /folders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "My Folder",
  "parentId": "uuid-or-null",
  "isPublic": false
}

Response: 201
{
  "id": "uuid",
  "name": "My Folder",
  "parentId": null,
  "ownerId": "uuid",
  "isPublic": false,
  "publicLink": null,
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### List Folders

```http
GET /folders?parentId={uuid}
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "name": "My Folder",
    "parentId": null,
    "ownerId": "uuid",
    "isPublic": false,
    "createdAt": "2025-11-15T10:00:00.000Z"
  }
]
```

### Get Folder

```http
GET /folders/{id}
Authorization: Bearer {accessToken}

Response: 200
{
  "id": "uuid",
  "name": "My Folder",
  "parentId": null,
  "ownerId": "uuid",
  "isPublic": false,
  "files": [...],
  "children": [...],
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### Update Folder

```http
PATCH /folders/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Renamed Folder",
  "parentId": "new-parent-id",
  "isPublic": true
}

Response: 200
```

### Delete Folder

```http
DELETE /folders/{id}
Authorization: Bearer {accessToken}

Response: 200
```

### Clone Folder

```http
POST /folders/{id}/clone
Authorization: Bearer {accessToken}

Response: 201
{
  "id": "new-uuid",
  "name": "My Folder (copy)",
  ...
}
```

### Search Folders

```http
GET /folders/search?q={query}
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "name": "Matching Folder",
    ...
  }
]
```

---

## 📄 Files

### Upload File

```http
POST /files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary]
folderId: "uuid-or-empty"
isPublic: false

Response: 201
{
  "id": "uuid",
  "name": "document.pdf",
  "path": "uuid.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "ownerId": "uuid",
  "folderId": null,
  "isPublic": false,
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### List Files

```http
GET /files?folderId={uuid}
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "name": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    ...
  }
]
```

### Get File

```http
GET /files/{id}
Authorization: Bearer {accessToken}

Response: 200
{
  "id": "uuid",
  "name": "document.pdf",
  "path": "uuid.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "owner": {...},
  "folder": {...}
}
```

### Download File

```http
GET /files/{id}/download
Authorization: Bearer {accessToken}

Response: 200
Content-Type: {file-mime-type}
Content-Disposition: attachment; filename="{filename}"

[binary data]
```

### Update File

```http
PATCH /files/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "renamed-document.pdf",
  "folderId": "new-folder-id",
  "isPublic": true
}

Response: 200
```

### Delete File

```http
DELETE /files/{id}
Authorization: Bearer {accessToken}

Response: 200
```

### Clone File

```http
POST /files/{id}/clone
Authorization: Bearer {accessToken}

Response: 201
{
  "id": "new-uuid",
  "name": "document.pdf (copy)",
  ...
}
```

### Search Files

```http
GET /files/search?q={query}
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "name": "matching-file.pdf",
    ...
  }
]
```

---

## 🔗 Permissions & Sharing

### Share Resource

```http
POST /permissions/share
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fileId": "uuid-or-null",
  "folderId": "uuid-or-null",
  "email": "recipient@example.com",
  "permission": "view" // view, edit, delete, share, manage
}

Response: 201
{
  "id": "uuid",
  "fileId": "uuid",
  "folderId": null,
  "userId": "uuid-if-exists",
  "email": "recipient@example.com",
  "permission": "view",
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### Get My Permissions

```http
GET /permissions/my-permissions
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "file": {...},
    "folder": null,
    "permission": "edit"
  }
]
```

### Get Resource Permissions

```http
GET /permissions/resource/{resourceId}?type=file
Authorization: Bearer {accessToken}

Response: 200
[
  {
    "id": "uuid",
    "user": {...},
    "email": "user@example.com",
    "permission": "view"
  }
]
```

### Update Permission

```http
PATCH /permissions/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "permission": "edit"
}

Response: 200
```

### Revoke Permission

```http
DELETE /permissions/{id}
Authorization: Bearer {accessToken}

Response: 200
```

### Generate Public Link

```http
POST /permissions/public-link/{resourceId}?type=file
Authorization: Bearer {accessToken}

Response: 200
{
  "publicLink": "uuid-link"
}
```

### Access Public Resource

```http
GET /permissions/public/{publicLink}?type=file

Response: 200
{
  "id": "uuid",
  "name": "public-file.pdf",
  "isPublic": true,
  ...
}
```

---

## 🔌 WebSocket Events

Connect to WebSocket: `ws://localhost:3000`

### Authentication

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-access-token',
  },
});
```

### Events

#### File Events

- `file:created` - Новий файл створено
- `file:updated` - Файл оновлено
- `file:deleted` - Файл видалено
- `file:shared` - Файл поділився

#### Folder Events

- `folder:created` - Нова папка створена
- `folder:updated` - Папка оновлена
- `folder:deleted` - Папка видалена
- `folder:shared` - Папка поділилася

#### Permission Events

- `permission:granted` - Доступ надано
- `permission:revoked` - Доступ відкликано
- `permission:updated` - Права оновлено

### Example Usage

```javascript
socket.on('file:created', (data) => {
  console.log('New file created:', data);
});

socket.on('permission:granted', (data) => {
  console.log('Access granted to:', data.file || data.folder);
});
```

---

## 🏗️ Architecture

### Modules

- **Auth** - Аутентифікація (JWT access + refresh tokens)
- **Users** - Управління користувачами
- **Files** - Робота з файлами (upload, download, CRUD)
- **Folders** - Ієрархічна система папок
- **Permissions** - Система дозволів і sharing
- **CASL** - Permission-based access control
- **WebSocket** - Real-time синхронізація

### Database Schema

- **users** - Користувачі
- **files** - Файли
- **folders** - Папки (adjacency list з parentId)
- **file_permissions** - Дозволи доступу

### Features

✅ JWT Authentication (access + refresh)  
✅ File Upload/Download (до 100MB)  
✅ Hierarchical Folder System  
✅ File & Folder Management (CRUD, clone, move)  
✅ Search (files & folders by name)  
✅ Public/Private visibility  
✅ Permission System (view, edit, delete, share, manage)  
✅ Share via Email  
✅ Public Links  
✅ Real-time Sync (WebSockets)  
✅ CASL-based Authorization

---

## 🛠️ Tech Stack

- **NestJS** - Backend framework
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **Socket.io** - WebSockets
- **JWT** - Authentication
- **CASL** - Permissions
- **Multer** - File uploads
- **bcrypt** - Password hashing

---

---

## Email Notifications

### Overview

VReal automatically sends professional HTML emails when files/folders are shared, similar to Google Drive.

### Email Types

1. **Share Notification** - Sent to existing users when resources are shared
2. **Invite Notification** - Sent to non-registered emails with signup link
3. **Permission Changed** - Sent when permission levels are updated
4. **Access Revoked** - Sent when access is removed

### Automatic Triggers

Emails are automatically sent during these API operations:

#### Share Resource (New Permission)

``http
POST /permissions/share
Authorization: Bearer {accessToken}
Content-Type: application/json

{
"fileId": "uuid",
"email": "recipient@example.com",
"permission": "edit"
}
