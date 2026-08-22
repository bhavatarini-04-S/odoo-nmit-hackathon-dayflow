# Dayflow

Dayflow is a full-stack **HR Management System (HRMS)** built for the Odoo × NMIT Hackathon. It provides role-based workflows for employees, HR, and admins — covering attendance, leave, payroll, and analytics — with a premium React/TypeScript frontend and a FastAPI + MongoDB backend.

## Features

### Employee
- Personal dashboard with quick stats
- Profile management
- Check-in / check-out attendance tracking
- Leave request submission and history
- Payroll history view

### Admin / HR
- Admin dashboard with organization-wide overview
- Employee management (create, update, delete)
- Attendance oversight across the organization
- Leave request approvals/rejections
- Payroll management
- Analytics dashboard
- In-app notifications

### Platform
- Role-based access control (`employee`, `hr`, `admin`)
- JWT-based authentication
- Public landing page, login, and sign-up flows

## Tech Stack

**Frontend**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [React Router](https://reactrouter.com/) — routing, with protected/role-based routes
- [Zustand](https://github.com/pmndrs/zustand) — state management
- [Radix UI](https://www.radix-ui.com/) + shadcn/ui-style components — accessible UI primitives
- [Recharts](https://recharts.org/) — analytics charts
- [Sonner](https://sonner.emilkowal.ski/) — toast notifications
- [Lucide React](https://lucide.dev/) — icons
- [date-fns](https://date-fns.org/) — date utilities

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [MongoDB](https://www.mongodb.com/) via [Motor](https://motor.readthedocs.io/) / PyMongo — database
- [python-jose](https://github.com/mpdavis/python-jose) — JWT authentication
- [passlib](https://passlib.readthedocs.io/) (bcrypt) — password hashing
- [Pydantic](https://docs.pydantic.dev/) — data validation/settings

**Tooling**
- ESLint / oxlint — linting
- Prettier (with Tailwind plugin) — formatting

## Project Structure

```
odoo-nmit-hackathon-dayflow/
├── src/                    # Frontend source
│   ├── pages/               # Route-level pages (public, auth, employee, admin)
│   ├── routes/               # AppRoutes + ProtectedRoute (role-based guards)
│   └── components/           # Shared UI and layout components
├── @/components/ui/         # shadcn/ui-style component primitives
├── public/                 # Static assets
├── backend/                 # FastAPI backend
│   ├── app/                  # Application code (routers, models, auth, etc.)
│   ├── requirements.txt
│   └── README.md             # Backend-specific docs
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.11+
- A MongoDB instance (local or Atlas)

### Frontend Setup

```bash
npm install
npm run dev
```

The app will be available at the local Vite dev server URL (typically `http://localhost:5173`).

Log in with any seeded employee email and the demo password `dayflow123`.

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see `.env.example` for the required variables: `MONGODB_URL`, `DB_NAME`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`).

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Overview

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/login`, `POST /auth/signup`, `GET /auth/me` |
| **Employees** | `GET/POST /employees`, `GET/PUT/DELETE /employees/{id}` |
| **Attendance** | `GET /attendance`, `POST /attendance/check-in`, `POST /attendance/check-out`, `GET/PUT /attendance/{id}` |
| **Leaves** | `GET/POST /leaves`, `PUT /leaves/{id}/decision`, `DELETE /leaves/{id}` |
| **Payroll** | `GET/POST /payroll`, `GET/PUT/DELETE /payroll/{id}` |
| **Notifications** | `GET /notifications`, `GET /notifications/unread`, `PUT /notifications/{id}/mark-read`, `PUT /notifications/mark-all-read` |

Authenticated requests use a bearer token:

```
Authorization: Bearer <your_token>
```

Roles determine access: **employee** (own data + check-in/out + leave requests), **hr** (org-wide data + leave/payroll approvals), **admin** (full access including employee management).

## Checks

```bash
npm run build
npm run lint
```

## Security Note

`.env.example` should only ever contain placeholder values. Double-check that no real database credentials or secrets are committed to the repository (rotate them if they were), and that `backend/.env` is listed in `.gitignore`.

## License

No license specified yet — consider adding one (e.g. MIT) if you plan to open this project up for contributions.

## Deployment Link

https://bhavatarini-04-s.github.io/odoo-nmit-hackathon-dayflow/
