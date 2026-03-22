import { Hono } from 'hono';

interface Env {
  DB: D1Database;
}

export const userRoutes = new Hono<{ Bindings: Env }>();

// Получить список пользователей (admin)
userRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const users = await c.env.DB
    .prepare(`
      SELECT id, username, name, gender, birthdate, horoscope_sign, 
             streak_days, reminder_enabled, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(limit, offset)
    .all();

  const total = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM users')
    .first() as { count: number };

  return c.json({
    users: users.results,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  });
});

// Получить одного пользователя
userRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const user = await c.env.DB
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first();

  if (!user) {
    return c.json({ error: 'Пользователь не найден' }, 404);
  }

  // Получаем коллекцию карт
  const collection = await c.env.DB
    .prepare('SELECT * FROM collection WHERE user_id = ? ORDER BY last_seen DESC')
    .bind(id)
    .all();

  // Получаем достижения
  const achievements = await c.env.DB
    .prepare('SELECT * FROM achievements WHERE user_id = ?')
    .bind(id)
    .all();

  return c.json({
    user,
    collection: collection.results,
    achievements: achievements.results
  });
});

// Обновить профиль
userRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, gender, birthdate, birthtime, phone, reminder_enabled, reminder_time } = body;

  await c.env.DB
    .prepare(`
      UPDATE users SET 
        name = COALESCE(?, name),
        gender = COALESCE(?, gender),
        birthdate = COALESCE(?, birthdate),
        birthtime = COALESCE(?, birthtime),
        phone = COALESCE(?, phone),
        reminder_enabled = COALESCE(?, reminder_enabled),
        reminder_time = COALESCE(?, reminder_time)
      WHERE id = ?
    `)
    .bind(name, gender, birthdate, birthtime, phone, reminder_enabled, reminder_time, id)
    .run();

  return c.json({ success: true });
});

// Настройки напоминаний
userRoutes.put('/:id/reminder', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { enabled, time } = body;

  await c.env.DB
    .prepare(`
      UPDATE users SET reminder_enabled = ?, reminder_time = ? WHERE id = ?
    `)
    .bind(enabled ? 1 : 0, time || '09:00', id)
    .run();

  return c.json({ success: true });
});

// Получить коллекцию карт пользователя
userRoutes.get('/:id/collection', async (c) => {
  const id = c.req.param('id');

  const collection = await c.env.DB
    .prepare(`
      SELECT * FROM collection WHERE user_id = ? ORDER BY last_seen DESC
    `)
    .bind(id)
    .all();

  return c.json({ collection: collection.results });
});

// Добавить карту в коллекцию
userRoutes.post('/:id/collection', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { card_id, card_name, card_suit } = body;

  await c.env.DB
    .prepare(`
      INSERT INTO collection (user_id, card_id, card_name, card_suit)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, card_id) DO UPDATE SET
        flipped_count = flipped_count + 1,
        last_seen = CURRENT_TIMESTAMP
    `)
    .bind(id, card_id, card_name, card_suit)
    .run();

  return c.json({ success: true });
});

// Получить достижения пользователя
userRoutes.get('/:id/achievements', async (c) => {
  const id = c.req.param('id');

  const achievements = await c.env.DB
    .prepare('SELECT * FROM achievements WHERE user_id = ?')
    .bind(id)
    .all();

  return c.json({ achievements: achievements.results });
});

// История раскладов
userRoutes.get('/:id/readings', async (c) => {
  const id = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '20');

  const readings = await c.env.DB
    .prepare(`
      SELECT * FROM readings WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    .bind(id, limit)
    .all();

  return c.json({ readings: readings.results });
});
