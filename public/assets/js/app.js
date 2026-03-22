// =====================================================
// Taro Mystic - Main Application
// =====================================================

const API_BASE = '/api';

// State
let state = {
  user: null,
  theme: 'dark',
  activeTab: 'day',
  flippedCards: {},
  currentSpread: null,
  isLoading: false
};

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Init Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0a0a1a');
    tg.setBackgroundColor('#0a0e28');
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('taro_theme') || 'dark';
  setTheme(savedTheme);

  // Check for existing user
  const userId = localStorage.getItem('taro_user_id');
  if (userId) {
    await loadUser(userId);
  } else {
    showRegisterModal();
  }

  // Render app
  render();
}

// =====================================================
// API Functions
// =====================================================

async function loadUser(userId) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'X-User-ID': userId }
    });
    if (res.ok) {
      const data = await res.json();
      state.user = data.user;
      loadSavedState();
    } else {
      localStorage.removeItem('taro_user_id');
      showRegisterModal();
    }
  } catch (err) {
    console.error('Failed to load user:', err);
  }
}

async function registerUser(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function generateSpread(type, seed) {
  const res = await fetch(`${API_BASE}/spread/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      seed,
      user_id: state.user?.id,
      question: null
    })
  });
  return res.json();
}

async function trackEvent(eventType, data = {}) {
  if (!state.user?.id) return;
  
  await fetch(`${API_BASE}/analytics/track`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-ID': state.user.id
    },
    body: JSON.stringify({ event_type: eventType, ...data })
  });
}

async function fetchHoroscope(sign, date) {
  const res = await fetch(`${API_BASE}/horoscope?sign=${sign}&date=${date}`);
  return res.json();
}

// =====================================================
// Modal Functions
// =====================================================

function showRegisterModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'register-modal';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <span class="icon">🌙</span>
        <h2>Добро пожаловать!</h2>
        <p>Расскажите немного о себе</p>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Ваше имя</label>
          <input type="text" id="reg-name" placeholder="Как вас зовут?" />
        </div>
        <div class="form-group">
          <label>Пол</label>
          <div class="gender-toggle">
            <button class="gender-option" data-gender="male">♂ Мужчина</button>
            <button class="gender-option" data-gender="female">♀ Женщина</button>
          </div>
        </div>
        <div class="form-group">
          <label>Дата рождения</label>
          <input type="date" id="reg-birthdate" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="reg-submit">Продолжить ✨</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Gender toggle
  overlay.querySelectorAll('.gender-option').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.gender-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Submit
  overlay.querySelector('#reg-submit').addEventListener('click', async () => {
    const name = overlay.querySelector('#reg-name').value.trim();
    const gender = overlay.querySelector('.gender-option.active')?.dataset.gender;
    const birthdate = overlay.querySelector('#reg-birthdate').value;
    
    if (!name || !gender || !birthdate) {
      shakeElement(overlay.querySelector('.modal-content'));
      return;
    }
    
    const tg = window.Telegram?.WebApp;
    const userData = tg?.initDataUnsafe?.user;
    
    const data = {
      id: String(userData?.id || Date.now()),
      username: userData?.username || null,
      name,
      gender,
      birthdate
    };
    
    const btn = overlay.querySelector('#reg-submit');
    btn.classList.add('loading');
    btn.textContent = 'Загрузка...';
    
    try {
      const result = await registerUser(data);
      if (result.success) {
        localStorage.setItem('taro_user_id', data.id);
        state.user = { ...data, horoscope_sign: result.horoscope_sign };
        overlay.remove();
        render();
      } else {
        alert(result.error || 'Что-то пошло не так');
      }
    } catch (err) {
      alert('Ошибка регистрации');
    }
    
    btn.classList.remove('loading');
    btn.textContent = 'Продолжить ✨';
  });
}

function showInfoModal(title, content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="text-align: center;">
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body" style="text-align: left;">
        ${content}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// =====================================================
// Theme Functions
// =====================================================

function setTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem('taro_theme', theme);
  render();
}

// =====================================================
// Spread Functions
// =====================================================

function getDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `w${monday.getFullYear()}-${monday.getMonth()+1}-${monday.getDate()}`;
}

function getMonthKey() {
  const d = new Date();
  return `m${d.getFullYear()}-${d.getMonth()+1}`;
}

function getSeedKey(type) {
  switch(type) {
    case 'day': return getDayKey();
    case 'week': return getWeekKey();
    case 'month': return getMonthKey();
    default: return Date.now().toString();
  }
}

async function loadSpread(type) {
  state.activeTab = type;
  const key = `${type}-${getSeedKey(type)}`;
  
  // Check cache
  const cached = localStorage.getItem(`taro_spread_${key}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.expires > Date.now()) {
        state.currentSpread = parsed.data;
        state.flippedCards = parsed.flipped || {};
        return;
      }
    } catch(e) {}
  }
  
  // Generate new
  state.isLoading = true;
  render();
  
  try {
    const result = await generateSpread(type, getSeedKey(type));
    state.currentSpread = result;
    state.flippedCards = {};
    
    // Cache for 24 hours
    localStorage.setItem(`taro_spread_${key}`, JSON.stringify({
      data: result,
      flipped: {},
      expires: Date.now() + 24 * 60 * 60 * 1000
    }));
    
    trackEvent('spread', { spread_type: type });
  } catch (err) {
    console.error('Failed to generate spread:', err);
  }
  
  state.isLoading = false;
  render();
}

