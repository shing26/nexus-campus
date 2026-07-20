# Nexus-Campus

**AI-Driven Cyberpunk Campus Forum System**

A futuristic, cyberpunk-themed campus forum built with Spring Boot 3.3, MyBatis-Plus, JSP, JWT authentication, Redis caching, and Elasticsearch full-text search. Features DFA-based sensitive word filtering, content audit workflows, and a neon-dark UI inspired by cyberpunk aesthetics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Spring Boot 3.3.5 |
| **Language** | Java 18 |
| **ORM** | MyBatis-Plus 3.5.9 |
| **View** | JSP (Jakarta EE), JSTL 3.0 |
| **Database** | H2 (dev) / MySQL 8 (prod) |
| **Cache** | Redis (Lettuce) |
| **Search** | Elasticsearch 8.13.4 |
| **Auth** | JWT (jjwt 0.12.6) |
| **Security** | XSS Filter, DFA Sensitive Word Filter |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger UI) |
| **Build** | Maven 3.9+ |
| **Deploy** | Docker, docker-compose |
| **Logging** | Logstash Logback Encoder |

---

## Architecture

### MVC Layering

```
Controller (REST + JSP) → Service → Mapper (MyBatis-Plus) → DB
                                    ↓
                              Redis Cache
                                    ↓
                          Elasticsearch (full-text)
```

- **Controller**: REST endpoints (JSON) + JSP view controllers
- **Service**: Business logic, caching, DFA filtering
- **Mapper**: MyBatis-Plus data access
- **Entity**: POJOs mapped to DB tables

### Security Architecture

```
Request → XSS Filter → JWT Auth Filter → Controller
              ↓
       DFA Sensitive Word Engine (AOP-driven)
              ↓
      Audit Workflow (auto-flag + admin review)
```

- **XSS Filter**: Sanitizes all input at servlet level
- **JWT Filter**: Extracts & validates tokens, sets user context
- **DFA Filter**: AOP-based sensitive word detection (two-tier: sensitive + critical)
- **Audit**: Auto-triggered for critical-level content, admin dashboard for review

### Caching Strategy

- Redis used for hot post data, like counters, and session-related cache
- Lettuce connection pool (8 max active)
- Configurable Redis enable/disable per profile

---

## Feature List

### Authentication & User
- [x] User registration & login
- [x] JWT token issuance & validation
- [x] Role-based access (user / admin)
- [x] Personal profile page

### Posts & Categories
- [x] Create, view, list posts (paginated)
- [x] Category-based browsing
- [x] Post tags (many-to-many)
- [x] Rich post detail with comments

### Comments
- [x] Add comments on posts
- [x] Comment listing with pagination
- [x] Input sanitization

### Likes & Social
- [x] Like/unlike posts
- [x] Like counter (Redis-backed)

### Search
- [x] Elasticsearch full-text search integration
- [x] Index posts for search

### Content Moderation
- [x] Two-tier sensitive words (sensitive / critical)
- [x] DFA algorithm for word detection
- [x] Auto-block posts with critical words
- [x] Flag posts with sensitive words for review
- [x] Admin audit dashboard (approve / reject)
- [x] Audit log

### Admin
- [x] Admin audit dashboard
- [x] Post approval workflow
- [x] User message system

### System
- [x] Global exception handler
- [x] AOP logging
- [x] XSS protection filter
- [x] MyBatis-Plus auto-fill (createTime, updateTime, etc.)
- [x] Multi-profile config (dev H2 / prod MySQL)

---

## Quick Start

### Prerequisites

- JDK 18+
- Maven 3.9+
- Redis (optional, can be disabled)
- Elasticsearch 8.x (optional)

### Run in Development Mode

```bash
# Clone the repo
git clone https://github.com/your-org/nexus-campus.git
cd nexus-campus

# Build
mvn clean package -DskipTests

# Run (H2 in-memory DB, auto-creates schema + seed data)
mvn spring-boot:run

# Access
# App:    http://localhost:8081
# H2:     http://localhost:8081/h2-console
# Swagger: http://localhost:8081/swagger-ui.html
```

### Run with MySQL (Production)

```bash
# Start with MySQL profile
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

Edit `application.yml` (mysql profile) with your MySQL credentials.

---

## API Examples

All REST endpoints return JSON via `ApiResponse<T>` wrapper.

### Login

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### Create Post (authenticated)

```bash
curl -X POST http://localhost:8081/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Hello Nexus","content":"Welcome to the cyberpunk campus!","categoryId":1,"tags":[1,2]}'
```

### Like a Post

```bash
curl -X POST http://localhost:8081/api/posts/1/like \
  -H "Authorization: Bearer <TOKEN>"
```

### Add Comment

```bash
curl -X POST http://localhost:8081/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"content":"Great post!"}'
```

### Audit Post (admin)

```bash
curl -X POST http://localhost:8081/api/admin/audit/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"action":"APPROVED","reason":"OK"}'
```

---

## Docker Deployment

### Build & Run with Docker Compose

```yaml
# docker-compose.yml (project root)
version: "3.8"
services:
  app:
    build: .
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=mysql
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/nexus_campus?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=root
      - SPRING_REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: nexus_campus
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

```bash
# Build Docker image
docker build -t nexus-campus .

# Run with Compose
docker-compose up -d
```

### Dockerfile (project root)

```dockerfile
FROM eclipse-temurin:18-jre-alpine
WORKDIR /app
COPY target/nexus-campus.war app.war
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.war"]
```

---

## Project Structure

```
nexus-campus/
├── src/
│   ├── main/
│   │   ├── java/com/nexus/campus/
│   │   │   ├── aspect/               # AOP (logging, DFA filter)
│   │   │   ├── config/               # Spring configs (Security, WebMVC, Redis, XSS, Swagger, MyBatis-Plus)
│   │   │   ├── controller/           # REST controllers + page controllers
│   │   │   ├── dto/                  # Request/Response DTOs
│   │   │   ├── entity/               # MyBatis-Plus entities
│   │   │   ├── filter/               # XSS filter
│   │   │   ├── mapper/               # MyBatis-Plus mappers
│   │   │   ├── security/             # JWT auth filter
│   │   │   ├── service/              # Business logic + implementations
│   │   │   ├── util/                 # DFA filter, JWT util
│   │   │   └── NexusCampusApplication.java
│   │   ├── resources/
│   │   │   ├── mapper/               # MyBatis XML mappers
│   │   │   ├── static/               # Static assets (CSS, JS, images)
│   │   │   ├── application.yml       # Main config
│   │   │   ├── schema.sql            # DB schema
│   │   │   └── data.sql              # Seed data
│   │   └── webapp/WEB-INF/views/     # JSP views
│   │       ├── admin/                # Admin pages
│   │       ├── common/               # Public pages (index, login, register)
│   │       ├── post/                 # Post pages (create, detail)
│   │       └── user/                 # User pages (profile)
│   └── test/
├── pom.xml
├── README.md
├── CHANGELOG.md
├── .gitignore
└── Dockerfile
```

---

## Profiles

| Profile | Database | Redis | Elasticsearch |
|---------|----------|-------|---------------|
| `default` | H2 in-memory | ⚠️ Optional | Optional |
| `mysql` | MySQL 8 | Redis required | Optional |

Set active profile via `SPRING_PROFILES_ACTIVE` env var or `--spring.profiles.active=mysql`.

---

## License

MIT License
