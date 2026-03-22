import { Hono } from 'hono';
import { sendMessage, sendBroadcast, getMe, answerCallbackQuery } from '../services/telegram';

interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
}

export const telegramRoutes = new Hono<{ Bindings: Env }>();

// Webhook для Telegram
telegramRoutes.post('/webhook', async (c) => {
  const body = await c.req.json();
  
  // Игнорируем non-message updates
  if (!body.message && !body.callback_query) {
    return c.json({ ok: true });
  }

  if (body.message) {
    const chatId = body.message.chat.id;
    const text = body.message.text || '';

    // Обработка команд
    if (text === '/start') {
      await sendMessage({
        chat_id: chatId,
        text: `🌙 <b>Добро пожаловать в Таро Мистик!</b>

Я помогу вам узнать, что готовят для вас звёзды сегодня.

Используйте /day для карты дня
Используйте /week для расклада на неделю
Используйте /month для расклада на месяц`,
        parse_mode: 'HTML'
      });
    }
    
    else if (text === '/day' || text === '/start day') {
      await sendDailyCard(chatId, c.env.DB);
    }
    
    else if (text === '/week') {
      await sendWeeklySpread(chatId, c.env.DB);
    }
    
    else if (text === '/month') {
      await sendMonthlySpread(chatId, c.env.DB);
    }
    
    else if (text === '/menu') {
      await sendMainMenu(chatId);
    }
    
    else if (text === '/help') {
      await sendMessage({
        chat_id: chatId,
        text: `<b>📖 Помощь</b>

Доступные команды:
/day — Карта дня
/week — Расклад на неделю
/month — Расклад на месяц
/menu — Главное меню
/horoscope — Ваш гороскоп
/collection — Ваша коллекция карт

💡 Просто отправьте свой вопрос — я постараюсь на него ответить!`,
        parse_mode: 'HTML'
      });
    }
    
    else if (text.startsWith('/horoscope')) {
      await sendHoroscope(chatId, c.env.DB);
    }
    
    else if (text.startsWith('/collection')) {
      await sendCollection(chatId, c.env.DB);
    }
    
    else {
      // Ответ на вопрос (расклад на вопрос)
      await sendQuestionSpread(chatId, text, c.env.DB);
    }
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const data = query.data;
    
    if (data === 'day_card') {
      await sendDailyCard(query.message?.chat.id, c.env.DB);
    }
    else if (data === 'weekly_spread') {
      await sendWeeklySpread(query.message?.chat.id, c.env.DB);
    }
    else if (data === 'monthly_spread') {
      await sendMonthlySpread(query.message?.chat.id, c.env.DB);
    }
    else if (data === 'main_menu') {
      await sendMainMenu(query.message?.chat.id);
    }
    
    await answerCallbackQuery(query.id);
  }

  return c.json({ ok: true });
});

// Отправить карту дня
async function sendDailyCard(chatId: number | string, db: D1Database) {
  const dayKey = getDayKey();
  const cards = getRandomCards(1, dayKey);
  const card = cards[0];

  const message = `🌙 <b>Карта дня</b>

${card.reversed ? '🔄 (перевёрнутая)' : ''}
${card.icon} <b>${card.name}</b>

${card.reversed ? card.rev : card.meaning}

📅 ${new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}`;

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎴 Новый расклад', callback_data: 'day_card' }],
        [{ text: '📅 Расклад на неделю', callback_data: 'weekly_spread' }],
        [{ text: '📋 Меню', callback_data: 'main_menu' }]
      ]
    }
  });

  // Сохраняем в БД если есть пользователь
  await saveReading(db, String(chatId), 'day', cards);
}

// Отправить расклад на неделю
async function sendWeeklySpread(chatId: number | string, db: D1Database) {
  const weekKey = getWeekKey();
  const cards = getRandomCards(7, weekKey);
  const positions = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  let message = `📅 <b>Расклад на неделю</b>\n\n`;

  cards.forEach((card, i) => {
    message += `${positions[i]} — ${card.icon} ${card.name}${card.reversed ? ' 🔄' : ''}\n`;
  });

  message += `\n💡 Откройте карты в боте, чтобы узнать их значения!`;

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Другой расклад', callback_data: 'weekly_spread' }],
        [{ text: '📋 Меню', callback_data: 'main_menu' }]
      ]
    }
  });

  await saveReading(db, String(chatId), 'week', cards);
}

