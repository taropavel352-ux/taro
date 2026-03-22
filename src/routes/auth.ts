import { Hono } from 'hono';
import { env } from 'hono/adapter';

interface Env {
  DB: D1Database;
}

export const authRoutes = new Hono<{ Bindings: Env }>();

// Регистрация пользователя
authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const { id, username, name, gender, birthdate, birthtime, phone } = body;

  if (!id || !name || !gender || !birthdate) {
    return c.json({ error: 'Отсутствуют обязательные поля' }, 400);
  }

  // Вычисляем знак зодиака
  const birthDateObj = new Date(birthdate);
  const sign = calculateHoroscopeSign(birthDateObj);

  try {
    // Проверяем, существует ли пользователь
    const existing = await c.env.DB
      .prepare('SELECT id FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (existing) {
      // Обновляем
      await c.env.DB
        .prepare(`
          UPDATE users SET 
            username = ?, name = ?, gender = ?, birthdate = ?, 
            birthtime = ?, phone = ?, horoscope_sign = ?
          WHERE id = ?
        `)
        .bind(username || null, name, gender, birthdate, birthtime || null, phone || null, sign, id)
        .run();
    } else {
      // Создаём
      await c.env.DB
        .prepare(`
          INSERT INTO users (id, username, name, gender, birthdate, birthtime, phone, horoscope_sign)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(id, username || null, name, gender, birthdate, birthtime || null, phone || null, sign)
        .run();
    }

    // Отслеживаем событие
    await trackEvent(c.env.DB, id, 'register');

    return c.json({ success: true, horoscope_sign: sign });
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Ошибка регистрации' }, 500);
  }
});

// Вход админа
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ error: 'Введите логин и пароль' }, 400);
  }

  const admin = await c.env.DB
    .prepare('SELECT * FROM admins WHERE username = ?')
    .bind(username)
    .first();

  if (!admin) {
    return c.json({ error: 'Неверный логин или пароль' }, 401);
  }

  // Простая проверка (в продакшене - bcrypt)
  if (admin.password_hash !== password) {
    return c.json({ error: 'Неверный логин или пароль' }, 401);
  }

  return c.json({ 
    success: true, 
    admin: { id: admin.id, username: admin.username }
  });
});

// Получить текущего пользователя
authRoutes.get('/me', async (c) => {
  const userId = c.req.header('X-User-ID');

  if (!userId) {
    return c.json({ error: 'Не авторизован' }, 401);
  }

  const user = await c.env.DB
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'Пользователь не найден' }, 404);
  }

  // Обновляем последний визит и streak
  await updateStreak(c.env.DB, userId);

  return c.json({ user });
});

// Вспомогательные функции
function calculateHoroscopeSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const signs: [string, number, number][] = [
    ['capricorn', 1, 19], ['aquarius', 1, 20], ['pisces', 2, 18],
    ['aries', 3, 20], ['taurus', 4, 20], ['gemini', 5, 20],
    ['cancer', 6, 21], ['leo', 7, 22], ['virgo', 8, 22],
    ['libra', 9, 22], ['scorpio', 10, 22], ['sagittarius', 11, 21],
    ['capricorn', 12, 21]
  ];

  for (const [sign, m, d] of signs) {
    if (month < m || (month === m && day <= d)) {
      return sign;
    }
  }
  return 'capricorn';
}

async function trackEvent(db: D1Database, userId: string, eventType: string, eventData?: object) {
  await db
    .prepare(`
      INSERT INTO events (user_id, event_type, event_data)
      VALUES (?, ?, ?)
    `)
    .bind(userId, eventType, eventData ? JSON.stringify(eventData) : null)
    .run();
}

async function updateStreak(db: D1Database, userId: string) {
  const user = await db
    .prepare('SELECT last_visit, streak_days FROM users WHERE id = ?')
    .bind(userId)
    .first() as { last_visit: string; streak_days: number } | undefined;

  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = 1;
  if (user.last_visit) {
    const lastDate = user.last_visit.split('T')[0];
    if (lastDate === yesterday) {
      newStreak = user.streak_days + 1;
    } else if (lastDate === today) {
      newStreak = user.streak_days;
    }
  }

  await db
    .prepare(`
      UPDATE users SET last_visit = ?, streak_days = ? WHERE id = ?
    `)
    .bind(new Date().toISOString(), newStreak, userId)
    .run();
}
