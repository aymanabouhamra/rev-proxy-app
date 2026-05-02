const express = require('express');
const session = require('express-session');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const {
  TARGET_URL,
  AUTH_USERNAME,
  AUTH_PASSWORD,
  SESSION_SECRET,
  PORT = 3000,
} = process.env;

if (!TARGET_URL)     throw new Error('Missing required env var: TARGET_URL');
if (!AUTH_USERNAME)  throw new Error('Missing required env var: AUTH_USERNAME');
if (!AUTH_PASSWORD)  throw new Error('Missing required env var: AUTH_PASSWORD');
if (!SESSION_SECRET) throw new Error('Missing required env var: SESSION_SECRET');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: 'lax',
  },
}));

// ── Auth routes ───────────────────────────────────────────────────────────────

app.get('/login', (req, res) => {
  if (req.session.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    req.session.authenticated = true;
    // const redirectTo = req.session.returnTo || '/';
    const redirectTo = '/';
    delete req.session.returnTo;
    return res.redirect(redirectTo);
  }

  res.redirect('/login?error=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ── Auth guard ────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

// ── Reverse proxy ─────────────────────────────────────────────────────────────

const proxy = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  on: {
    error(err, req, res) {
      console.error('[proxy error]', err.message);
      res.status(502).send('Bad Gateway — upstream unreachable.');
    },
  },
});

app.use('/', requireAuth, proxy);

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Reverse proxy listening on http://localhost:${PORT}`);
  console.log(`Forwarding to: ${TARGET_URL}`);
});