// Отправить расклад на месяц
async function sendMonthlySpread(chatId: number | string, db: D1Database) {
  const monthKey = getMonthKey();
  const cards = getRandomCards(6, monthKey);
  const positions = ['Энергия', 'Влияния', 'Ресурсы', 'Тайное', 'Совет', 'Итог'];

  let message = `🌙 <b>Расклад на месяц</b>\n\n`;

  cards.forEach((card, i) => {
    message += `${positions[i]} — ${card.icon} ${card.name}${card.reversed ? ' 🔄' : ''}\n`;
  });

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });

  await saveReading(db, String(chatId), 'month', cards);
}

// Расклад на вопрос
async function sendQuestionSpread(chatId: number | string, question: string, db: D1Database) {
  const seed = question + Date.now();
  const cards = getRandomCards(3, seed);
  const positions = ['Прошлое', 'Настоящее', 'Будущее'];

  let message = `🔮 <b>Расклад на вопрос</b>\n\n`;
  message += `❓ <i>"${question}"</i>\n\n`;

  cards.forEach((card, i) => {
    message += `<b>${positions[i]}:</b> ${card.icon} ${card.name}${card.reversed ? ' 🔄' : ''}\n`;
    message += `   └ ${card.reversed ? card.rev : card.meaning}\n\n`;
  });

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });

  await saveReading(db, String(chatId), 'question', cards);
}

// Гороскоп
async function sendHoroscope(chatId: number | string, db: D1Database) {
  const user = await db
    .prepare('SELECT horoscope_sign FROM users WHERE id = ?')
    .bind(String(chatId))
    .first() as { horoscope_sign: string } | undefined;

  const sign = user?.horoscope_sign || 'aries';

  const signNames: Record<string, string> = {
    aries: '♈ Овен', taurus: '♉ Телец', gemini: '♊ Близнецы',
    cancer: '♋ Рак', leo: '♌ Лев', virgo: '♍ Дева',
    libra: '♎ Весы', scorpio: '♏ Скорпион', sagittarius: '♐ Стрелец',
    capricorn: '♑ Козерог', aquarius: '♒ Водолей', pisces: '♓ Рыбы'
  };

  const message = `🌟 <b>Гороскоп на сегодня</b>

${signNames[sign] || sign}

💫 Ваш гороскоп готов! Откройте приложение, чтобы увидеть полный прогноз.`;

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '📖 Читать гороскоп', url: 'https://your-domain.com' }]]
    }
  });
}

// Коллекция
async function sendCollection(chatId: number | string, db: D1Database) {
  const collection = await db
    .prepare('SELECT card_name, flipped_count FROM collection WHERE user_id = ? ORDER BY last_seen DESC LIMIT 10')
    .bind(String(chatId))
    .all();

  const total = await db
    .prepare('SELECT COUNT(*) as count FROM collection WHERE user_id = ?')
    .bind(String(chatId))
    .first() as { count: number };

  let message = `🃏 <b>Ваша коллекция</b>\n\n`;
  message += `📊 Собрано карт: ${total?.count || 0}/78\n\n`;

  if (collection.results.length > 0) {
    collection.results.forEach((c: any) => {
      message += `• ${c.card_name} (${c.flipped_count}x)\n`;
    });
  } else {
    message += 'Пока пусто. Начните гадать!';
  }

  await sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });
}

// Главное меню
async function sendMainMenu(chatId: number | string) {
  await sendMessage({
    chat_id: chatId,
    text: `🌙 <b>Главное меню</b>

Выберите действие:`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '☀️ Карта дня', callback_data: 'day_card' }],
        [{ text: '📅 Расклад на неделю', callback_data: 'weekly_spread' }],
        [{ text: '🌙 Расклад на месяц', callback_data: 'monthly_spread' }],
        [{ text: '🌟 Мой гороскоп', callback_data: 'my_horoscope' }],
        [{ text: '🃏 Моя коллекция', callback_data: 'my_collection' }]
      ]
    }
  });
}

