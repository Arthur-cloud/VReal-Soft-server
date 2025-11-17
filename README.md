# 🚀 VReal Server - Cloud Storage Backend API

Professional NestJS backend for VReal cloud storage platform with file management, granular permissions, email notifications, and real-time updates.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## ✨ Features Overview

### 🔐 Authentication & Security
- **JWT Authentication** - Access + refresh token strategy
- **Bcrypt Password Hashing** - Secure password storage
- **Protected Routes** - Guard-based authorization
- **CASL Authorization** - Attribute-based access control (ABAC)
- **CORS Protection** - Configurable origin allowlist

### 📁 File Management
- **File Upload** - Multipart form data with validation
- **File Download** - Secure file streaming
- **File Metadata** - Name, size, MIME type, timestamps
- **File Operations** - Rename, move, duplicate, delete
- **Size Limits** - Configurable max file size
- **Type Validation** - MIME type restrictions

### 📂 Folder System
- **Nested Folders** - Hierarchical folder structure
- **Folder CRUD** - Create, read, update, delete
- **Folder Operations** - Move, rename, duplicate
- **Parent-Child** - Automatic relationship management
- **Breadcrumb Support** - Folder path resolution

### 👥 Sharing & Permissions
- **User-based Sharing** - Share with specific emails
- **Public Links** - Generate shareable URLs
- **Granular Permissions:**
  - 👁️ **View** - View and download only
  - ✏️ **Edit** - Modify file content
  - 🗑️ **Delete** - Remove files/folders
  - 🔗 **Share** - Share with others
  - ⚙️ **Manage** - Full permission control
- **Permission Updates** - Change access levels
- **Access Revocation** - Remove permissions instantly

### 📧 Email Notification System
- **Professional HTML Templates** - Beautiful responsive emails
- **4 Email Types:**
  1. **Share Notification** - Resource shared with existing user
  2. **Invite Notification** - New user invited to platform
  3. **Permission Changed** - Access level updated
  4. **Access Revoked** - Permission removed
- **SMTP Support** - Gmail, SendGrid, Mailgun, Amazon SES
- **Template Engine** - Handlebars for customization
- **Error Handling** - Non-blocking email failures

### ⚡ Real-time Features
- **WebSocket Gateway** - Socket.io integration
- **Event Broadcasting** - File/folder/permission events
- **Auto Cache Invalidation** - Frontend sync
- **Live Updates** - Instant UI refresh

### 🏛️ Architecture
- **Nx Monorepo** - Modular library structure
- **Clean Architecture** - Separation of concerns
- **TypeORM** - Type-safe database operations
- **Database Migrations** - Version-controlled schema
- **Swagger Documentation** - Auto-generated API docs
- **Environment Config** - Secure configuration management

---

## 🏗️ Project Structure

```
VReal-server/
├── src/
│   ├── libs/                    # Nx-style modular libraries
│   │   ├── casl/               # Authorization (CASL)
│   │   │   ├── factories/      # Ability factories
│   │   │   ├── guards/         # Permission guards
│   │   │   └── decorators/     # Auth decorators
│   │   ├── common/             # Shared utilities
│   │   │   ├── constants/      # App constants
│   │   │   ├── enums/          # Enums (Permission levels)
│   │   │   ├── exceptions/     # Custom exceptions
│   │   │   └── utils/          # Helper functions
│   │   ├── email/              # Email service
│   │   │   ├── templates/      # Handlebars templates
│   │   │   ├── email.service.ts
│   │   │   └── email.module.ts
│   │   ├── websocket/          # WebSocket module
│   │   │   ├── gateways/       # Socket.io gateways
│   │   │   ├── enums/          # WebSocket events
│   │   │   └── types/          # Event types
│   │   └── data-access/        # Database layer
│   │       ├── database/       # TypeORM config
│   │       ├── data-access-user/
│   │       ├── data-access-file/
│   │       ├── data-access-folder/
│   │       └── data-access-file-permission/
│   └── modules/                # Feature modules
│       ├── auth/               # Authentication
│       │   ├── strategies/     # JWT strategies
│       │   ├── guards/         # Auth guards
│       │   └── decorators/     # User decorators
│       ├── users/              # User management
│       ├── files/              # File operations
│       ├── folders/            # Folder operations
│       └── permissions/        # Sharing & permissions
├── uploads/                    # File storage
├── .env                        # Environment variables
├── docker-compose.yml          # Production Docker config
├── docker-compose.dev.yml      # Development Docker config
├── Dockerfile                  # Production Dockerfile
├── EMAIL_SETUP_GUIDE.md        # Email configuration guide
├── API_DOCUMENTATION.md        # REST API documentation
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 14+ (or use Docker)
- **npm** or **yarn**

### Installation

```bash
# Clone repository (if not already)
git clone https://github.com/your-username/VReal.git
cd VReal/VReal-server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# See "Environment Variables" section below
```

### Environment Variables

Create `.env` file with the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vreal
DB_RUN_MIGRATIONS=false

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_ACCESS_SECRET=change-this-to-strong-random-secret
JWT_REFRESH_SECRET=change-this-to-another-strong-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Application
PORT=3000
UPLOAD_FOLDER=./uploads
BASE_URL=http://localhost:5173

# CORS
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Required for sharing features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@vreal.com
EMAIL_FROM_NAME=VReal
```

