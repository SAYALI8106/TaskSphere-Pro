# ⚡ TaskSphere Pro — Backend API Service

Production-ready REST API powering **TaskSphere Pro**, built with **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

## 🚀 Key Features

- **Dual-Engine Smart Database**: Seamless zero-config local engine for instant development + PostgreSQL with Prisma ORM for production.
- **JWT & HttpOnly Cookies**: Secure authentication protecting against XSS attacks.
- **Strict User Isolation**: All data queries enforce authenticated `userId` context.
- **Full RESTful Tasks API**: Search, filter, multi-attribute sorting, status tabs, and pagination.
- **Interactive Swagger Docs**: OpenAPI 3.0 specification served at `/api/docs`.
- **Validation**: Strict schema validation using Zod and Express-Validator.
- **Automated Tests**: Comprehensive unit and controller test suites using Jest.

---

## 💻 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Check `.env` (pre-configured with development defaults):
```env
PORT=5001
NODE_ENV=development
FRONTEND_APP_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_manager_development?schema=public"
JWT_SECRET="tasksphere_jwt_secret_dev_key_8106"
```

### 3. Run Development Server
```bash
npm run dev
```
*If PostgreSQL is running, it connects via Prisma. If not, it activates the embedded local store with demo data automatically!*

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Service & DB health check | Public |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user & issue JWT cookie | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie | Protected |
| `GET` | `/api/auth/profile` | Current user profile | Protected |
| `GET` | `/api/tasks` | Get filtered/paginated tasks | Protected |
| `GET` | `/api/tasks/stats` | Dashboard summary metrics | Protected |
| `GET` | `/api/tasks/:id` | Get single task | Protected |
| `POST` | `/api/tasks` | Create task | Protected |
| `PUT` | `/api/tasks/:id` | Update task | Protected |
| `PATCH`| `/api/tasks/:id/toggle` | Toggle task completion | Protected |
| `DELETE`| `/api/tasks/:id` | Delete task | Protected |

Interactive Swagger documentation available at: `http://localhost:5001/api/docs`.

---

## 🧪 Testing

```bash
# Run Jest test suites
npm test

# Build TypeScript
npm run build
```

---

## 🗄️ Database Commands (PostgreSQL)

```bash
# Generate Prisma Client
npm run prisma:generate

# Push Schema to PostgreSQL
npm run prisma:push

# Seed Database
npm run prisma:seed
```
