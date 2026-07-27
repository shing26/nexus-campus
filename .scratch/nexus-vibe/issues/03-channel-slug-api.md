# 03 — Channel Slug & Backend API

**What to build:** Add a slug (varchar 50, unique) column to the Channel entity and its DB table. Create GET /api/v1/channels returning all channels with id/slug/name/description/sortOrder. Add an optional ?channelSlug=prompts query parameter to GET /api/v1/posts that looks up the channel by slug and filters by its id. Update seed data to populate the 7 AI community channels with their slugs.

**Blocked by:** 01 — Entity Wide Refactor

**Status:** ready-for-agent

- [ ] Channel entity has slug field, DB table has slug column (unique)
- [ ] GET /api/v1/channels returns all channels with slug
- [ ] GET /api/v1/posts?channelSlug=xxx filters posts by channel slug
- [ ] Seed data: 7 AI community channels with correct slugs
- [ ] Tests: channel list API + slug filter on posts API