**📧 Email Setup:** See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) for detailed email configuration.

### Database Setup

```bash
# Option 1: Use Docker (recommended)
docker-compose up -d postgres

# Option 2: Install PostgreSQL locally
# Create database manually:
# CREATE DATABASE vreal;

# Run migrations
npm run migration:run
```

### Running the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Access the API:
- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

---

## 🐳 Docker Deployment

### Quick Start

```bash
# Production (all services)
docker-compose up -d

# Development (with hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Full Docker Guide:** See [../DOCKER_GUIDE.md](../DOCKER_GUIDE.md)

### Services

| Service | Port | Description |
|---------|------|-------------|
| **backend** | 3000 | NestJS API |
| **postgres** | 5432 | PostgreSQL database |
| **pgadmin** | 5050 | Database UI (optional) |

---

## 📚 API Documentation

### Swagger/OpenAPI

Interactive API documentation available at:

**http://localhost:3000/api**

### Key Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/auth/register` | Register new user |
| **Auth** | POST | `/auth/login` | Login user |
| **Auth** | POST | `/auth/refresh` | Refresh tokens |
| **Files** | POST | `/files/upload` | Upload file |
| **Files** | GET | `/files` | List files |
| **Files** | GET | `/files/:id/download` | Download file |
| **Files** | PATCH | `/files/:id` | Update file |
| **Files** | DELETE | `/files/:id` | Delete file |
| **Folders** | POST | `/folders` | Create folder |
| **Folders** | GET | `/folders` | List folders |
| **Folders** | GET | `/folders/:id` | Get folder |
| **Folders** | PATCH | `/folders/:id` | Update folder |
| **Folders** | DELETE | `/folders/:id` | Delete folder |
| **Permissions** | POST | `/permissions/share` | Share resource (sends email!) |
| **Permissions** | GET | `/permissions/my` | Get my permissions |
| **Permissions** | PATCH | `/permissions/:id` | Update permission |
| **Permissions** | DELETE | `/permissions/:id` | Revoke permission |
| **Permissions** | POST | `/permissions/public-link` | Generate public link |

**Full API Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📧 Email System

VReal automatically sends beautiful HTML emails for sharing operations.

### Email Templates

1. **Share Notification** (`share-notification.hbs`)
   - Sent to existing users
   - Purple gradient design
   - Direct access button

2. **Invite Notification** (`invite-notification.hbs`)
   - Sent to new users
   - Pink/orange gradient
   - Signup CTA + resource preview

3. **Permission Changed** (`permission-changed.hbs`)
   - Sent on permission updates
   - Green gradient
   - Before/after permission display

4. **Access Revoked** (`access-revoked.hbs`)
   - Sent when access removed
   - Yellow/orange gradient
   - Warning message

### Email Configuration

**Gmail Setup (Quick):**

1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

**Production SMTP:**

- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **Amazon SES**: email-smtp.us-east-1.amazonaws.com:587

