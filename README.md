# DocSlot

A doctor appointment management system — patients book appointments, doctors manage
their schedule and write prescriptions/medical records, and admins manage the
platform. Built as a Laravel API with a separate vanilla JS frontend.

## Structure

```
backend/    Laravel 13 API (Sanctum auth, feature-based architecture)
frontend/   Vite + vanilla JS + Bootstrap 5 SPA, consumes the API over HTTP
```

The two are independent projects — the frontend talks to the backend purely
over its REST API (Bearer token auth), so it can be pointed at any host running
the backend.

## Features

- **Auth** — registration (patients self-register), login, logout, forgot/reset
  password, Sanctum bearer tokens
- **Doctors** — profiles, weekly schedules, availability slots, search/filter by
  specialization, department, and fee
- **Appointments** — booking with slot-conflict detection and daily caps,
  status lifecycle (pending → confirmed → completed), cancellation, rescheduling
- **Ratings** — patients rate a completed appointment once; a doctor's average
  rating and review count update automatically
- **Patients** — profiles, medical history, prescription history
- **Prescriptions** — multi-medication prescriptions written by doctors
- **Medical Records** — categorized by type (lab result, imaging, note, report)
- **Notifications** — per-user feed, unread count, mark as read
- **Reports** — appointment, revenue, doctor, patient, and prescription
  analytics with date-range filtering (admin only)
- **Admin** — user management, departments, specializations, system settings
- **Role-aware dashboards** — separate stats views for admin, doctor, and patient
- **Account deactivation** enforced at the session level — deactivating a
  user, doctor, or patient profile immediately revokes their active sessions,
  not just future logins

## Tech Stack

**Backend**
- Laravel 13, PHP 8.3+
- Laravel Sanctum (API token auth)
- Tyro (role-based access control)
- SQLite by default (swappable via `.env`)

**Frontend**
- Vite
- Vanilla JavaScript (no framework) — feature-based structure mirroring the
  backend's `App\Features\*` organization
- Bootstrap 5 + Bootstrap Icons

## Getting Started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

This seeds a permanent admin account (`admin@docslot.app` / `123456`) along
with departments, specializations, and 50 sample doctors.

The API runs at `http://localhost:8000` by default (`/api/*` routes,
see `backend/routes/api.php`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default. It expects the API at
`http://localhost:8000/api` — override with a `VITE_API_BASE_URL` env var if
your backend runs elsewhere.

### Roles

- **Patient** — self-registers via `/register`
- **Doctor** — created by an admin (from the Doctors admin page, or
  `POST /api/doctors`); the doctor then uses "Forgot password" to set their
  own password
- **Admin** — seeded account above, or promote a user manually

## API Conventions

- Auth is token-based (Sanctum `Authorization: Bearer <token>`), not cookies
- Every response is wrapped as `{success, data, message}` (paginated
  responses add `meta`/`links`); errors are `{success: false, message[, errors]}`
- CORS is open (`*`) for local development

## Repo-specific docs

- [`backend/README.md`](backend/README.md) — backend feature notes
