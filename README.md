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

## Deploy on Railway

Deploy this as **2 Railway services** from the same repo:

1. `api` service (Node/Express backend)
2. `web` service (React frontend static build)

### 1) Backend service (`api`)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Required Variables:
  - `PORT=5000` (Railway may override this automatically, that is fine)
  - `MONGO_URI=your_mongodb_connection_string`
  - `JWT_SECRET=your_strong_secret`
  - `CORS_ORIGINS=https://<your-frontend-domain>.up.railway.app`

After deploy, copy the backend public URL, for example:
`https://your-api-name.up.railway.app`

### 2) Frontend service (`web`)
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Required Variables:
  - `REACT_APP_API_URL=https://<your-api-name>.up.railway.app`

The app code automatically appends `/api` in production, so use the backend base URL without `/api`.

### 3) Final wiring
- Update backend `CORS_ORIGINS` to include your final frontend Railway domain.
- Redeploy both services.
- Test:
  - Frontend opens successfully.
  - Login/signup calls succeed.

### Important security note
If secrets were committed in `server/.env`, rotate them before production:
- MongoDB user password
- JWT secret



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
