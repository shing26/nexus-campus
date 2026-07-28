# 06 — Frontend Creation & User Pages

**What to build:** Post creation page (/post/new) with a Markdown editor (textarea + live preview), code block insertion toolbar button (inserts fenced code block), and an inline token estimate counter that displays approximate token count as the user types. User profile page (/user/:id) showing user info + their posts list. Settings page (/user/settings) for password change and profile update. Messages page (/user/messages) listing system notifications.

**Blocked by:** 02 — Frontend Scaffold

**Status:** ready-for-agent

- [ ] Post creation: Markdown textarea + live preview, title, channel selector
- [ ] Code block insertion button in editor toolbar
- [ ] Token estimate counter (rough: Chinese chars × 2, English words × 1.3, code chars × 0.4)
- [ ] User profile: user info display + their post list
- [ ] User settings: password change, profile update forms
- [ ] Messages page: list of system notifications from /api/v1/messages
"@ | Set-Content -Path D:\Nexus-Campus\.scratch\nexus-vibe\issues\06-frontend-creation-user.md -Encoding UTF8

@"
# 07 — Frontend Admin Panel

**What to build:** AdminLayout with a left sidebar containing navigation links (Audit Queue, Dashboard). Audit page (/admin/audit) lists posts pending review with approve/reject actions. Dashboard page (/admin/dashboard) shows basic stats (total posts, pending reviews, recent audits). Admin routes are guarded by role check (only users with role ADMIN can access).

**Blocked by:** 02 — Frontend Scaffold

**Status:** ready-for-agent

- [ ] AdminLayout with sidebar navigation
- [ ] Audit page: pending posts list + approve/reject actions
- [ ] Dashboard page: stats cards (total posts, pending audits, recent activity)
- [ ] Admin route guard: redirect non-admin users to homepage
- [ ] Uses POST /api/v1/admin/audit/{id} and GET /api/v1/admin/dashboard endpoints