function flipCard(index) {
  const key = `${state.activeTab}-${index}`;
  state.flippedCards[key] = true;
  
  // Save flipped state
  const spreadKey = `${state.activeTab}-${getSeedKey(state.activeTab)}`;
  const cached = localStorage.getItem(`taro_spread_${spreadKey}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      parsed.flipped = state.flippedCards;
      localStorage.setItem(`taro_spread_${spreadKey}`, JSON.stringify(parsed));
    } catch(e) {}
  }
  
  trackEvent('flip', { card_id: state.currentSpread.spread[index].id });
  render();
}

function flipAll() {
  state.currentSpread.spread.forEach((_, i) => {
    state.flippedCards[`${state.activeTab}-${i}`] = true;
  });
  render();
}

function refreshSpread() {
  // Force new seed
  const seed = Date.now().toString();
  state.currentSpread = null;
  loadSpread(state.activeTab);
}

function loadSavedState() {
  // Load flipped cards for current tab
  const spreadKey = `${state.activeTab}-${getSeedKey(state.activeTab)}`;
  const cached = localStorage.getItem(`taro_spread_${spreadKey}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      state.flippedCards = parsed.flipped || {};
      state.currentSpread = parsed.data;
    } catch(e) {}
  }
}

function saveState() {
  localStorage.setItem('taro_user_state', JSON.stringify({
    theme: state.theme,
    activeTab: state.activeTab
  }));
}

