# 02 — Frontend Scaffold

**What to build:** Initialize the rontend/ React project with Vite + TypeScript + Tailwind CSS + React Router + TanStack Query + Zustand. Implement the dual Layout structure: MainLayout (Navbar with Logo + channel nav + search box + user menu, content Outlet, Footer) and AdminLayout (sidebar + content area, no navbar/footer). Set up the route skeleton with all planned routes (homepage, channel/:slug, post/:id, post/new, post/:id/edit, search?q=, login, register, user/:id, user/settings, admin/audit, admin/dashboard). Wire up the API client with TanStack Query and auth store with Zustand. This ticket delivers zero functional pages—only the infrastructure that all subsequent frontend tickets build on.

**Blocked by:** None — can start immediately (parallel with ticket 01)

**Status:** ready-for-agent

- [ ] 
pm create vite with React + TypeScript template
- [ ] Tailwind CSS configured
- [ ] React Router set up with all planned routes and Layout components
- [ ] TanStack Query client configured with API base URL
- [ ] Zustand store for auth (token persistence, current user)
- [ ] API service layer (axios or fetch wrapper) for all existing /api/v1/ endpoints
- [ ] Dev Vite proxy config forwarding /api/ to Spring Boot backend
- [ ] Project builds and dev server starts without errors
