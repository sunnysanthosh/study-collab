# StudyCollab

A real-time study collaboration platform built with Next.js. Collaborate with your classmates in real-time, solve problems together, share ideas, and learn as a team.

## Features

- 🎯 **Topic Management** - Create and manage study topics
- 💬 **Real-time Chat** - Collaborate with classmates through instant messaging
- 📝 **Problem Board** - Work through problems together in a shared workspace
- 🔔 **Realtime Notifications** - In-app notifications delivered over WebSocket
- 👥 **Presence Indicators** - See who is online in a topic room
- 📎 **File Uploads** - Share files and upload avatars with progress feedback
- ✏️ **Message Controls** - Edit, delete, and react to messages
- 📄 **Message Pagination** - Load earlier messages on demand
- 🔐 **User Authentication** - Secure login and signup system
- 🛡️ **Security Hardening** - Rate limiting and token revocation on logout
- ⭐ **Favorites** - Bookmark topics for quick access
- ✅ **Testing & CI** - Unit tests with automated CI checks

## Getting Started

First, install dependencies:

```bash
cd apps/web && npm install
cd ../../services/api && npm install
cd ../websocket && npm install
```

Then, run the development server:

```bash
./scripts/start-services.sh
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: TypeScript
- **UI**: React 19
- **API**: Express.js
- **Realtime**: Socket.IO
- **Database**: PostgreSQL

## Project Structure

```
study-collab/
├── apps/
│   └── web/              # Next.js frontend
│       ├── src/
│       └── public/
└── services/
    ├── api/              # Express API
    └── websocket/        # Socket.IO service
```

## Services

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **WebSocket**: http://localhost:3002
- **Database**: localhost:5432

## Helpful Scripts

- `./scripts/start-demo.sh` - Start in demo mode (auto-seeds data)
- `./scripts/start-services.sh` - Start all services
- `./scripts/stop-services.sh` - Stop all services
- `./scripts/status.sh` - Service status
- `./test-script.sh` - Automated E2E tests
- `npm --prefix apps/web test` - Run frontend unit tests

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
