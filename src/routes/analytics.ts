import { Hono } from 'hono';

interface Env {
  DB: D1Database;
}

export const analyticsRoutes = new Hono<{ Bindings: Env }>();

// Отследить событие
analyticsRoutes.post('/track', async (c) => {
  const userId = c.req.header('X-User-ID');
  const body = await c.req.json();
  const { event_type, event_data, card_id, spread_type } = body;

  if (!event_type) {
    return c.json({ error: 'Не указан тип события' }, 400);
  }

  await c.env.DB
    .prepare(`
      INSERT INTO events (user_id, event_type, event_data, card_id, spread_type)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(userId || null, event_type, event_data ? JSON.stringify(event_data) : null, card_id || null, spread_type || null)
    .run();

  return c.json({ success: true });
});

// Общая статистика (admin)
analyticsRoutes.get('/stats', async (c) => {
  const today = new Date().toISOString().split('T')[0];

  // Уникальные пользователи сегодня
  const uniqueToday = await c.env.DB
    .prepare('SELECT COUNT(DISTINCT user_id) as count FROM events WHERE DATE(created_at) = ?')
    .bind(today)
    .first() as { count: number };

  // Всего пользователей
  const totalUsers = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM users')
    .first() as { count: number };

  // Всего событий
  const totalEvents = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM events')
    .first() as { count: number };

  // Популярные карты
  const popularCards = await c.env.DB
    .prepare(`
      SELECT card_id, card_name, COUNT(*) as flips
      FROM events 
      WHERE event_type = 'flip' AND card_id IS NOT NULL
      GROUP BY card_id
      ORDER BY flips DESC
      LIMIT 10
    `)
    .all();

  // Популярные расклады
  const popularSpreads = await c.env.DB
    .prepare(`
      SELECT spread_type, COUNT(*) as count
      FROM events
      WHERE event_type = 'spread' AND spread_type IS NOT NULL
      GROUP BY spread_type
      ORDER BY count DESC
    `)
    .all();

  // Активность по дням (последние 7 дней)
  const activityByDay = await c.env.DB
    .prepare(`
      SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as users, COUNT(*) as events
      FROM events
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `)
    .all();

  return c.json({
    today: {
      unique_users: uniqueToday?.count || 0
    },
    totals: {
      users: totalUsers?.count || 0,
      events: totalEvents?.count || 0
    },
    popular_cards: popularCards.results,
    popular_spreads: popularSpreads.results,
    activity_by_day: activityByDay.results
  });
});

// Статистика по пользователю
analyticsRoutes.get('/user/:id', async (c) => {
  const id = c.req.param('id');

  const totalReadings = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND event_type = ?')
    .bind(id, 'spread')
    .first() as { count: number };

  const totalFlips = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND event_type = ?')
    .bind(id, 'flip')
    .first() as { count: number };

  const lastVisit = await c.env.DB
    .prepare('SELECT last_visit, streak_days FROM users WHERE id = ?')
    .bind(id)
    .first();

  const collectionProgress = await c.env.DB
    .prepare('SELECT COUNT(DISTINCT card_id) as collected FROM collection WHERE user_id = ?')
    .bind(id)
    .first() as { collected: number };

  return c.json({
    total_readings: totalReadings?.count || 0,
    total_flips: totalFlips?.count || 0,
    streak_days: lastVisit?.streak_days || 0,
    last_visit: lastVisit?.last_visit,
    collection_progress: {
      collected: collectionProgress?.collected || 0,
      total: 78
    }
  });
});

// Удалить данные пользователя (GDPR)
analyticsRoutes.delete('/user/:id', async (c) => {
  const id = c.req.param('id');

  await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM collection WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM achievements WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM readings WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});
