# 04 — Frontend Auth Pages

**What to build:** Login page (/login) with username/password form, POST to /api/v1/auth/login, store JWT token in Zustand (persisted to localStorage), redirect to homepage on success. Register page (/register) with username/password/nickname form, POST to /api/v1/auth/register, auto-login after success. Auth guard component that redirects unauthenticated users to /login for protected routes. Logout button in MainLayout user menu that clears token and redirects.

**Blocked by:** 02 — Frontend Scaffold

**Status:** ready-for-agent

- [ ] Login page: form submission, token storage, redirect
- [ ] Register page: form submission, auto-login, redirect
- [ ] Auth guard: protected routes check token, redirect to /login
- [ ] Logout: clear token + redirect to homepage
- [ ] MainLayout user menu shows login/register when unauthenticated, username + logout when authenticated
- [ ] Token refresh on page reload (persisted Zustand)
