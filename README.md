# ⚡ TaskSphere Pro

> **Enterprise Task & Workflow Intelligence Platform**  
> A high-performance, full-stack productivity workspace engineered with **React 19**, **TypeScript**, **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. Features strict user isolation, dual-engine data storage (instant zero-config local engine + PostgreSQL production adapter), multi-criteria filtering matrix, real-time analytics dashboard, and a modern responsive UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E=18.0-green.svg?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325.svg?logo=jest)](https://jestjs.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Highlights & Key Capabilities

### 🚀 Instant Zero-Configuration Startup
- **Dual-Engine Smart Database**: Runs out-of-the-box with an embedded persistent local store—no external database installation required! When a PostgreSQL instance is detected or configured, TaskSphere automatically switches to **Prisma + PostgreSQL** with multi-column relational indexing.
- **One-Click Demo Access**: Includes pre-seeded demo accounts (`sam@example.com` / `password123`) populated with realistic sample tasks across categories, priorities, and due dates.

### 🔐 Enterprise Authentication & Data Security
- **Defense-in-Depth Auth**: Password hashing using `bcryptjs` (salt rounds = 10) and signed JSON Web Tokens (JWT).
- **HttpOnly Cookie Architecture**: JWT tokens are transmitted exclusively via secure `HttpOnly` cookies, eliminating client-side XSS credential harvesting vulnerabilities.
- **Strict Tenant & User Isolation**: All read/write database queries are strictly scoped to the authenticated `userId`. Users can never access or mutate another user's tasks ($404/403$ responses).

### 📋 Full-Lifecycle Task Management
- **Lifecycle States**: Track tasks seamlessly across `TODO`, `IN_PROGRESS`, and `COMPLETED`.
- **Priority Matrix**: Color-coded `LOW`, `MEDIUM`, and `HIGH` priority indicators.
- **Categories & Tags**: Organize tasks by categories (e.g., *Engineering*, *Design*, *Security*, *Feature*).
- **Intelligent Due Date & Overdue Engine**: Automated real-time calculations for *Overdue*, *Due Today*, and *Upcoming* deadlines with visual alerts.
- **Comprehensive Task Detail Modal**: In-depth inspector modal for notes, timestamps, categories, priorities, and inline modifications.

### 🔍 Real-Time Search & Multi-Factor Filtering Matrix
- **Instant Search**: Debounced live searching across task titles, notes, and category tags.
- **Status Tabs**: Fast switching between *All Tasks*, *To Do*, *In Progress*, and *Completed*.
- **Multi-Attribute Sorting**: Order tasks by creation time (Newest/Oldest), priority (High → Low, Low → High), due date (Earliest first), or title (A → Z).
- **One-Click Reset Toolbar**: Clear all active filters and return to default view in one click.

### 📊 Real-Time Analytics Dashboard
- **Live Summary Metrics**: Real-time counter cards for Total Tasks, Completed, In-Progress, High Priority, and Overdue tasks.
- **Micro-Interaction Celebrations**: Dynamic confetti feedback upon task completion.

---

## 🏗️ System Architecture

```
                                  [ Browser Client ]
                                           │
                             (React 19 + TypeScript + Vite)
                                           │
                                 Axios (Credentials / Cookies)
                                           ▼
                           ┌───────────────────────────────┐
                           │   Express 5 API Gateway       │
                           │   (CORS, CookieParser, Logger)│
                           └───────────────┬───────────────┘
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
         [ Public Auth Routes ]                         [ Authenticated Tasks ]
        (/api/auth/register, /login)                      │ (JWT Cookie Middleware)
                   │                                               │
                   ▼                                               ▼
          [ Auth Controller ]                             [ Tasks Controller ]
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │   Smart Database Layer        │
                           │   (Auto-Detect & Switch)      │
                           └───────┬───────────────┬───────┘
                                   │               │
                 If PostgreSQL Connected     Fallback / Zero-Config
                                   │               │
                                   ▼               ▼
                       [ Prisma ORM Client ]   [ Embedded Persistent ]
                                   │           [ Local JSON Store    ]
                                   ▼
                       [ PostgreSQL Database ]
```

---

## 📐 Database Schema & Entity Relationships

```
┌─────────────────────────────────┐         ┌──────────────────────────────────────┐
│              User               │         │                 Task                 │
├─────────────────────────────────┤         ├──────────────────────────────────────┤
│ id        Int (PK, Auto-inc)    │ 1     * │ id          Int (PK, Auto-inc)       │
│ email     String (Unique)       ├─────────┤ title       String                   │
│ name      String                │         │ description String?                  │
│ password  String (Bcrypt Hashed)│         │ status      Enum(Status)             │
│ createdAt DateTime (Default Now)│         │ priority    Enum(Priority)           │
│ updatedAt DateTime (Updated)    │         │ dueDate     DateTime? (Map: due_date)│
└─────────────────────────────────┘         │ category    String (Default General) │
                                            │ done        Boolean (Default false)  │
                                            │ userId      Int (FK -> User.id)      │
                                            │ createdAt   DateTime (Default Now)   │
                                            │ updatedAt   DateTime (Updated)       │
                                            └──────────────────────────────────────┘
```

### Relational Indexes
- `@@index([userId, status])` – Optimized for fast status tab filtering.
- `@@index([userId, priority])` – Accelerated priority sorting and analytics.
- `@@index([userId, dueDate])` – Efficient calculation of overdue and due-today tasks.

---

## 🛠️ Tech Stack Overview

| Area | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Glassmorphism design |
| **Backend API** | Node.js, Express 5, TypeScript, Winston Logger |
| **Data Persistence** | Dual-Engine: Prisma ORM 7 + PostgreSQL 16 / Embedded Zero-Config Store |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, HttpOnly Cookies |
| **Validation** | Zod (runtime typing), Express-Validator (HTTP route middleware) |
| **API Documentation**| Swagger UI (`swagger-jsdoc`, `swagger-ui-express`) |
| **Testing** | Jest, ts-jest, Unit & Controller Test Suites |
| **DevOps & Tooling** | Docker Compose, Concurrently, ESLint 9 |

---

## ⚡ Quickstart (Zero Configuration)

You can run the entire application immediately without installing or configuring any database!

### 1. Clone the Repository
```bash
git clone https://github.com/SAYALI8106/Task-Manager.git
cd Task-Manager
```

### 2. Install Dependencies
```bash
# Install root orchestration packages
npm install

# Install backend and frontend dependencies
npm --prefix backend install
npm --prefix frontend install
```

### 3. Start Both Backend & Frontend Concurrently
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Interactive Swagger Docs**: [http://localhost:5001/api/docs](http://localhost:5001/api/docs)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### 4. Sign in with Demo Account
On the Login screen, either click **"🚀 Demo Login"** or enter:
- **Email**: `sam@example.com`
- **Password**: `password123`

*(You can also click "Create account" to register your own custom user!)*

---

## 🐳 Running with PostgreSQL & Docker (Optional)

If you prefer to run with a full PostgreSQL 16 container:

1. **Spin up PostgreSQL via Docker Compose**:
   ```bash
   docker compose up -d
   ```

2. **Run Prisma Migrations & Seed**:
   ```bash
   npm --prefix backend run prisma:push
   npm --prefix backend run prisma:seed
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```
   *TaskSphere will automatically detect PostgreSQL on port 5432 and route all queries through Prisma ORM.*

---

## 🔌 API Reference & Endpoints

Interactive Swagger documentation is available live at `http://localhost:5001/api/docs`.

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Login user & issue HttpOnly JWT cookie | ❌ |
| `POST` | `/api/auth/logout` | Invalidate cookie & clear session | 🔒 |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | 🔒 |

### Task Management Endpoints
| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get filtered & paginated tasks | `q`, `status`, `priority`, `category`, `dueFilter`, `sortBy`, `order`, `page`, `limit` |
| `GET` | `/api/tasks/stats` | Retrieve dashboard metric counts | None |
| `GET` | `/api/tasks/:id` | Get single task details | None |
| `POST` | `/api/tasks` | Create a new task | Body: `title`, `description`, `priority`, `status`, `category`, `dueDate` |
| `PUT` | `/api/tasks/:id` | Update existing task | Partial task payload |
| `PATCH`| `/api/tasks/:id/toggle`| Toggle task completion status | None |
| `DELETE`| `/api/tasks/:id`| Permanently delete task | None |

### System & Health Endpoints
| Method | Endpoint | Description | Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service & database health probe | Status, database mode, uptime |

---

## 🧪 Testing & Code Quality

TaskSphere includes automated unit and controller tests written with **Jest** and **ts-jest**:

```bash
# Run all backend unit & controller tests
npm test

# Run frontend linting check
npm run lint

# Compile and check TypeScript builds
npm run build
```

---

## 📂 Project Structure

```
Task-Manager/
├── docker-compose.yml          # PostgreSQL 16 container definition
├── package.json                # Root orchestration & unified scripts
├── README.md                   # Comprehensive platform documentation
│
├── backend/                    # Express + TypeScript API server
│   ├── data/                   # Persistent local storage (zero-config mode)
│   ├── prisma/                 # Prisma schema, migrations, seed script
│   │   ├── schema.prisma       # Relational models & database indexes
│   │   └── seed.ts             # Initial database seed script
│   ├── src/
│   │   ├── __tests__/          # Jest test suites (controllers, models, validators)
│   │   ├── config/             # DB connection detector, Prisma client, localStore
│   │   ├── controllers/        # Auth and Tasks request handlers
│   │   ├── middlewares/        # JWT auth, error handler, request logger
│   │   ├── models/             # Dual-engine Task and User data abstractions
│   │   ├── routes/             # Express routes with Swagger annotations
│   │   ├── types/              # Zod schemas & TypeScript type definitions
│   │   ├── utils/              # Swagger setup, password hasher, env validator
│   │   ├── validators/         # Express-validator request rule sets
│   │   └── server.ts           # Express server entry point
│   └── package.json
│
└── frontend/                   # React 19 + Vite + Tailwind CSS Client
    ├── public/                 # Static assets & favicon
    ├── src/
    │   ├── components/         # UI components (TaskList, TaskItem, TaskForm, Stats, Modal)
    │   │   └── ui/             # Reusable primitives (Button, Card, Badge, Spinner)
    │   ├── contexts/           # AuthContext (session, login, register, logout)
    │   ├── hooks/              # Custom hooks (useTasks, useDarkMode)
    │   ├── services/           # Axios instance & REST API clients
    │   ├── types/              # Frontend TypeScript interfaces
    │   ├── App.tsx             # Main workspace view with filter bar & toolbar
    │   └── main.tsx            # React root mount
    └── package.json
```

---

## 💡 Technical Interview & Architecture Talking Points

When presenting or discussing TaskSphere in technical interviews:

1. **Dual-Engine Graceful Degradation**: How the server probes PostgreSQL on startup and falls back gracefully to a file-backed store without crashing or requiring manual developer interventions.
2. **Stateless JWT with Defense-in-Depth Cookie Security**: Preventing XSS token theft via `HttpOnly`, `SameSite=lax/none`, and `Secure` cookie policies.
3. **Compound Database Indexing Strategy**: Why multi-column indexes `(user_id, status)` and `(user_id, priority)` maintain $O(\log N)$ query complexity under high concurrent user load.
4. **Clean Domain Separation & Custom Hook Architecture**: Separation between UI rendering, business logic in `useTasks`, API communication in `taskApi`, and session persistence in `AuthContext`.
5. **Type Safety Across the Full Stack**: Zod schemas on backend routes paired with strict TypeScript interfaces on frontend components guarantee end-to-end data integrity.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