**Complete Guide:** [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)

---

## 🗄️ Database

### TypeORM Entities

- **users** - User accounts
- **files** - File metadata and storage
- **folders** - Folder hierarchy
- **file_permissions** - Sharing and permissions

### Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 🔧 Available Scripts

```bash
# Development
npm run start              # Start (no watch)
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start with debugger

# Build
npm run build              # Build for production
npm run start:prod         # Run production build

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format with Prettier

# Database
npm run typeorm            # TypeORM CLI
npm run migration:run      # Run migrations
npm run migration:revert   # Revert migration
npm run migration:generate # Generate migration
npm run migration:create   # Create empty migration

# Docker
docker-compose up -d                        # Production
docker-compose -f docker-compose.dev.yml up # Development
docker-compose down                         # Stop all
docker-compose logs -f backend              # View logs
```

---

## 🔒 Security Best Practices

- ✅ **Strong JWT Secrets** - Use `openssl rand -base64 32`
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **SQL Injection** - TypeORM parameterized queries
- ✅ **CORS** - Whitelist specific origins
- ✅ **File Validation** - Size and type checks
- ✅ **Environment Variables** - Never commit `.env`
- ✅ **Rate Limiting** - Ready for implementation
- ✅ **Helmet** - Security headers (add in production)

---

## 🚀 Production Deployment

### Checklist

- [ ] Generate strong JWT secrets (`openssl rand -base64 32`)
- [ ] Configure production database credentials
- [ ] Set up production SMTP (SendGrid/Mailgun/SES)
- [ ] Update `BASE_URL` and `CORS_ORIGIN`
- [ ] Enable `DB_RUN_MIGRATIONS=true` (first deploy only)
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx/Traefik)
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Configure firewall rules

### Environment Example

```env
# Production .env
DB_HOST=prod-db.example.com
JWT_ACCESS_SECRET=<strong-random-32-char-string>
BASE_URL=https://vreal.yourdomain.com
CORS_ORIGIN=https://vreal.yourdomain.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
```

---

## 📖 Additional Documentation

| Document | Description |
|----------|-------------|
| [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) | Email configuration (Gmail, SendGrid, etc.) |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | REST API endpoints & examples |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Architecture overview |
| [../DOCKER_GUIDE.md](../DOCKER_GUIDE.md) | Docker deployment guide |
| [../README.md](../README.md) | Main project README |

---

## 🤝 Contributing

1. Follow NestJS best practices
2. Use TypeScript strictly (strict mode enabled)
3. Add Swagger decorators to all endpoints
4. Write unit tests for services
5. Update API documentation
6. Add email templates for new notifications

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with excellent tools:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - TypeScript ORM
- [PostgreSQL](https://www.postgresql.org/) - Powerful database
- [Nodemailer](https://nodemailer.com/) - Email sending
- [Socket.io](https://socket.io/) - Real-time engine
- [Swagger](https://swagger.io/) - API documentation

---

<p align="center">Made with ❤️ for secure file sharing</p>

### ✨ Features

- 🔐 **JWT Authentication** - Secure access & refresh tokens
- 📁 **File Management** - Upload, download, organize files
- 📂 **Folder Hierarchy** - Nested folder structure
- 🔗 **Public Links** - Share files/folders via public URLs
- 👥 **Granular Permissions** - View, Edit, Delete, Share, Manage levels
- 📧 **Email Notifications** - Beautiful HTML emails for sharing
- ⚡ **WebSocket** - Real-time updates
- 🏛️ **CASL Authorization** - Attribute-based access control
- 🗄️ **PostgreSQL** - TypeORM with migrations
- 📚 **Nx Monorepo** - Modular library architecture
- 📖 **Swagger API** - Auto-generated documentation

### 📧 Email System

VReal includes a professional email notification system similar to Google Drive:

- ✅ Share notifications for existing users
- ✅ Invitation emails for new users  
- ✅ Permission change notifications
- ✅ Access revoked notifications

**Setup Guide:** See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)

## Project setup

```bash
$ npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vreal

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# Email (See EMAIL_SETUP_GUIDE.md)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Full Setup:** See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) for email configuration.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
