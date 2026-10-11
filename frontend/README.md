# ⚡ TaskSphere Pro — Frontend Web App

Modern, responsive client application for **TaskSphere Pro**, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Authentication Flow**: Login, Registration, and Instant One-Click Demo Sign-In.
- **Real-Time Analytics Dashboard**: Live counters for Total, Completed, In-Progress, High Priority, and Overdue tasks.
- **Search & Multi-Filter Matrix**: Instant keyword search, status tabs (To Do, In Progress, Completed), priority selector, category filter, due date states, and multi-attribute sorting.
- **Task Detail Inspector Modal**: View detailed notes, categories, and inline edits.
- **Dark Mode**: System-aware dark/light theme toggle.
- **Micro-Animations**: Confetti celebration upon task completion.
- **Toast Notifications**: Instant feedback on CRUD actions.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **TypeScript**
- **Tailwind CSS (v4)**
- **Axios** (Cookie session handling)
- `react-confetti`, `react-toastify`, `react-use`

---

## 💻 Local Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Check `.env`:
```env
VITE_API_URL="http://localhost:5001/api"
VITE_APP_NAME="TaskSphere Pro"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Build & Linting

```bash
# Typecheck & build production bundle
npm run build

# Run ESLint check
npm run lint
```
