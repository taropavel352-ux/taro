import { Hono } from 'hono';

export const moonphaseRoutes = new Hono();

// Рассчитать фазу луны на дату
moonphaseRoutes.get('/', async (c) => {
  const dateStr = c.req.query('date') || new Date().toISOString().split('T')[0];

  const moonData = calculateMoonPhase(new Date(dateStr));

  return c.json(moonData);
});

// Влияние луны на гадание
moonphaseRoutes.get('/influence', async (c) => {
  const dateStr = c.req.query('date') || new Date().toISOString().split('T')[0];
  const moonData = calculateMoonPhase(new Date(dateStr));

  // Описание влияния фазы луны
  const influences: Record<string, { title: string; description: string; recommendation: string }> = {
    new: {
      title: '🌑 Новолуние',
      description: 'Время новых начинаний. Луна невидима — энергия скрыта, но накапливается.',
      recommendation: 'Идеально для: загадывания желаний, постановки целей, первых шагов в новом направлении.'
    },
    waxing_crescent: {
      title: '🌒 Молодая луна',
      description: 'Луна растёт. Энергия нарастает, создаёт импульс к действию.',
      recommendation: 'Идеально для: начинаний, активных действий, роста и развития планов.'
    },
    first_quarter: {
      title: '🌓 Первая четверть',
      description: 'Половина луны освещена. Точка преодоления — нужно прорываться через препятствия.',
      recommendation: 'Идеально для: решительных действий, преодоления сопротивления, борьбы за своё.'
    },
    waxing_gibbous: {
      title: '🌔 Прибывающая луна',
      description: 'Луна почти полная. Энергия достигает пика, близость к завершению цикла.',
      recommendation: 'Идеально для: подготовки к кульминации, последних штрихов, наведения лоска.'
    },
    full: {
      title: '🌕 Полнолуние',
      description: 'Максимальная сила луны. Всё становится явным — тайное становится явным.',
      recommendation: 'Идеально для: прояснения истины, ритуалов очищения, кульминации дел, отпускания.'
    },
    waning_gibbous: {
      title: '🌖 Убывающая луна',
      description: 'Луна начинает убывать. Энергия идёт на спад, время для анализа.',
      recommendation: 'Идеально для: переоценки, извлечения уроков, работы с прошлым.'
    },
    last_quarter: {
      title: '🌗 Последняя четверть',
      description: 'Половина луны в тени. Время отпускать и прощать.',
      recommendation: 'Идеально для: избавления от ненужного, прощения, завершения дел.'
    },
    waning_crescent: {
      title: '🌘 Старая луна',
      description: 'Луна почти невидима. Подготовка к новому циклу, отдых и восстановление.',
      recommendation: 'Идеально для: размышлений, планирования, отдыха перед новыми начинаниями.'
    }
  };

  return c.json({
    ...moonData,
    influence: influences[moonData.phase_key]
  });
});

// Функция расчёта фазы луны
function calculateMoonPhase(date: Date) {
  // Reference new moon: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14);
  const lunarCycle = 29.53058867; // дней в лунном цикле

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarAge = diffDays % lunarCycle;
  const moonIndex = (lunarAge / lunarCycle) * 8;

  const phases = [
    { key: 'new', name: 'Новолуние', emoji: '🌑', illumination: 0, daysUntilFull: 14 },
    { key: 'waxing_crescent', name: 'Молодая луна', emoji: '🌒', illumination: 12, daysUntilFull: 12 },
    { key: 'first_quarter', name: 'Первая четверть', emoji: '🌓', illumination: 50, daysUntilFull: 7 },
    { key: 'waxing_gibbous', name: 'Прибывающая луна', emoji: '🌔', illumination: 75, daysUntilFull: 3 },
    { key: 'full', name: 'Полнолуние', emoji: '🌕', illumination: 100, daysUntilFull: 0 },
    { key: 'waning_gibbous', name: 'Убывающая луна', emoji: '🌖', illumination: 75, daysUntilFull: -3 },
    { key: 'last_quarter', name: 'Последняя четверть', emoji: '🌗', illumination: 50, daysUntilFull: -7 },
    { key: 'waning_crescent', name: 'Старая луна', emoji: '🌘', illumination: 12, daysUntilFull: -12 }
  ];

  const phaseIndex = Math.floor(moonIndex) % 8;
  const phase = phases[phaseIndex];
  const nextFullMoon = phase.key === 'full' 
    ? 0 
    : Math.abs(phase.daysUntilFull);

  return {
    date: date.toISOString().split('T')[0],
    lunar_age: Math.round(lunarAge * 100) / 100,
    ...phase,
    next_full_moon: nextFullMoon,
    is_waxing: moonIndex < 4
  };
}
