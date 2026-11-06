# rev-proxy-app

A lightweight Node.js reverse proxy with built-in authentication. Unauthenticated requests are redirected to a login page; authenticated sessions are forwarded transparently to the upstream app.

## Features

- Cookie-based sessions (7-day expiry, signed & `httpOnly`)
- Single-user credentials via environment variables
- Polished login page with error feedback
- Original URL preserved and restored after login
- `POST /logout` to end the session
- Optional WebSocket support — when `WS_TARGET_URL` is set, upgrade requests go there and require a logged-in session

## Setup

```bash
npm install
cp .env.example .env   # then edit .env with your values
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HTTP_TARGET_URL` | Yes | Upstream app to proxy to (e.g. `https://example.com`, `http://railwayinternal.app:8080`) |
| `WS_TARGET_URL` | No | WebSocket server to proxy upgrade requests to (e.g. `ws://your-ws.railway.internal:8080`). If unset, WebSocket proxying is disabled |
| `AUTH_USERNAME` | Yes | Login username |
| `AUTH_PASSWORD` | Yes | Login password |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies — use a long random string (openssl rand -hex 32) |
| `PORT` | No | Port to listen on (default: `3000`) |

## Usage

```
http://localhost:3000/          → requires login, then proxied to HTTP_TARGET_URL
http://localhost:3000/login     → login page
POST http://localhost:3000/logout → clears session, redirects to /login
```

Any path beyond `/login` and `/logout` is protected and proxied after authentication.
