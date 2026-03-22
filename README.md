# 🌙 Таро Мистик

Бесплатное приложение для гадания на картах Таро с гороскопами, фазами луны и коллекцией карт.

## Структура проекта

```
taro/
├── src/
│   ├── index.ts              # Cloudflare Worker (Hono)
│   ├── routes/               # API эндпоинты
│   │   ├── auth.ts          # Регистрация, вход
│   │   ├── users.ts         # Пользователи
│   │   ├── analytics.ts      # Аналитика
│   │   ├── horoscope.ts      # Гороскопы
│   │   ├── moonphase.ts      # Фазы луны
│   │   └── spread.ts         # Генерация раскладов
│   └── data/                # Контент
│       ├── tarot.ts         # 78 карт Таро
│       ├── runes.ts         # 24 руны
│       ├── iching.ts        # 64 гексаграммы
│       └── horoscopes.ts    # Гороскопы
│
├── public/                   # Статика
│   ├── index.html           # SPA shell
│   ├── manifest.json        # PWA манифест
│   ├── admin/              # Админка
│   │   ├── login.html
│   │   └── dashboard.html
│   └── assets/
│       ├── css/             # Стили
│       └── js/              # Клиентский JS
│
├── wrangler.toml           # Cloudflare конфиг
├── schema.sql              # D1 схема базы
└── package.json
```

## Установка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка Cloudflare

#### Создайте D1 базу данных:
```bash
wrangler d1 create taro-db
```

Скопируйте `database_id` в `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "taro-db"
database_id = "ВАШ_ID_ЗДЕСЬ"
```

#### Создайте R2 bucket (опционально):
```bash
wrangler r2 bucket create taro-assets
```

### 3. Инициализация базы данных

Локально:
```bash
wrangler d1 execute taro-db --local --file=./schema.sql
```

Удалённо:
```bash
wrangler d1 execute taro-db --remote --file=./schema.sql
```

### 4. Локальная разработка
```bash
npm run dev
```

### 5. Деплой
```bash
npm run deploy
```

## API

### Аутентификация
```
POST /api/auth/register     Регистрация пользователя
POST /api/auth/login       Вход админа
GET  /api/auth/me          Текущий пользователь
```

### Пользователи
```
GET  /api/users            Список пользователей
GET  /api/users/:id        Профиль пользователя
PUT  /api/users/:id        Обновить профиль
PUT  /api/users/:id/reminder   Настройки напоминаний
```

### Расклады
```
POST /api/spread/generate  Сгенерировать расклад
GET  /api/spread/random    Случайная карта
```

### Гороскопы
```
GET  /api/horoscope?sign=aries&date=2024-01-01
GET  /api/horoscope/signs  Все знаки зодиака
```

### Луна
```
GET  /api/moonphase?date=2024-01-01
GET  /api/moonphase/influence
```

### Аналитика
```
POST /api/analytics/track  Отправить событие
GET  /api/analytics/stats   Статистика (admin)
GET  /api/analytics/user/:id   Статистика пользователя
```

## Админка

- URL: `/admin/login.html`
- Логин: `admin100710`
- Пароль: `pavel100710123`

## Возможности

- [x] 78 карт Таро с толкованиями
- [x] Расклады: день, неделя, месяц, кельтский крест
- [x] Гороскопы по знаку зодиака
- [x] Фазы луны и их влияние
- [x] Коллекция карт
- [x] Достижения
- [x] Streak дней
- [x] Тёмная и светлая тема
- [ ] Руны
- [ ] И-Цзин
- [ ] Оракул Ленорман
- [ ] Telegram бот для напоминаний
- [ ] Push-уведомления

## Технологии

- Cloudflare Workers
- Hono.js
- Cloudflare D1
- Vanilla JS SPA
- CSS Variables
- Telegram Bot API

## Telegram Bot

Бот токен: `8363740742:AAFArYWyKg5e_LByCZqM68pbYSLNDfoznCs`

### Команды бота
- `/start` — Приветственное сообщение
- `/day` — Карта дня
- `/week` — Расклад на неделю
- `/month` — Расклад на месяц
- `/horoscope` — Гороскоп
- `/collection` — Коллекция карт
- `/menu` — Главное меню
- `/help` — Помощь

### Webhook
После деплоя установите webhook:
```bash
curl -F "url=https://your-domain.com/api/telegram/webhook" https://api.telegram.org/bot8363740742:AAFArYWyKg5e_LByCZqM68pbYSLNDfoznCs/setWebhook
```

## Лицензия

MIT
