# Team Task Manager

A full-stack project management app where teams can create projects, assign tasks, and track progress.

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT

## Main Features
- Signup/Login with JWT
- Role-based access (`admin`, `member`)
- Admin can create projects and assign members
- Admin can create tasks and assign tasks to project members
- Members can update only their own assigned tasks (status only)
- Dashboard with total, completed, pending, and overdue task counts

## Project Structure
```text
team-task-manager/
  client/        # React frontend
  server/        # Express backend
  package.json   # root scripts (run both frontend and backend)
```

## Setup
1. Install root dependencies:
```bash
npm install
```


## Run the App
From project root:
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`



Demo accounts:
- Admin: `admin@teamtask.com` / `password123`
- Member: `member@teamtask.com` / `password123`

## Role Rules
- Admin:
  - Create project
  - Add one or more members while creating project
  - Create task and assign to member from the active project
- Member:
  - View project tasks
  - Update status only for tasks assigned to self
  - Cannot edit other members' tasks

## API Endpoints
- Auth
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/auth/users` (admin only)
- Projects
  - `POST /api/projects` (admin only)
  - `GET /api/projects`
- Tasks
  - `POST /api/tasks` (admin only)
  - `GET /api/tasks/:projectId`
  - `PUT /api/tasks/:id`

