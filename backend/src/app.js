import cors from 'cors';
import express from 'express';
import {
  analytics,
  appMeta,
  demoUsers,
  outages,
  queueSummary,
  regions,
  weeklySummary,
} from './data.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'outageiq-backend', ...appMeta });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const user = demoUsers.find((entry) => entry.username === username && entry.password === password);

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid demo credentials' });
  }

  return res.json({
    ok: true,
    token: `demo-${user.username}-token`,
    user: {
      displayName: user.displayName,
      role: user.role,
      username: user.username,
    },
  });
});

app.get('/api/overview', (_req, res) => {
  res.json({
    ok: true,
    meta: appMeta,
    summary: queueSummary,
    outages,
    weeklySummary,
  });
});

app.get('/api/outages', (_req, res) => {
  res.json({ ok: true, outages });
});

app.get('/api/regions', (_req, res) => {
  res.json({ ok: true, regions });
});

app.get('/api/analytics', (_req, res) => {
  res.json({ ok: true, analytics, weeklySummary });
});

app.get('/api/export', (_req, res) => {
  res.json({
    ok: true,
    generatedAt: appMeta.refreshedAt,
    prioritizedOutages: outages.slice(0, 5),
    reportTitle: 'Executive OutageIQ Export',
  });
});

export default app;