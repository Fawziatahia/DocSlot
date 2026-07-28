# DocSlot — Backend

Doctor appointment management system built with Laravel.

## Built So Far

- **Authentication** — registration, login, logout, password reset, profile retrieval
- **Admin Management** — user management, departments, specializations, system settings, audit logs
- **Doctors** — doctor profiles, schedules, availability slots, search/filter by specialization, department, fee
- **Patients** — patient profiles, medical history, prescriptions view
- **Appointments** — booking with conflict detection, daily cap enforcement, status lifecycle (pending → confirmed → completed), cancellation, rescheduling
- **Prescriptions** — create with multiple medications, view patient/doctor history
- **Medical Records** — categorize by type (lab result, imaging, note, report), patient history
- **Notifications** — per-user notification feed, unread count, mark as read
- **Reports** — appointment, revenue, doctor, patient, and prescription analytics with date range filtering
- **Dashboard** — role-based stats for admin, doctor, and patient

## Tech Stack

- Laravel
- Sanctum (API token auth)
- Tyro RBAC (role-based access control)
