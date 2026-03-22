// Telegram Bot API Service
const BOT_TOKEN = '8363740742:AAFArYWyKg5e_LByCZqM68pbYSLNDfoznCs';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_notification?: boolean;
  reply_markup?: object;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export async function sendMessage(options: SendMessageOptions): Promise<TelegramResponse> {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, description: String(error) };
  }
}

export async function sendPhoto(chatId: number | string, photo: string, caption?: string): Promise<TelegramResponse> {
  try {
    const response = await fetch(`${API_URL}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
        parse_mode: 'HTML'
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, description: String(error) };
  }
}

export async function setWebhook(url: string): Promise<TelegramResponse> {
  try {
    const response = await fetch(`${API_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, description: String(error) };
  }
}

export async function getMe(): Promise<TelegramResponse> {
  try {
    const response = await fetch(`${API_URL}/getMe`);
    return await response.json();
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, description: String(error) };
  }
}

export async function sendReminder(userId: number, cardName: string, cardIcon: string): Promise<TelegramResponse> {
  const message = `🌙 <b>Время гадать!</b>

Хотите узнать, что карты приготовили для вас сегодня?

${cardIcon} <i>${cardName}</i> ждёт вас...`;

  return sendMessage({
    chat_id: userId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[
        { text: '🎴 Открыть карту дня', url: 'https://t.me/YourBotUsername?start=day' }
      ]]
    }
  });
}

export async function sendBroadcast(users: { id: string; name: string }[], message: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const result = await sendMessage({
      chat_id: user.id,
      text: `📢 ${message}`,
      parse_mode: 'HTML'
    });

    if (result.ok) {
      sent++;
    } else {
      failed++;
    }

    // Rate limiting - 30 messages per second
    await new Promise(resolve => setTimeout(resolve, 33));
  }

  return { sent, failed };
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<TelegramResponse> {
  try {
    const response = await fetch(`${API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, description: String(error) };
  }
}
