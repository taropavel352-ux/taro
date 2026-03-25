import { Hono } from 'hono';
import { TAROT } from '../data/tarot';

interface Env {
  DB: D1Database;
}

export const spreadRoutes = new Hono<{ Bindings: Env }>();

// Генерация расклада
spreadRoutes.post('/generate', async (c) => {
  const body = await c.req.json();
  const { type, seed, user_id, question } = body;

  if (!type) {
    return c.json({ error: 'Укажите тип расклада' }, 400);
  }

  const validTypes = ['day', 'week', 'month', 'celtic', 'question'];
  if (!validTypes.includes(type)) {
    return c.json({ error: 'Неверный тип расклада', valid: validTypes }, 400);
  }

  const spreadConfig = {
    day: { count: 1, positions: ['Сегодняшняя энергия'] },
    week: { 
      count: 7, 
      positions: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'] 
    },
    month: { 
      count: 6, 
      positions: ['Энергия месяца', 'Внешние влияния', 'Ваши ресурсы', 'Тайные силы', 'Совет карт', 'Итог месяца'] 
    },
    celtic: { 
      count: 10, 
      positions: [
        'Ситуация сейчас', 'Препятствие', 'Прошлое', 'Будущее',
        'Над тобой', 'Под тобой', 'Ты сам', 'Окружение',
        'Надежды/Страхи', 'Итог'
      ] 
    },
    question: { 
      count: 3, 
      positions: ['Прошлое', 'Настоящее', 'Будущее'] 
    }
  };

  const config = spreadConfig[type as keyof typeof spreadConfig];

  // Генерация карт
  const cards = generateCards(config.count, seed, question);

  // Добавляем позиции
  const spread = cards.map((card, i) => ({
    ...card,
    position: config.positions[i]
  }));

  // Сохраняем в историю если есть user_id
  if (user_id) {
    await c.env.DB
      .prepare(`
        INSERT INTO readings (user_id, spread_type, cards, interpretation)
        VALUES (?, ?, ?, ?)
      `)
      .bind(user_id, type, JSON.stringify(spread), generateQuickInterpretation(spread))
      .run();

    // Добавляем карты в коллекцию
    for (const card of spread) {
      await c.env.DB
        .prepare(`
          INSERT INTO collection (user_id, card_id, card_name, card_suit)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id, card_id) DO UPDATE SET
            flipped_count = flipped_count + 1,
            last_seen = CURRENT_TIMESTAMP
        `)
        .bind(user_id, card.id, card.name, card.suit || 'major')
        .run();
    }

    // Проверяем достижения
    await checkAchievements(c.env.DB, user_id, spread);
  }

  return c.json({
    type,
    spread,
    interpretation: generateInterpretation(spread, type),
    advice: generateAdvice(spread, type)
  });
});

// Генерация одной случайной карты
spreadRoutes.get('/random', async (c) => {
  const seed = c.req.query('seed') || Date.now().toString();
  const rng = createSeededRandom(seed);

  const allCards = [...TAROT.major, ...TAROT.wands, ...TAROT.cups, ...TAROT.swords, ...TAROT.pentacles];
  const card = allCards[Math.floor(rng() * allCards.length)];
  const reversed = rng() < 0.25;

  return c.json({
    card: { ...card, reversed },
    meaning: reversed ? card.rev : card.meaning
  });
});

// Вспомогательные функции
function generateCards(count: number, seed?: string, extraSeed?: string): any[] {
  const allCards = [...TAROT.major, ...TAROT.wands, ...TAROT.cups, ...TAROT.swords, ...TAROT.pentacles];
  
  const seedStr = seed || Date.now().toString();
  const rng = createSeededRandom(seedStr + (extraSeed || ''));

  const cards: any[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx: number;
    do {
      idx = Math.floor(rng() * allCards.length);
    } while (used.has(idx));
    
    used.add(idx);
    const card = { ...allCards[idx] } as any;
    card.reversed = rng() < 0.25;
    cards.push(card);
  }

  return cards;
}

function createSeededRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
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

function generateInterpretation(spread: any[], type: string): string {
  const reversedCount = spread.filter((c: any) => c.reversed).length;
  const total = spread.length;

  if (type === 'day') {
    const c = spread[0];
    return c.reversed 
      ? `Сегодняшний день несёт энергию "${c.name}" в перевёрнутом положении. ${c.rev}`
      : `Сегодня ваш день наполнен энергией "${c.name}". ${c.meaning}`;
  }

  if (type === 'week' || type === 'month' || type === 'celtic') {
    const ratio = reversedCount / total;
    if (ratio > 0.5) {
      return `Этот период несёт энергию трансформации. ${reversedCount} из ${total} карт перевёрнуты — время внутренней работы и переосмысления.`;
    } else if (reversedCount === 0) {
      return `Благоприятный период! Все карты прямо — гармония и продуктивность.`;
    } else {
      return `Интересное время впереди. Прямые карты поддерживают вас, а ${reversedCount} перевёрнутых указывают на области для внимания.`;
    }
  }

  if (type === 'question') {
    return spread.map((c: any, i: number) => 
      `${c.position}: "${c.name}"${c.reversed ? ' (перевёрнутая)' : ''}`
    ).join('. ');
  }

  return '';
}

function generateAdvice(spread: any[], type: string): string {
  if (type === 'day') {
    const c = spread[0];
    if (c.id <= 21) {
      return c.reversed 
        ? 'Будьте осторожны с решениями. Не действуйте импульсивно.'
        : 'Доверяйте интуиции. Сегодня благоприятный день для смелых действий.';
    }
    return c.reversed 
      ? 'Обратите внимание на детали и не торопите события.'
      : 'Действуйте уверенно и открыто.';
  }

  if (type === 'week' || type === 'month' || type === 'celtic') {
    const reversed = spread.filter((c: any) => c.reversed);
    if (reversed.length > 0) {
      return `Обратите внимание на перевёрнутые карты: ${reversed.map((c: any) => c.name).join(', ')}. Они указывают на скрытые аспекты ситуации.`;
    }
    return 'Все карты прямо — следуйте за подсказками и действуйте решительно.';
  }

  return 'Прислушайтесь к каждой карте — вместе они дают целостную картину.';
}

function generateQuickInterpretation(spread: any[]): string {
  return generateInterpretation(spread, 'question');
}

async function checkAchievements(db: D1Database, userId: string, spread: any[]) {
  // Проверяем "Коллекционер" - собрано 10 карт
  const collected = await db
    .prepare('SELECT COUNT(*) as count FROM collection WHERE user_id = ?')
    .bind(userId)
    .first() as { count: number };

  if (collected && collected.count >= 10) {
    await db
      .prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_id, achievement_name)
        VALUES (?, 'collector', 'Коллекционер')
      `)
      .bind(userId)
      .run();
  }

  // Проверяем "Шут выпал 3 раза"
  const foolCount = await db
    .prepare('SELECT flipped_count FROM collection WHERE user_id = ? AND card_id = 0')
    .bind(userId)
    .first() as { flipped_count: number } | undefined;

  if (foolCount && foolCount.flipped_count >= 3) {
    await db
      .prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_id, achievement_name)
        VALUES (?, 'fool_3', 'Шутник')
      `)
      .bind(userId)
      .run();
  }

  // Проверяем streak
  const user = await db
    .prepare('SELECT streak_days FROM users WHERE id = ?')
    .bind(userId)
    .first() as { streak_days: number } | undefined;

  if (user) {
    if (user.streak_days >= 3) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO achievements (user_id, achievement_id, achievement_name)
          VALUES (?, 'streak_3', 'Три дня подряд')
        `)
        .bind(userId)
        .run();
    }
    if (user.streak_days >= 7) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO achievements (user_id, achievement_id, achievement_name)
          VALUES (?, 'streak_7', 'Недельный мастер')
        `)
        .bind(userId)
        .run();
    }
  }
}
