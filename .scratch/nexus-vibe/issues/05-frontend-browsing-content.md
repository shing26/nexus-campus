# 05 — Frontend Browsing & Content Pages

**What to build:** The core "read" pages of the application. Homepage (/) displays hot posts (gravity-decay ranked) and channel navigation grid. Channel page (/channel/:slug) lists posts filtered by channel with pagination. Search page (/search?q=xxx) displays keyword search results with pagination. Post detail page (/post/:id) is the most complex page: renders post content with Markdown and syntax-highlighted code blocks, one-click copy button on code blocks, comment list with pagination, comment submission form, and a placeholder slot for the AI review badge (actual badge implemented in ticket 09). All pages share a reusable post card component and pagination component.

**Blocked by:** 02 — Frontend Scaffold, 03 — Channel Slug & Backend API

**Status:** ready-for-agent

- [ ] Homepage: hot posts list + channel navigation grid
- [ ] Channel page: paginated post list filtered by channel slug
- [ ] Search page: paginated post list filtered by keyword (reads ?q= from URL)
- [ ] Post detail: Markdown rendering with react-markdown
- [ ] Code blocks: syntax highlighting via react-syntax-highlighter + one-click copy button
- [ ] Comment section: list comments with pagination, submit new comment
- [ ] AI review badge placeholder on post detail page
- [ ] Reusable PostCard component + Pagination component
