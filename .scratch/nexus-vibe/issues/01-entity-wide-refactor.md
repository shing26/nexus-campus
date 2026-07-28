# 01 — Entity Wide Refactor

**What to build:** Rename all BBS-prefixed entities and database tables to Vibe-domain names in a single atomic change. This includes: Java entity classes (BbsPost → VibePost, BbsCategory → Channel, BbsComment → VibeComment, BbsTag → VibeTag), all Mapper interfaces, Service interfaces and implementations, controllers, DTOs, MyBatis XML mapper files, schema.sql table names (RENAME TABLE), and data.sql seed data references. The sys_user and sys_message tables/entities are excluded.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] All Java entity classes renamed (BbsPost → VibePost, BbsCategory → Channel, BbsComment → VibeComment, BbsTag → VibeTag)
- [ ] Mapper interfaces + MyBatis XML updated to new entity/table names
- [ ] All Service interfaces and implementations updated
- [ ] All Controllers and DTOs updated
- [ ] schema.sql: RENAME TABLE statements + new table names
- [ ] data.sql: seed data updated to new table names + channel content
- [ ] Project compiles and existing tests pass
