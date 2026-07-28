# 12 — JSP Cleanup

**What to build:** Delete all JSP-related artifacts after verifying that the React frontend has fully covered all functional pages. Remove: PageController.java, src/main/webapp/WEB-INF/views/ directory (all JSP files). Remove JSP dependencies from pom.xml: 	omcat-embed-jasper, jakarta.servlet.jsp.jstl-api, jakarta.servlet.jsp.jstl. Verify that no functional path still relies on JSP views (all routes should now be SPA-handled or return 404).

**Blocked by:** 05 — Frontend Browsing & Content Pages, 06 — Frontend Creation & User Pages, 07 — Frontend Admin Panel (all frontend pages verified working)

**Status:** ready-for-agent

- [ ] Delete PageController.java
- [ ] Delete src/main/webapp/WEB-INF/views/ directory
- [ ] Remove JSP dependencies from pom.xml
- [ ] Verify no compilation errors
- [ ] Verify backend starts without JSP-related errors
- [ ] Confirm all page routes are handled by React frontend
