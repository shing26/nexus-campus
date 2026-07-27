# 06 — Frontend Creation & User Pages

**What to build:** Post creation page (`/post/new`) with a Markdown editor (textarea + live preview), code block insertion toolbar button (inserts fenced code block), and an inline token estimate counter that displays approximate token count as the user types. User profile page (`/user/:id`) showing user info + their posts list. Settings page (`/user/settings`) for password change and profile update. Messages page (`/user/messages`) listing system notifications.

**Blocked by:** 02 — Frontend Scaffold

**Status:** ready-for-agent

- [ ] Post creation: Markdown textarea + live preview, title, channel selector
- [ ] Code block insertion button in editor toolbar
- [ ] Token estimate counter (rough: CJK chars weighted higher than ASCII)
- [ ] User profile: user info display + their post list
- [ ] User settings: password change, profile update forms
- [ ] Messages page: list of system notifications from `/api/v1/messages`
