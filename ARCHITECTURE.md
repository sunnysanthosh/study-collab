# StudyCollab Architecture Documentation

## System Overview

StudyCollab is a real-time collaboration platform for students built with a modern microservices architecture. The system is containerized using Docker and orchestrated for easy deployment and scalability.

## Architecture Pattern

**Microservices Architecture** with clear separation of concerns:
- Frontend Service (Next.js)
- Backend API Service (Node.js/Express)
- WebSocket Service (Socket.IO)
- Database Service (PostgreSQL)
- Redis Cache Service (Optional)

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: CSS Modules + CSS Variables
- **Real-time**: Socket.IO Client
- **State Management**: React Context + Hooks

### Backend Services
- **API Gateway**: Express.js with TypeScript
- **WebSocket Server**: Socket.IO Server
- **Database**: PostgreSQL
- **Cache**: Redis (optional)
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 or local storage

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (development) / Kubernetes (production)
- **Reverse Proxy**: Nginx (optional)

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼─────┐                ┌──────▼──────┐
   │  Next.js │                │  WebSocket  │
   │ Frontend │                │   Client    │
   └────┬─────┘                └──────┬──────┘
        │                             │
        │ HTTP/HTTPS                  │ WebSocket
        │                             │
┌───────▼─────────────────────────────▼───────────────┐
│              Nginx Reverse Proxy (Optional)          │
└───────┬─────────────────────────────┬───────────────┘
        │                             │
   ┌────▼─────┐                ┌──────▼──────┐
   │   API    │                │ WebSocket   │
   │ Service  │                │   Service   │
   │(Express) │                │ (Socket.IO) │
   └────┬─────┘                └──────┬──────┘
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼─────┐                ┌──────▼──────┐
   │PostgreSQL│                │    Redis    │
   │ Database │                │   (Cache)   │
   └──────────┘                └─────────────┘
```

## Module Structure

### Frontend Modules (`/frontend`)
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (proxy)
│   │   ├── (auth)/             # Auth routes
│   │   ├── (dashboard)/        # Protected routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   └── collab/             # Collaboration features
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, socket client
│   └── types/                  # TypeScript types
├── public/                     # Static assets
└── package.json
```

### Backend API Module (`/backend/api`)
```
backend/
├── api/
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Database models
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── utils/              # Utilities
│   │   └── config/             # Configuration
│   ├── tests/                  # Unit/integration tests
│   ├── Dockerfile
│   └── package.json
```

### WebSocket Service (`/backend/websocket`)
```
backend/
├── websocket/
│   ├── src/
│   │   ├── handlers/           # Socket event handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Data models
│   │   ├── middleware/         # Socket middleware
│   │   └── config/             # Configuration
│   ├── Dockerfile
│   └── package.json
```

## API Design

### REST API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

#### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me/avatar` - Upload avatar

#### Topics
- `GET /api/topics` - List all topics (with pagination, filters)
- `POST /api/topics` - Create new topic
- `GET /api/topics/:id` - Get topic details
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic
- `POST /api/topics/:id/join` - Join topic room
- `POST /api/topics/:id/leave` - Leave topic room

#### Messages (via WebSocket)
- WebSocket events instead of REST

### WebSocket Events

#### Client → Server
- `join-room` - Join a topic room
- `leave-room` - Leave a topic room
- `message` - Send a message
- `typing` - User is typing indicator
- `stop-typing` - User stopped typing

#### Server → Client
- `message` - New message received
- `user-joined` - User joined the room
- `user-left` - User left the room
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `error` - Error occurred

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Topics Table
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Topic_Members Table
```sql
CREATE TABLE topic_members (
  topic_id UUID REFERENCES topics(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (topic_id, user_id)
);
```

## Docker Configuration

### docker-compose.yml Structure
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
      - NEXT_PUBLIC_SOCKET_URL=http://websocket:3002
    depends_on:
      - api
      - websocket

  api:
    build: ./backend/api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/studycollab
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis

  websocket:
    build: ./backend/websocket
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/studycollab
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=studycollab
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

## Security Considerations

1. **Authentication**: JWT tokens with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement rate limiting on APIs
5. **CORS**: Configure CORS properly
6. **HTTPS**: Use HTTPS in production
7. **Secrets Management**: Use environment variables or secrets manager
8. **SQL Injection**: Use parameterized queries
9. **XSS Protection**: Sanitize user inputs
10. **WebSocket Security**: Authenticate WebSocket connections

## Deployment Strategy

### Development
- Docker Compose for local development
- Hot reload for frontend and backend
- Local database instances

### Production
- Kubernetes for orchestration
- CI/CD pipeline (GitHub Actions / GitLab CI)
- Load balancing with Nginx
- Database replication
- Redis cluster for caching
- Monitoring with Prometheus + Grafana
- Logging with ELK stack

## Scalability Considerations

1. **Horizontal Scaling**: Multiple instances of services
2. **Load Balancing**: Distribute traffic across instances
3. **Database Scaling**: Read replicas, connection pooling
4. **Caching**: Redis for frequently accessed data
5. **CDN**: For static assets
6. **WebSocket Scaling**: Use Redis adapter for Socket.IO
7. **Message Queue**: For async processing (RabbitMQ/Kafka)

## Best Practices

1. **Code Organization**: Clear separation of concerns
2. **Error Handling**: Consistent error handling across services
3. **Logging**: Structured logging
4. **Testing**: Unit, integration, and E2E tests
5. **Documentation**: API documentation (OpenAPI/Swagger)
6. **Versioning**: API versioning strategy
7. **Monitoring**: Health checks and metrics
8. **Backup**: Regular database backups

## Next Steps

1. Set up backend API service structure
2. Implement authentication system
3. Create database migrations
4. Set up Docker containers
5. Implement WebSocket server
6. Connect frontend to backend APIs
7. Add tests
8. Set up CI/CD pipeline
9. Deploy to staging/production

