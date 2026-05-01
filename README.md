# rev-proxy-app

A lightweight Node.js reverse proxy with built-in authentication. Unauthenticated requests are redirected to a login page; authenticated sessions are forwarded transparently to the upstream app.

## Features

- Cookie-based sessions (7-day expiry, signed & `httpOnly`)
- Single-user credentials via environment variables
- Polished login page with error feedback
- Original URL preserved and restored after login
- `POST /logout` to end the session

## Setup

```bash
npm install
cp .env.example .env   # then edit .env with your values
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TARGET_URL` | Yes | Upstream app to proxy to (e.g. `https://your-app.up.railway.app`) |
| `AUTH_USERNAME` | Yes | Login username |
| `AUTH_PASSWORD` | Yes | Login password |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies — use a long random string |
| `PORT` | No | Port to listen on (default: `3000`) |

## Usage

```
http://localhost:3000/          → requires login, then proxied to TARGET_URL
http://localhost:3000/login     → login page
POST http://localhost:3000/logout → clears session, redirects to /login
```

Any path beyond `/login` and `/logout` is protected and proxied after authentication.
