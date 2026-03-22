import { Hono } from 'hono';
import { sendMessage, sendBroadcast } from '../services/telegram';

interface Env {
  DB: D1Database;
}

export const broadcastRoutes = new Hono<{ Bindings: Env }>();

// Получить список пользователей для рассылки
broadcastRoutes.get('/users', async (c) => {
  const users = await c.env.DB
    .prepare('SELECT id, name FROM users WHERE notification_token IS NOT NULL')
    .all();

  return c.json({ count: users.results.length, users: users.results });
});

// Отправить рассылку всем пользователям
broadcastRoutes.post('/send', async (c) => {
  const body = await c.req.json();
  const { message, test_mode } = body;

  if (!message) {
    return c.json({ error: 'Укажите текст сообщения' }, 400);
  }

  // В тестовом режиме отправляем только первому пользователю
  let users;
  if (test_mode) {
    users = await c.env.DB
      .prepare('SELECT id, name FROM users LIMIT 1')
      .all();
  } else {
    users = await c.env.DB
      .prepare('SELECT id, name FROM users')
      .all();
  }

  if (users.results.length === 0) {
    return c.json({ error: 'Нет пользователей для рассылки' }, 400);
  }

  const result = await sendBroadcast(users.results as { id: string; name: string }[], message);

  // Логируем рассылку
  await c.env.DB
    .prepare(`
      INSERT INTO events (user_id, event_type, event_data)
      VALUES (?, ?, ?)
    `)
    .bind('system', 'broadcast', JSON.stringify({
      message,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString()
    }))
    .run();

  return c.json({
    success: true,
    sent: result.sent,
    failed: result.failed,
    total: users.results.length
  });
});

// Отправить напоминание одному пользователю
broadcastRoutes.post('/remind/:userId', async (c) => {
  const userId = c.req.param('userId');

  const user = await c.env.DB
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'Пользователь не найден' }, 404);
  }

  const result = await sendMessage({
    chat_id: userId,
    text: `🌙 <b>Привет, ${user.name}!</b>

Пора заглянуть в будущее! Ваша карта дня ждёт вас.

Нажмите /day, чтобы узнать, что готовят для вас звёзды сегодня.`,
    parse_mode: 'HTML'
  });

  return c.json(result);
});

// Массовая рассылка напоминаний (всем у кого включены)
broadcastRoutes.post('/remind-all', async (c) => {
  const users = await c.env.DB
    .prepare('SELECT id, name FROM users WHERE reminder_enabled = 1')
    .all();

  if (users.results.length === 0) {
    return c.json({ message: 'Нет пользователей с включёнными напоминаниями' });
  }

  let sent = 0;
  let failed = 0;

  for (const user of users.results as { id: string; name: string }[]) {
    const result = await sendMessage({
      chat_id: user.id,
      text: `🌙 <b>Привет, ${user.name}!</b>

Время гадать! 🃏`,
      parse_mode: 'HTML'
    });

    if (result.ok) sent++;
    else failed++;

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return c.json({ sent, failed, total: users.results.length });
});