// =====================================================
// Render Functions
// =====================================================

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-stars"></div>
    <div class="app-container">
      ${renderHeader()}
      ${renderUserBar()}
      ${renderTabs()}
      ${renderSpreadArea()}
      ${renderReadingSection()}
      ${renderFooter()}
    </div>
  `;
  
  attachEventListeners();
}

function renderHeader() {
  return `
    <div class="header">
      <div class="theme-switcher">
        <button class="theme-btn dark ${state.theme === 'dark' ? 'active' : ''}" data-theme="dark" title="Тёмная тема"></button>
        <button class="theme-btn light ${state.theme === 'light' ? 'active' : ''}" data-theme="light" title="Светлая тема"></button>
      </div>
      <div class="logo">🌙</div>
      <h1>Таро Мистик</h1>
      <p>Карты, которые знают ответ</p>
    </div>
  `;
}

function renderUserBar() {
  if (!state.user) return '';
  
  const signEmojis = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
  };
  
  return `
    <div class="user-bar">
      <span class="greeting">Привет, ${state.user.name}! ${signEmojis[state.user.horoscope_sign] || ''}</span>
      ${state.user.streak_days > 0 ? `
        <span class="streak">
          🔥 ${state.user.streak_days} дн.
        </span>
      ` : ''}
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    { id: 'day', icon: '☀️', label: 'День' },
    { id: 'week', icon: '📅', label: 'Неделя' },
    { id: 'month', icon: '🌙', label: 'Месяц' },
    { id: 'celtic', icon: '✨', label: 'Кельтский' }
  ];
  
  return `
    <div class="tabs">
      ${tabs.map(tab => `
        <button class="tab ${state.activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-label">${tab.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderSpreadArea() {
  if (state.isLoading) {
    return `
      <div class="spread-area" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 3rem; animation: pulse 1.5s infinite;">🌙</div>
        <p style="color: var(--text2); margin-top: 16px;">Гадание...</p>
      </div>
    `;
  }
  
  if (!state.currentSpread) {
    return `
      <div class="spread-area" style="text-align: center; padding: 60px 20px;">
        <button class="btn btn-primary" id="generate-btn">Получить расклад</button>
      </div>
    `;
  }
  
  const { spread, type } = state.currentSpread;
  const allFlipped = spread.every((_, i) => state.flippedCards[`${state.activeTab}-${i}`]);
  
  const gridClass = type === 'day' ? 'single' : type === 'week' ? 'week' : 'month';
  
  return `
    <div class="spread-area">
      <div class="spread-title">
        <h2>${state.currentSpread.type === 'day' ? 'Карта дня' : 
              state.currentSpread.type === 'week' ? 'Расклад на неделю' : 
              state.currentSpread.type === 'month' ? 'Расклад на месяц' : 'Кельтский крест'}</h2>
        <p>${allFlipped ? 'Все карты открыты' : 'Нажмите на карту, чтобы узнать её значение'}</p>
      </div>
      
      ${renderTimer()}
      
      <div class="cards-grid ${gridClass}">
        ${spread.map((card, i) => `
          <div class="card-appear stagger-${i + 1}">
            <div class="position-label">${card.position}</div>
            <div class="tarot-card ${state.flippedCards[`${state.activeTab}-${i}`] ? 'flipped' : ''}" data-index="${i}">
              <div class="tarot-card-inner">
                <div class="card-face card-back">
                  <span class="back-symbol">🌙</span>
                </div>
                <div class="card-face card-front ${card.reversed ? 'reversed' : ''}">
                  <span class="card-number">${card.suit || 'Аркан'}</span>
                  <span class="card-icon">${card.icon}</span>
                  <span class="card-name">${card.name}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${!allFlipped ? `<button class="btn-flip-all" id="flip-all-btn">✨ Открыть все карты</button>` : ''}
      <button class="btn-refresh" id="refresh-btn">🔄 Новый расклад</button>
      ${allFlipped ? `<button class="btn-share" id="share-btn">📤 Поделиться</button>` : ''}
    </div>
  `;
}

function renderTimer() {
  const type = state.activeTab;
  const now = new Date();
  let next;
  
  if (type === 'day') {
    next = new Date(now);
    next.setHours(24, 0, 0, 0);
  } else if (type === 'week') {
    next = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    next.setDate(now.getDate() + daysUntilMonday);
    next.setHours(0, 0, 0, 0);
  } else {
    next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  
  const diff = next - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = type === 'day' ? 'Обновится через' : type === 'week' ? 'Новая неделя через' : 'Новый месяц через';
  
  return `
    <div class="timer-bar">
      <span>⏳</span>
      <span class="timer-text">${label}: <span class="timer-highlight">${hours}ч ${mins}м</span></span>
    </div>
  `;
}

function renderReadingSection() {
  if (!state.currentSpread) return '';
  
  const { spread, interpretation, advice } = state.currentSpread;
  const allFlipped = spread.every((_, i) => state.flippedCards[`${state.activeTab}-${i}`]);
  
  if (!allFlipped) return '';
  
  return `
    <div class="reading-section">
      ${spread.map((card, i) => `
        <div class="reading-card stagger-${i + 1}">
          <h3>
            ${card.icon} ${card.position}
            ${card.reversed ? '<span class="reversed-badge">Перевёрнутая</span>' : ''}
          </h3>
          <div class="card-meaning">
            <span class="emoji">${card.icon}</span>
            <div class="info">
              <h4>${card.name}${card.suit ? ` (${card.suit})` : ''}</h4>
              <p>${card.reversed ? card.rev : card.meaning}</p>
            </div>
          </div>
        </div>
      `).join('')}
      
      <div class="summary-box">
        <h3>🔮 Общий прогноз</h3>
        <p>${interpretation}</p>
      </div>
      
      <div class="advice-box">
        <h3>✨ Совет карт</h3>
        <p>${advice}</p>
      </div>
      
      ${renderHoroscope()}
    </div>
  `;
}

async function renderHoroscope() {
  if (!state.user?.horoscope_sign) return '';
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const horo = await fetchHoroscope(state.user.horoscope_sign, today);
    
    if (!horo.general) return '';
    
    return `
      <div class="horoscope-section">
        <h3>🌟 Гороскоп на сегодня</h3>
        <div class="horoscope-content">
          <p><strong>${horo.general}</strong></p>
          <p>${horo.luck}</p>
          <div class="lucky-info">
            <span class="lucky-item">🔢 Счастливое число: ${horo.lucky_number}</span>
            <span class="lucky-item">${horo.lucky_color}</span>
          </div>
        </div>
      </div>
    `;
  } catch(e) {
    return '';
  }
}

function renderFooter() {
  return `
    <div class="app-footer">
      🌙 Таро Мистик — бесплатные расклады<br>
      Расклады обновляются автоматически каждый день
    </div>
  `;
}

// =====================================================
// Event Listeners
// =====================================================

function attachEventListeners() {
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
  
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => loadSpread(tab.dataset.tab));
  });
  
  // Generate button
  const genBtn = document.getElementById('generate-btn');
  if (genBtn) {
    genBtn.addEventListener('click', () => loadSpread(state.activeTab));
  }
  
  // Flip all
  const flipAllBtn = document.getElementById('flip-all-btn');
  if (flipAllBtn) {
    flipAllBtn.addEventListener('click', flipAll);
  }
  
  // Refresh
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshSpread);
  }
  
  // Card clicks
  document.querySelectorAll('.tarot-card:not(.flipped)').forEach(card => {
    card.addEventListener('click', () => {
      flipCard(parseInt(card.dataset.index));
    });
  });
  
  // Share
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareSpread);
  }
}

// =====================================================
// Share Functions
// =====================================================

function shareSpread() {
  if (!state.currentSpread) return;
  
  const { spread, type } = state.currentSpread;
  const typeNames = { day: 'Карта дня', week: 'Расклад на неделю', month: 'Расклад на месяц' };
  
  const text = `🌙 *${typeNames[type] || type}*

${spread.map(c => `${c.icon} *${c.position}:* ${c.name}${c.reversed ? ' (перевёрнутая)' : ''}`).join('\n')}

✨ Узнай свой прогноз в @TaroMysticBot`;
  
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`);
  } else {
    navigator.clipboard?.writeText(text);
    alert('Текст скопирован в буфер обмена!');
  }
}

// =====================================================
// Utility Functions
// =====================================================

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // Trigger reflow
  el.style.animation = 'shake 0.5s ease';
}