// Вспомогательные функции
function getDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `w${monday.getFullYear()}-${monday.getMonth()+1}-${monday.getDate()}`;
}

function getMonthKey(): string {
  const d = new Date();
  return `m${d.getFullYear()}-${d.getMonth()+1}`;
}

function getRandomCards(count: number, seed: string): any[] {
  // Используем встроенный генератор
  const allCards = getAllTarotCards();
  const rng = createSeededRandom(seed);
  
  const cards: any[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    let idx: number;
    do {
      idx = Math.floor(rng() * allCards.length);
    } while (used.has(idx));
    
    used.add(idx);
    const card = { ...allCards[idx] };
    card.reversed = rng() < 0.25;
    cards.push(card);
  }
  
  return cards;
}

function createSeededRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }

  return function() {
    hash |= 0;
    hash = hash + 0x6D2B79F5 | 0;
    let t = Math.imul(hash ^ hash >>> 15, 1 | hash);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getAllTarotCards(): any[] {
  // Импорт карт
  const major = [
    { id: 0, name: "Шут", icon: "🃏", meaning: "Новые начинания, свобода.", rev: "Легкомыслие, страх перемен." },
    { id: 1, name: "Маг", icon: "🪄", meaning: "Сила воли, мастерство.", rev: "Манипуляции, обман." },
    { id: 2, name: "Верховная Жрица", icon: "🌙", meaning: "Интуиция, тайны.", rev: "Подавленная интуиция." },
    { id: 3, name: "Императрица", icon: "👑", meaning: "Изобилие, забота.", rev: "Творческий блок." },
    { id: 4, name: "Император", icon: "🏛️", meaning: "Власть, стабильность.", rev: "Тирания." },
    { id: 5, name: "Иерофант", icon: "📿", meaning: "Традиции, обучение.", rev: "Вызов традициям." },
    { id: 6, name: "Влюблённые", icon: "💕", meaning: "Любовь, гармония.", rev: "Дисгармония." },
    { id: 7, name: "Колесница", icon: "⚔️", meaning: "Победа, движение.", rev: "Поражение." },
    { id: 8, name: "Сила", icon: "🦁", meaning: "Мужество, терпение.", rev: "Слабость." },
    { id: 9, name: "Отшельник", icon: "🏔️", meaning: "Поиск истины.", rev: "Изоляция." },
    { id: 10, name: "Колесо Фортуны", icon: "☸️", meaning: "Судьба, удача.", rev: "Неудача." },
    { id: 11, name: "Справедливость", icon: "⚖️", meaning: "Баланс, правда.", rev: "Несправедливость." },
    { id: 12, name: "Повешенный", icon: "🙃", meaning: "Новая перспектива.", rev: "Тщетная жертва." },
    { id: 13, name: "Смерть", icon: "🦋", meaning: "Трансформация.", rev: "Страх перемен." },
    { id: 14, name: "Умеренность", icon: "⏳", meaning: "Баланс, гармония.", rev: "Дисбаланс." },
    { id: 15, name: "Дьявол", icon: "🔗", meaning: "Искушения.", rev: "Освобождение." },
    { id: 16, name: "Башня", icon: "⚡", meaning: "Разрушение, откровение.", rev: "Предотвращение." },
    { id: 17, name: "Звезда", icon: "⭐", meaning: "Надежда, вера.", rev: "Отчаяние." },
    { id: 18, name: "Луна", icon: "🌕", meaning: "Иллюзии, страх.", rev: "Ясность." },
    { id: 19, name: "Солнце", icon: "☀️", meaning: "Радость, успех.", rev: "Трудности." },
    { id: 20, name: "Суд", icon: "📯", meaning: "Пробуждение.", rev: "Самосомнение." },
    { id: 21, name: "Мир", icon: "🌍", meaning: "Завершение.", rev: "Незавершённость." }
  ];

  const wands = [
    { id: "w1", name: "Туз Жезлов", icon: "🔥", meaning: "Вдохновение.", rev: "Задержки." },
    { id: "w2", name: "Двойка Жезлов", icon: "🌍", meaning: "Планирование.", rev: "Страх." },
    { id: "w3", name: "Тройка Жезлов", icon: "🚢", meaning: "Расширение.", rev: "Задержки." },
    { id: "w4", name: "Четвёрка Жезлов", icon: "🎉", meaning: "Празднование.", rev: "Нестабильность." },
    { id: "w5", name: "Пятёрка Жезлов", icon: "⚔️", meaning: "Конкуренция.", rev: "Конфликт." },
    { id: "w6", name: "Шестёрка Жезлов", icon: "🏆", meaning: "Победа.", rev: "Провал." },
    { id: "w7", name: "Семёрка Жезлов", icon: "🛡️", meaning: "Защита.", rev: "Усталость." },
    { id: "w8", name: "Восьмёрка Жезлов", icon: "💨", meaning: "Скорость.", rev: "Задержки." }
  ];

  const cups = [
    { id: "c1", name: "Туз Кубков", icon: "💧", meaning: "Эмоции.", rev: "Блокировка." },
    { id: "c2", name: "Двойка Кубков", icon: "💑", meaning: "Партнёрство.", rev: "Разрыв." },
    { id: "c3", name: "Тройка Кубков", icon: "🥂", meaning: "Дружба.", rev: "Изоляция." },
    { id: "c4", name: "Четвёрка Кубков", icon: "😤", meaning: "Апатия.", rev: "Пробуждение." },
    { id: "c5", name: "Пятёрка Кубков", icon: "😢", meaning: "Потеря.", rev: "Принятие." },
    { id: "c6", name: "Шестёрка Кубков", icon: "🌸", meaning: "Ностальгия.", rev: "Прошлое." },
    { id: "c7", name: "Семёрка Кубков", icon: "💭", meaning: "Иллюзии.", rev: "Ясность." },
    { id: "c8", name: "Восьмёрка Кубков", icon: "🚶", meaning: "Уход.", rev: "Страх." }
  ];

  const swords = [
    { id: "s1", name: "Туз Мечей", icon: "🗡️", meaning: "Прорыв.", rev: "Хаос." },
    { id: "s2", name: "Двойка Мечей", icon: "🤝", meaning: "Выбор.", rev: "Нерешительность." },
    { id: "s3", name: "Тройка Мечей", icon: "💔", meaning: "Боль.", rev: "Исцеление." },
    { id: "s4", name: "Четвёрка Мечей", icon: "😴", meaning: "Отдых.", rev: "Беспокойство." },
    { id: "s5", name: "Пятёрка Мечей", icon: "🏳️", meaning: "Конфликт.", rev: "Примирение." },
    { id: "s6", name: "Шестёрка Мечей", icon: "⛵", meaning: "Переход.", rev: "Застой." }
  ];

  const pentacles = [
    { id: "p1", name: "Туз Пентаклей", icon: "💰", meaning: "Изобилие.", rev: "Потери." },
    { id: "p2", name: "Двойка Пентаклей", icon: "🤹", meaning: "Адаптация.", rev: "Перегруз." },
    { id: "p3", name: "Тройка Пентаклей", icon: "👷", meaning: "Мастерство.", rev: "Безработица." },
    { id: "p4", name: "Четвёрка Пентаклей", icon: "🏦", meaning: "Безопасность.", rev: "Жадность." },
    { id: "p5", name: "Пятёрка Пентаклей", icon: "🥶", meaning: "Нужда.", rev: "Помощь." },
    { id: "p6", name: "Шестёрка Пентаклей", icon: "🎁", meaning: "Щедрость.", rev: "Эгоизм." }
  ];

  return [...major, ...wands, ...cups, ...swords, ...pentacles];
}

async function saveReading(db: D1Database, userId: string, type: string, cards: any[]) {
  await db
    .prepare(`
      INSERT INTO readings (user_id, spread_type, cards)
      VALUES (?, ?, ?)
    `)
    .bind(userId, type, JSON.stringify(cards))
    .run();

  for (const card of cards) {
    await db
      .prepare(`
        INSERT INTO collection (user_id, card_id, card_name, card_suit)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, card_id) DO UPDATE SET
          flipped_count = flipped_count + 1,
          last_seen = CURRENT_TIMESTAMP
      `)
      .bind(userId, card.id, card.name, card.suit || 'major')
      .run();
  }
}
