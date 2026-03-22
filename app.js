(() => {
  const { useState, useEffect, useCallback, useMemo } = React;

  // ======== TAROT DECK ========
  const TAROT = {
    major: [
      { id: 0, name: "Шут", icon: "🃏", meaning: "Новые начинания, свобода. Время довериться интуиции.", rev: "Легкомыслие, страх перемен, нерешительность." },
      { id: 1, name: "Маг", icon: "🪄", meaning: "Сила воли, мастерство. У вас есть всё для достижения цели.", rev: "Манипуляции, обман, неиспользованный потенциал." },
      { id: 2, name: "Верховная Жрица", icon: "🌙", meaning: "Интуиция, тайны. Прислушайтесь к внутреннему голосу.", rev: "Подавленная интуиция, скрытые мотивы." },
      { id: 3, name: "Императрица", icon: "👑", meaning: "Изобилие, плодородие, забота. Творческий период.", rev: "Творческий блок, зависимость от других." },
      { id: 4, name: "Император", icon: "🏛️", meaning: "Власть, структура, стабильность. Время лидерства.", rev: "Тирания, контроль, негибкость." },
      { id: 5, name: "Иерофант", icon: "📿", meaning: "Традиции, духовность, обучение. Обращение к мудрости.", rev: "Вызов традициям, свой путь." },
      { id: 6, name: "Влюблённые", icon: "💕", meaning: "Любовь, гармония, выбор. Важное решение в отношениях.", rev: "Дисгармония, неверный выбор." },
      { id: 7, name: "Колесница", icon: "⚔️", meaning: "Победа, движение, воля. Триумф через решительность.", rev: "Потеря контроля, агрессия." },
      { id: 8, name: "Сила", icon: "🦁", meaning: "Мужество, терпение. Внутренняя сила преодолеет трудности.", rev: "Слабость, неуверенность." },
      { id: 9, name: "Отшельник", icon: "🏔️", meaning: "Поиск истины, одиночество. Время для размышлений.", rev: "Изоляция, отчуждение." },
      { id: 10, name: "Колесо Фортуны", icon: "☸️", meaning: "Перемены, удача, судьба. Колесо жизни вращается.", rev: "Неудача, сопротивление переменам." },
      { id: 11, name: "Справедливость", icon: "⚖️", meaning: "Баланс, правда, карма. Честность — ключ к успеху.", rev: "Несправедливость, обман." },
      { id: 12, name: "Повешенный", icon: "🙃", meaning: "Новая перспектива. Отпустите контроль и посмотрите иначе.", rev: "Тщетная жертва, задержка." },
      { id: 13, name: "Смерть", icon: "🦋", meaning: "Трансформация. Конец одной главы — начало другой.", rev: "Страх перемен, застой." },
      { id: 14, name: "Умеренность", icon: "⏳", meaning: "Баланс, терпение, гармония. Найдите золотую середину.", rev: "Дисбаланс, крайности." },
      { id: 15, name: "Дьявол", icon: "🔗", meaning: "Искушения, привязанности. Осознайте свои цепи.", rev: "Освобождение, пробуждение." },
      { id: 16, name: "Башня", icon: "⚡", meaning: "Разрушение иллюзий. Внезапные перемены несут освобождение.", rev: "Предотвращение катастрофы, страх." },
      { id: 17, name: "Звезда", icon: "⭐", meaning: "Надежда, вдохновение. Свет в конце тоннеля.", rev: "Отчаяние, потеря веры." },
      { id: 18, name: "Луна", icon: "🌕", meaning: "Иллюзии, интуиция. Не всё так, как кажется.", rev: "Ясность, освобождение от страхов." },
      { id: 19, name: "Солнце", icon: "☀️", meaning: "Радость, успех, энергия. Время счастья и триумфа.", rev: "Временные трудности." },
      { id: 20, name: "Суд", icon: "📯", meaning: "Пробуждение, переоценка. Время важных решений.", rev: "Самосомнение, отказ от перемен." },
      { id: 21, name: "Мир", icon: "🌍", meaning: "Завершение, достижение, гармония. Финал цикла.", rev: "Незавершённость, отсутствие закрытия." }
    ],
    wands: [
      { id: "w1", name: "Туз Жезлов", icon: "🔥", meaning: "Вдохновение, новые возможности.", rev: "Отсутствие энергии, задержки." },
      { id: "w2", name: "Двойка Жезлов", icon: "🌍", meaning: "Планирование, решение.", rev: "Страх неизвестности." },
      { id: "w3", name: "Тройка Жезлов", icon: "🚢", meaning: "Расширение, лидерство.", rev: "Задержки, разочарование." },
      { id: "w4", name: "Четвёрка Жезлов", icon: "🎉", meaning: "Празднование, гармония.", rev: "Нестабильность." },
      { id: "w5", name: "Пятёрка Жезлов", icon: "⚔️", meaning: "Конкуренция, соперничество.", rev: "Избегание конфликтов." },
      { id: "w6", name: "Шестёрка Жезлов", icon: "🏆", meaning: "Победа, признание.", rev: "Провал, эгоизм." },
      { id: "w7", name: "Семёрка Жезлов", icon: "🛡️", meaning: "Защита, стойкость.", rev: "Усталость, сдача позиций." },
      { id: "w8", name: "Восьмёрка Жезлов", icon: "💨", meaning: "Скорость, движение.", rev: "Задержки." }
    ],
    cups: [
      { id: "c1", name: "Туз Кубков", icon: "💧", meaning: "Эмоциональное обновление.", rev: "Эмоциональная блокировка." },
      { id: "c2", name: "Двойка Кубков", icon: "💑", meaning: "Партнёрство, любовь.", rev: "Разрыв." },
      { id: "c3", name: "Тройка Кубков", icon: "🥂", meaning: "Дружба, праздник.", rev: "Изоляция." },
      { id: "c4", name: "Четвёрка Кубков", icon: "😤", meaning: "Апатия, переоценка.", rev: "Пробуждение." },
      { id: "c5", name: "Пятёрка Кубков", icon: "😢", meaning: "Потеря, сожаление.", rev: "Принятие, движение вперёд." },
      { id: "c6", name: "Шестёрка Кубков", icon: "🌸", meaning: "Ностальгия, детство.", rev: "Проживание прошлым." },
      { id: "c7", name: "Семёрка Кубков", icon: "💭", meaning: "Иллюзии, выбор.", rev: "Ясность целей." },
      { id: "c8", name: "Восьмёрка Кубков", icon: "🚶", meaning: "Уход, поиск.", rev: "Страх перемен." }
    ],
    swords: [
      { id: "s1", name: "Туз Мечей", icon: "🗡️", meaning: "Прорыв, ясность.", rev: "Хаос, замешательство." },
      { id: "s2", name: "Двойка Мечей", icon: "🤝", meaning: "Трудный выбор.", rev: "Нерешительность." },
      { id: "s3", name: "Тройка Мечей", icon: "💔", meaning: "Боль, предательство.", rev: "Исцеление." },
      { id: "s4", name: "Четвёрка Мечей", icon: "😴", meaning: "Отдых, восстановление.", rev: "Беспокойство." },
      { id: "s5", name: "Пятёрка Мечей", icon: "🏳️", meaning: "Конфликт, поражение.", rev: "Примирение." },
      { id: "s6", name: "Шестёрка Мечей", icon: "⛵", meaning: "Переход, исцеление.", rev: "Застой." }
    ],
    pentacles: [
      { id: "p1", name: "Туз Пентаклей", icon: "💰", meaning: "Изобилие, новые возможности.", rev: "Потери, упущенные возможности." },
      { id: "p2", name: "Двойка Пентаклей", icon: "🤹", meaning: "Адаптация, баланс.", rev: "Перегруз." },
      { id: "p3", name: "Тройка Пентаклей", icon: "👷", meaning: "Мастерство, качество.", rev: "Безработица." },
      { id: "p4", name: "Четвёрка Пентаклей", icon: "🏦", meaning: "Безопасность, контроль.", rev: "Жадность." },
      { id: "p5", name: "Пятёрка Пентаклей", icon: "🥶", meaning: "Нужда, трудности.", rev: "Помощь приходит." },
      { id: "p6", name: "Шестёрка Пентаклей", icon: "🎁", meaning: "Щедрость, обмен.", rev: "Эгоизм." }
    ]
  };

  const ALL_CARDS = [...TAROT.major, ...TAROT.wands, ...TAROT.cups, ...TAROT.swords, ...TAROT.pentacles];

  // ======== SEED GENERATION ========
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function getSeededRandom(seedStr) {
    return mulberry32(hashString(seedStr));
  }

  // ======== SPREAD CONFIG ========
  const SPREADS = {
    day: { title: "Карта дня", positions: ["Сегодняшняя энергия"], count: 1 },
    week: { title: "Расклад на неделю", positions: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], count: 7 },
    month: { title: "Расклад на месяц", positions: ["Энергия", "Влияния", "Ресурсы", "Тайное", "Совет", "Итог"], count: 6 }
  };

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

  function generateSpread(type) {
    const key = type === 'day' ? getDayKey() : type === 'week' ? getWeekKey() : getMonthKey();
    const rng = getSeededRandom(key);
    const spread = SPREADS[type];
    const cards = [];
    const used = new Set();

    for (let i = 0; i < spread.count; i++) {
      let idx;
      do { idx = Math.floor(rng() * ALL_CARDS.length); } while (used.has(idx));
      used.add(idx);
      const card = { ...ALL_CARDS[idx] };
      card.reversed = rng() < 0.25;
      card.position = spread.positions[i];
      cards.push(card);
    }
    return { type, cards, title: spread.title };
  }

  // ======== INTERPRETATION ========
  function getInterpretation(spread) {
    const { cards, type } = spread;
    const reversed = cards.filter(c => c.reversed).length;
    const total = cards.length;

    if (type === 'day') {
      const c = cards[0];
      return c.reversed
        ? `Карта "${c.name}" в перевёрнутом положении указывает на скрытые аспекты. ${c.rev}`
        : `Карта "${c.name}" несёт мощную энергию. ${c.meaning}`;
    }

    if (type === 'week' || type === 'month') {
      if (reversed > total / 2) {
        return `Преобладание перевёрнутых карт говорит о периоде внутренней работы. ${reversed} из ${total} карт требуют внимания к скрытым аспектам.`;
      } else if (reversed === 0) {
        return `Все карты прямо — гармоничный период впереди! ${cards[0].name} задаёт тон всей неделе.`;
      } else {
        return `Интересное время с ${total - reversed} прямыми и ${reversed} перевёрнутыми картами. Обратите внимание на обе стороны ситуации.`;
      }
    }
    return '';
  }

  function getAdvice(spread) {
    const { cards, type } = spread;
    const major = cards.filter(c => c.id <= 21);
    const reversed = cards.filter(c => c.reversed);

    if (type === 'day') {
      const c = cards[0];
      if (c.id <= 21) {
        return c.reversed
          ? 'Будьте осторожны с решениями. Не действуйте импульсивно, дайте себе время на размышления.'
          : 'Доверяйте интуиции! Сегодня благоприятный день для смелых действий.';
      }
      return c.reversed
        ? 'Обратите внимание на детали и не торопите события.'
        : 'Действуйте уверенно и открыто навстречу возможностям.';
    }

    if (type === 'week') {
      const best = cards.find(c => !c.reversed && c.id <= 21);
      if (best) {
        return `Карта "${best.name}" задаёт энергию недели. ${best.reversed ? 'Будьте внимательны к её перевёрнутой энергии.' : 'Следуйте её советам.'}`;
      }
      return 'Прислушивайтесь к каждой карте — вместе они дают целостную картину.';
    }

    return 'Карты готовы помочь вам. Откройтесь их мудрости.';
  }

  // ======== TIMER ========
  function getTimeUntilNext(type) {
    const now = new Date();
    if (type === 'day') {
      const next = new Date(now); next.setHours(24, 0, 0, 0);
      return next - now;
    }
    if (type === 'week') {
      const next = new Date(now);
      const daysUntilMonday = now.getDay() === 0 ? 1 : (8 - now.getDay());
      next.setDate(now.getDate() + daysUntilMonday);
      next.setHours(0, 0, 0, 0);
      return next - now;
    }
    if (type === 'month') {
      return new Date(now.getFullYear(), now.getMonth() + 1, 1) - now;
    }
    return 0;
  }

  function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  // ======== COMPONENTS ========

  function TarotCard({ card, index, onFlip, isFlipped }) {
    return React.createElement('div', {
      className: 'tarot-card' + (isFlipped ? ' flipped' : ''),
      onClick: () => !isFlipped && onFlip(index)
    },
      React.createElement('div', { className: 'tarot-card-inner' },
        React.createElement('div', { className: 'card-face card-back' },
          React.createElement('span', { className: 'back-symbol' }, '🌙')
        ),
        React.createElement('div', { className: 'card-face card-front' },
          card.reversed && React.createElement('span', { className: 'reversed-badge' }, '▼'),
          React.createElement('span', { className: 'card-icon' }, card.icon),
          React.createElement('span', { className: 'card-name' }, card.name)
        )
      )
    );
  }

  function Timer({ type }) {
    const [time, setTime] = useState('');

    useEffect(() => {
      const update = () => setTime(formatTime(getTimeUntilNext(type)));
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }, [type]);

    const label = type === 'day' ? 'Обновится через' : type === 'week' ? 'Новая неделя через' : 'Новый месяц через';
    return React.createElement('div', { className: 'timer-bar' },
      React.createElement('span', null, '⏳'),
      React.createElement('span', { className: 'timer-text' },
        label + ': ', React.createElement('span', { className: 'timer-highlight' }, time)
      )
    );
  }

  function App() {
    const tg = window.Telegram?.WebApp;
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('day');
    const [flippedCards, setFlippedCards] = useState({});
    const [currentSpread, setCurrentSpread] = useState(null);

    useEffect(() => {
      if (tg) {
        tg.ready();
        tg.expand();
      }
      const savedUser = localStorage.getItem('taro_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setShowModal(false);
      }
    }, []);

    const handleRegister = (userData) => {
      setUser(userData);
      localStorage.setItem('taro_user', JSON.stringify(userData));
      setShowModal(false);
    };

    const handleFlip = useCallback((index) => {
      setFlippedCards(prev => ({ ...prev, [`${activeTab}-${index}`]: true }));
    }, [activeTab]);

    const handleFlipAll = useCallback(() => {
      const newFlipped = {};
      currentSpread.cards.forEach((_, i) => newFlipped[`${activeTab}-${i}`] = true);
      setFlippedCards(newFlipped);
    }, [activeTab, currentSpread]);

    const handleNewSpread = useCallback(() => {
      const key = activeTab + Date.now();
      setCurrentSpread(generateSpread(activeTab));
      setFlippedCards({});
    }, [activeTab]);

    const handleTabChange = (tab) => {
      setActiveTab(tab);
      setCurrentSpread(generateSpread(tab));
      setFlippedCards({});
    };

    const handleThemeChange = (t) => {
      setTheme(t);
      document.body.style.background = t === 'dark' ? '#08081a' : '#f5f5f5';
    };

    // Initialize spread
    useEffect(() => {
      setCurrentSpread(generateSpread(activeTab));
    }, []);

    const allFlipped = currentSpread?.cards.every((_, i) => flippedCards[`${activeTab}-${i}`]);
    const interpretation = allFlipped ? getInterpretation(currentSpread) : null;
    const advice = allFlipped ? getAdvice(currentSpread) : null;

    const signEmojis = { aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓' };

    // Register Modal
    if (showModal) {
      return React.createElement(RegisterModal, { onRegister: handleRegister });
    }

    const gridClass = activeTab === 'day' ? 'single' : 'week';

    return React.createElement('div', { className: 'app-container' },
      // Header
      React.createElement('div', { className: 'header' },
        React.createElement('div', { className: 'theme-switcher' },
          React.createElement('button', { className: `theme-btn dark ${theme === 'dark' ? 'active' : ''}`, onClick: () => handleThemeChange('dark') }),
          React.createElement('button', { className: `theme-btn light ${theme === 'light' ? 'active' : ''}`, onClick: () => handleThemeChange('light') })
        ),
        React.createElement('div', { className: 'logo' }, '🌙'),
        React.createElement('h1', null, 'Таро Мистик'),
        user && React.createElement('p', null, `Привет, ${user.name}! ${signEmojis[user.sign] || ''}`),
        React.createElement('p', null, 'Карты, которые знают ответ')
      ),

      // Tabs
      React.createElement('div', { className: 'tabs' },
        ['day', 'week', 'month'].map(tab =>
          React.createElement('button', {
            key: tab,
            className: `tab ${activeTab === tab ? 'active' : ''}`,
            onClick: () => handleTabChange(tab)
          },
            React.createElement('span', { className: 'tab-icon' }, tab === 'day' ? '☀️' : tab === 'week' ? '📅' : '🌙'),
            React.createElement('span', null, tab === 'day' ? 'День' : tab === 'week' ? 'Неделя' : 'Месяц')
          )
        )
      ),

      // Spread
      React.createElement('div', { className: 'spread-area' },
        React.createElement('div', { className: 'spread-title' },
          React.createElement('h2', null, currentSpread?.title),
          React.createElement('p', null, allFlipped ? 'Все карты открыты' : 'Нажмите на карту')
        ),

        React.createElement(Timer, { type: activeTab }),

        React.createElement('div', { className: `cards-grid ${gridClass}` },
          currentSpread?.cards.map((card, i) =>
            React.createElement('div', { key: i, className: 'card-appear', style: { animationDelay: `${i * 0.1}s` } },
              React.createElement('div', { className: 'position-label' }, card.position),
              React.createElement(TarotCard, {
                card, index: i, onFlip: handleFlip,
                isFlipped: !!flippedCards[`${activeTab}-${i}`]
              })
            )
          )
        ),

        !allFlipped && React.createElement('button', { className: 'btn-flip-all', onClick: handleFlipAll }, '✨ Открыть все'),
        React.createElement('button', { className: 'btn-refresh', onClick: handleNewSpread }, '🔄 Новый расклад')
      ),

      // Interpretation
      allFlipped && React.createElement('div', { className: 'reading-section' },
        currentSpread.cards.map((card, i) =>
          React.createElement('div', { key: i, className: 'reading-card' },
            React.createElement('h3', null,
              card.icon + ' ' + card.position,
              card.reversed && ' (перевёрнутая)'
            ),
            React.createElement('div', { className: 'card-meaning' },
              React.createElement('span', { className: 'emoji' }, card.icon),
              React.createElement('div', { className: 'info' },
                React.createElement('h4', null, card.name),
                React.createElement('p', null, card.reversed ? card.rev : card.meaning)
              )
            )
          )
        ),

        interpretation && React.createElement('div', { className: 'summary-box' },
          React.createElement('h3', null, '🔮 Общий прогноз'),
          React.createElement('p', null, interpretation)
        ),

        advice && React.createElement('div', { className: 'advice-box' },
          React.createElement('h3', null, '✨ Совет'),
          React.createElement('p', null, advice)
        )
      ),

      React.createElement('div', { className: 'footer' }, '🌙 Таро Мистик — бесплатные расклады')
    );
  }

  function RegisterModal({ onRegister }) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState('');

    const handleSubmit = () => {
      if (!name || !gender || !birthdate) return;
      const sign = calculateSign(birthdate);
      onRegister({ name, gender, birthdate, sign });
    };

    const calculateSign = (date) => {
      const d = new Date(date);
      const m = d.getMonth() + 1, day = d.getDate();
      const signs = [['capricorn',1,19],['aquarius',1,20],['pisces',2,18],['aries',3,20],['taurus',4,20],['gemini',5,20],['cancer',6,21],['leo',7,22],['virgo',8,22],['libra',9,22],['scorpio',10,22],['sagittarius',11,21],['capricorn',12,21]];
      for (const [s, month, d2] of signs) if (m < month || (m === month && day <= d2)) return s;
      return 'capricorn';
    };

    return React.createElement('div', { className: 'modal-overlay' },
      React.createElement('div', { className: 'modal-content' },
        React.createElement('div', { className: 'modal-header' },
          React.createElement('span', { className: 'icon' }, '🌙'),
          React.createElement('h2', null, 'Добро пожаловать!'),
          React.createElement('p', null, 'Расскажите немного о себе')
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Ваше имя'),
          React.createElement('input', { type: 'text', placeholder: 'Как вас зовут?', value: name, onChange: e => setName(e.target.value) })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Пол'),
          React.createElement('div', { className: 'gender-toggle' },
            React.createElement('button', { className: `gender-option ${gender === 'male' ? 'active' : ''}`, onClick: () => setGender('male') }, '♂ Мужчина'),
            React.createElement('button', { className: `gender-option ${gender === 'female' ? 'active' : ''}`, onClick: () => setGender('female') }, '♀ Женщина')
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Дата рождения'),
          React.createElement('input', { type: 'date', value: birthdate, onChange: e => setBirthdate(e.target.value) })
        ),
        React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, 'Продолжить ✨')
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
