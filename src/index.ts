import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';

import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { analyticsRoutes } from './routes/analytics';
import { horoscopeRoutes } from './routes/horoscope';
import { moonphaseRoutes } from './routes/moonphase';
import { spreadRoutes } from './routes/spread';
import { telegramRoutes } from './routes/telegram';
import { broadcastRoutes } from './routes/broadcast';

const app = new Hono();

// CORS для всех запросов
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Роуты
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/horoscope', horoscopeRoutes);
app.route('/api/moonphase', moonphaseRoutes);
app.route('/api/spread', spreadRoutes);
app.route('/api/telegram', telegramRoutes);
app.route('/api/broadcast', broadcastRoutes);

// Статика
app.get('*', serveStatic({ root: './public' }));
app.get('*', serveStatic({ path: './public/index.html' }));

export default app;
