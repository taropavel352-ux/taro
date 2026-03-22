import { Hono } from 'hono';
import { getDailyHoroscope } from '../data/horoscopes';

export const horoscopeRoutes = new Hono();

// Получить гороскоп на день
horoscopeRoutes.get('/', async (c) => {
  const sign = c.req.query('sign')?.toLowerCase();
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];

  if (!sign) {
    return c.json({ error: 'Укажите знак зодиака: ?sign=aries' }, 400);
  }

  const validSigns = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  if (!validSigns.includes(sign)) {
    return c.json({ 
      error: 'Неверный знак зодиака', 
      valid: validSigns 
    }, 400);
  }

  const horoscope = getDailyHoroscope(sign, date);

  return c.json({
    sign,
    date,
    ...horoscope
  });
});

// Список всех знаков
horoscopeRoutes.get('/signs', async (c) => {
  const signs = [
    { id: 'aries', name: 'Овен', symbol: '♈', dates: '21 марта — 19 апреля' },
    { id: 'taurus', name: 'Телец', symbol: '♉', dates: '20 апреля — 20 мая' },
    { id: 'gemini', name: 'Близнецы', symbol: '♊', dates: '21 мая — 20 июня' },
    { id: 'cancer', name: 'Рак', symbol: '♋', dates: '21 июня — 22 июля' },
    { id: 'leo', name: 'Лев', symbol: '♌', dates: '23 июля — 22 августа' },
    { id: 'virgo', name: 'Дева', symbol: '♍', dates: '23 августа — 22 сентября' },
    { id: 'libra', name: 'Весы', symbol: '♎', dates: '23 сентября — 22 октября' },
    { id: 'scorpio', name: 'Скорпион', symbol: '♏', dates: '23 октября — 21 ноября' },
    { id: 'sagittarius', name: 'Стрелец', symbol: '♐', dates: '22 ноября — 21 декабря' },
    { id: 'capricorn', name: 'Козерог', symbol: '♑', dates: '22 декабря — 19 января' },
    { id: 'aquarius', name: 'Водолей', symbol: '♒', dates: '20 января — 18 февраля' },
    { id: 'pisces', name: 'Рыбы', symbol: '♓', dates: '19 февраля — 20 марта' }
  ];

  return c.json({ signs });
});
