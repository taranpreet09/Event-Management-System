# Event Management System

A full-stack event management platform with:

- User / organizer authentication
- Event creation, editing, and deletion
- User registration + email verification for events
- Real-time notifications via WebSockets
- Redis-backed caching and message queues
- Dockerized backend, frontend, Redis, and workers

---

## Tech Stack

**Frontend**

- React + Vite
- React Router
- Tailwind CSS
- React Toastify
- Framer Motion

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer (Gmail SMTP)

**Real-time & Infrastructure**

- WebSockets (`ws`)
- Redis (caching + pub/sub + queues)
- Docker & Docker Compose

---

## Project Structure

```text
Event-Management-System/
  backend/
    config/
      db.js
      redis.js
    controllers/
      eventsController.js
      authController.js
      broadcastController.js
    models/
      User.js
      Event.js
    routes/
      auth.js
      events.js
      users.js
      broadcast.js
    services/
      notificationService.js
    utils/
      sendEmail.js
      queue.js
    workers/
      emailWorker.js
      notificationWorker.js
    seed.js
    server.js
    Dockerfile

  frontend/
    src/
      api/
      components/
      context/
      pages/
      routes/
      App.jsx
      main.jsx
    Dockerfile

  docker-compose.yml
  README.md
```

---

## Features

### Authentication & Roles

- JWT-based login/register
- Two roles:
  - `user` – can browse events + register
  - `organizer` – can create/manage events, broadcast messages

### Events

- Create, edit, delete events (organizer-only)
- User registration for an event, with:
  - Email verification link per registration
  - Protection against duplicate registrations
  - Cannot join own event as organizer

### Caching (Redis)

Cached endpoints:

- `GET /api/events?search=&filter=...`
- `GET /api/events/:id`
- `GET /api/events/by-date?date=YYYY-MM-DD`

Invalidated on:

- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `PUT /api/events/register/:id`
- `PUT /api/events/unregister/:id`
- `GET /api/events/verify/:token`

### Real-time Notifications

- WebSocket server on the backend
- Frontend connects to `ws://localhost:5000`
- Notifications:
  - `EVENT_ADDED` – show alert when new event is created
  - `EVENT_DELETED` – alert when an event is deleted
  - `BROADCAST_MESSAGE` – organizer can send broadcast to all connected clients, with:
    - In-app notifications list
    - “Red dot” indicator for unseen notifications

### Message Queues (Redis Lists)

Two simple queues implemented with Redis lists:

- **Email queue** (`queue:emails`)
  - Enqueued when a user registers for an event
  - `emailWorker.js` consumes jobs and sends email via Nodemailer

- **Notification queue** (`queue:notifications`)
  - Enqueued when events are created/deleted or broadcast is sent
  - `notificationWorker.js` consumes jobs and publishes to Redis pub/sub channels:
    - `event-updates`
    - `notifications`

---

## Getting Started (Local Development - Recommended)

This is the fastest dev workflow: run Redis via Docker and backend/frontend locally.

### 1. Prerequisites

- Node.js (>= 18)
- npm
- MongoDB running locally on `mongodb://localhost:27017`
  - Database: `event_management`
- Docker (for Redis, optional for dev but required for queue workers if you want them in containers)

### 2. Start Redis (via Docker)

From project root:

```bash
docker compose -f ./docker-compose.yml up redis
```

This starts a Redis container on `localhost:6379`.

### 3. Backend setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
JWT_SECRET=your_super_secret_random_string_that_is_long
MONGO_URI=mongodb://127.0.0.1:27017/event_management
PORT=5000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Run seed (optional, to load sample data):

```bash
node seed.js
```

Start backend:

```bash
node server.js
```

Backend will be available at `http://localhost:5000` and WebSocket at `ws://localhost:5000`.

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional if using defaults):

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start Vite dev server:

```bash
npm run dev
```

Frontend will be running at `http://localhost:5173`.

### 5. Optional: run workers locally

In separate terminals from `backend/`:

```bash
node workers/emailWorker.js
```

```bash
node workers/notificationWorker.js
```

---

## Running Everything in Docker

If you prefer a fully containerized stack:

### 1. Environment

`backend/.env` should point MongoDB to your host (if Mongo runs on host):

```env
MONGO_URI=mongodb://host.docker.internal:27017/event_management
JWT_SECRET=your_super_secret_random_string_that_is_long
PORT=1111 # overridden by docker-compose
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Start all services

From project root:

```bash
docker compose up --build
```

Services:

- `redis` – Redis server
- `backend` – Node/Express API + WebSocket
- `frontend` – Vite dev server
- `email-worker` – email queue worker
- `notification-worker` – notification queue worker

Ports:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Redis: `localhost:6379`

---

## Key API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

```text
POST   /auth/login
POST   /auth/register-user
POST   /auth/register-organizer
POST   /auth/check-email
```

### Events

```text
GET    /events?search=&filter=upcoming|past|all
GET    /events/:id
GET    /events/by-date?date=YYYY-MM-DD

# Organizer only
GET    /events/my-events
POST   /events
PUT    /events/:id
DELETE /events/:id
GET    /events/:id/attendees

# User registration
PUT    /events/register/:id
PUT    /events/unregister/:id
GET    /events/verify/:token
GET    /events/registered
```

### Broadcast (Organizer only)

```text
POST   /broadcast
```

Body (example):

```json
{
  "title": "System maintenance",
  "text": "We will be down at midnight."
}
```

---

## Caching Behavior (How to See It)

With backend running, tail logs:

```bash
# docker
docker compose logs -f backend
# or local (if you run backend locally, just watch the terminal)
```

Then call (via browser / Postman):

```text
GET http://localhost:5000/api/events?search=&filter=upcoming
```

You’ll see:

- First request: `❄ CACHE MISS → fetching events from DB`
- Subsequent same request: `🔥 CACHE HIT → getAllEvents`

Similarly for:

```text
GET /api/events/:id
GET /api/events/by-date?date=YYYY-MM-DD
```

Cache is invalidated on event create/update/delete and when registrations change.

---

## Message Queue Behavior

### Email Queue

- Enqueued when user registers for event:

```js
await enqueueEmailJob({
  email: user.email,
  subject: 'Confirm Your Event Registration',
  html: message,
});
```

- `workers/emailWorker.js` consumes jobs and calls `sendEmail`.

### Notification Queue

- Enqueued on event create/delete and broadcast:

```js
await enqueueNotificationJob({
  type: 'EVENT_ADDED',
  event,
  userId: req.user.id,
});

await enqueueNotificationJob({
  type: 'EVENT_DELETED',
  eventId: req.params.id,
  organizerId: req.user.id,
  eventName: event.title,
});

await enqueueNotificationJob({
  type: 'BROADCAST_MESSAGE',
  payload,
});
```

- `workers/notificationWorker.js`:

  - Publishes `EVENT_ADDED` / `EVENT_DELETED` to `event-updates`
  - Publishes `BROADCAST_MESSAGE` to `notifications`
  - `notificationService.js` forwards these to all connected WebSocket clients.

---

## Development Tips

- For fast iteration:
  - Prefer **local dev** for backend/frontend, using Docker only for Redis.
  - Or mount code into containers and use `nodemon` / Vite inside Docker.
- Only run `docker compose up --build` when:
  - You change `Dockerfile`s or `package.json`, or
  - You want to refresh images from scratch.

---

## Future Improvements (Ideas)

- Add proper job status / retry mechanism for queues
- Add rate limiting and input validation
- Add integration tests (e.g., Jest, supertest)
- Production builds of frontend (Nginx or static hosting) and backend

---

