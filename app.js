(() => {
  const { useState, useEffect, useCallback, useMemo, useRef } = React;

  // ======== TAROT DECK (78 cards) ========
  const TAROT = {
    major: [
      { id: 0, name: "Шут", nameEn: "The Fool", icon: "🃏", meaning: "Новые начинания, спонтанность, свобода. Карта призывает довериться интуиции и сделать шаг в неизвестность.", rev: "Легкомыслие, страх перемен, нерешительность." },
      { id: 1, name: "Маг", nameEn: "The Magician", icon: "🪄", meaning: "Сила воли, мастерство, концентрация. У вас есть все ресурсы для достижения цели.", rev: "Манипуляции, потенциал без действий, обман." },
      { id: 2, name: "Верховная Жрица", nameEn: "High Priestess", icon: "🌙", meaning: "Интуиция, тайны, внутренняя мудрость. Прислушайтесь к внутреннему голосу.", rev: "Подавленная интуиция, поверхностные знания." },
      { id: 3, name: "Императрица", nameEn: "The Empress", icon: "👑", meaning: "Плодородие, изобилие, забота. Период творчества и изобилия.", rev: "Творческий блок, зависимость, бесплодие." },
      { id: 4, name: "Император", nameEn: "The Emperor", icon: "🏛️", meaning: "Власть, структура, стабильность. Время проявить лидерство и дисциплину.", rev: "Тирания, жёсткий контроль, негибкость." },
      { id: 5, name: "Иерофант", nameEn: "The Hierophant", icon: "📿", meaning: "Традиции, духовность, обучение. Обращение к авторитетам и традициям.", rev: "Вызов традициям, нетрадиционный подход." },
      { id: 6, name: "Влюблённые", nameEn: "The Lovers", icon: "💕", meaning: "Любовь, гармония, выбор. Важное решение о отношениях или ценностях.", rev: "Дисгармония, неправильный выбор, нерешительность." },
      { id: 7, name: "Колесница", nameEn: "The Chariot", icon: "⚔️", meaning: "Победа, движение вперёд, воля. Триумф через решимость и контроль.", rev: "Поражение, отсутствие направления, агрессия." },
      { id: 8, name: "Сила", nameEn: "Strength", icon: "🦁", meaning: "Мужество, терпение, внутренняя сила. Кротость и compassion преодолеют трудности.", rev: "Слабость, неуверенность, отсутствие самоконтроля." },
      { id: 9, name: "Отшельник", nameEn: "The Hermit", icon: "🏔️", meaning: "Созерцание, поиск истины, одиночество. Время для внутреннего поиска.", rev: "Изоляция, отчуждение, упрямство." },
      { id: 10, name: "Колесо Фортуны", nameEn: "Wheel of Fortune", icon: "☸️", meaning: "Судьба, перемены, удача. Колесо жизни вращается — перемены неизбежны.", rev: "Неудача, потеря контроля, сопротивление переменам." },
      { id: 11, name: "Справедливость", nameEn: "Justice", icon: "⚖️", meaning: "Баланс, правда, карма. Правосудие восторжествует, честность — ключ.", rev: "Несправедливость, нечестность, нерешительность." },
      { id: 12, name: "Повешенный", nameEn: "The Hanged Man", icon: "🙃", meaning: "Жертва, новая перспектива, ожидание. Отпустите контроль и увидите иначе.", rev: "Тщетная жертва, упрямство, задержка." },
      { id: 13, name: "Смерть", nameEn: "Death", icon: "🦋", meaning: "Трансформация, конец и начало, обновление. Конец одной главы — начало другой.", rev: "Страх перемен, застой, отпускание." },
      { id: 14, name: "Умеренность", nameEn: "Temperance", icon: "⏳", meaning: "Баланс, терпение, гармония. Время найти средний путь и сохранять спокойствие.", rev: "Дисбаланс, излишество, нетерпение." },
      { id: 15, name: "Дьявол", nameEn: "The Devil", icon: "🔗", meaning: "Привязанности, искушения, тень. Осознайте свои цепи и освободитесь.", rev: "Освобождение, пробуждение, восстановление контроля." },
      { id: 16, name: "Башня", nameEn: "The Tower", icon: "⚡", meaning: "Разрушение, откровение, освобождение. Внезапные перемены разрушают иллюзии.", rev: "Предотвращение катастрофы, страх перемен." },
      { id: 17, name: "Звезда", nameEn: "The Star", icon: "⭐", meaning: "Надежда, вдохновение, вера. Свет в конце туннеля — верьте в лучшее.", rev: "Отчаяние, потеря веры, разочарование." },
      { id: 18, name: "Луна", nameEn: "The Moon", icon: "🌕", meaning: "Иллюзии, страх, подсознание. Не всё так, как кажется — доверяйте интуиции.", rev: "Освобождение от страхов, ясность." },
      { id: 19, name: "Солнце", nameEn: "The Sun", icon: "☀️", meaning: "Радость, успех, жизненная энергия. Время счастья, ясности и триумфа.", rev: "Временные трудности, задержка радости." },
      { id: 20, name: "Суд", nameEn: "Judgement", icon: "📯", meaning: "Пробуждение, переоценка, возрождение. Время принять важное решение и воскреснуть.", rev: "Самосомнение, отказ от самоанализа." },
      { id: 21, name: "Мир", nameEn: "The World", icon: "🌍", meaning: "Завершение, достижение, целостность. Финал цикла — празднование и гармония.", rev: "Незавершённость, отсутствие замыкания." }
    ],
    wands: [
      { suit: "Жезлы", id: "w1", name: "Туз Жезлов", icon: "🔥", meaning: "Вдохновение, новые возможности, творческая энергия. Мощное начало.", rev: "Отсутствие энергии, задержки, отсутствие направления." },
      { suit: "Жезлы", id: "w2", name: "Двойка Жезлов", icon: "🌍", meaning: "Планирование, прогресс, решение. Мир в ваших руках.", rev: "Страх неизвестности, отсутствие планирования." },
      { suit: "Жезлы", id: "w3", name: "Тройка Жезлов", icon: "🚢", meaning: "Расширение, предвидение, лидерство. Ваши усилия приносят результаты.", rev: "Задержки, отсутствие прогресса, разочарование." },
      { suit: "Жезлы", id: "w4", name: "Четвёрка Жезлов", icon: "🎉", meaning: "Гармония, празднование, домашний уют. Время для радости.", rev: "Переходный период, нестабильность." },
      { suit: "Жезлы", id: "w5", name: "Пятёрка Жезлов", icon: "⚔️", meaning: "Конкуренция, соперничество, борьба. Соревнование, но не обязательно вражда.", rev: "Избегание конфликтов, внутренний конфликт." },
      { suit: "Жезлы", id: "w6", name: "Шестёрка Жезлов", icon: "🏆", meaning: "Победа, признание, успех. Ваш триумф будет замечен.", rev: "Провал, отсутствие признания, эго." },
      { suit: "Жезлы", id: "w7", name: "Семёрка Жезлов", icon: "🛡️", meaning: "Защита, стойкость, смелость. Защищайте свою позицию.", rev: "Перегруз, сдача позиций, усталость." },
      { suit: "Жезлы", id: "w8", name: "Восьмёрка Жезлов", icon: "💨", meaning: "Скорость, движение, стремительность. События развиваются быстро.", rev: "Задержки, сопротивление переменам." },
      { suit: "Жезлы", id: "w9", name: "Девятка Жезлов", icon: "🏰", meaning: "Стойкость, выносливость, последний рубеж. Держитесь, победа близка.", rev: "Измождённость, паранойя, упрямство." },
      { suit: "Жезлы", id: "w10", name: "Десятка Жезлов", icon: "🏋️", meaning: "Бремя, ответственность, перегрузка. Вы берёте на себя слишком много.", rev: "Освобождение от бремени, делегирование." },
      { suit: "Жезлы", id: "wp", name: "Паж Жезлов", icon: "📜", meaning: "Энтузиазм, исследование, новость. Привлекательное предложение на горизонте.", rev: "Отсутствие направления, незрелость." },
      { suit: "Жезлы", id: "wk", name: "Рыцарь Жезлов", icon: "🐴", meaning: "Действие, приключение, энергия. Смелый и страстный подход.", rev: "Импульсивность, поспешность, разочарование." },
      { suit: "Жезлы", id: "wq", name: "Королева Жезлов", icon: "🔥", meaning: "Уверенность, независимость, обаяние. Лидерство через харизму.", rev: "Ревность, эгоизм, манипуляции." },
      { suit: "Жезлы", id: "wk2", name: "Король Жезлов", icon: "🦁", meaning: "Вдохновляющий лидер, дальновидность, предпринимательство.", rev: "Тирания, импульсивность, высокомерие." }
    ],
    cups: [
      { suit: "Кубки", id: "c1", name: "Туз Кубков", icon: "💧", meaning: "Эмоциональное обновление, интуиция, новые чувства. Поток любви и творчества.", rev: "Эмоциональная блокировка, подавленные чувства." },
      { suit: "Кубки", id: "c2", name: "Двойка Кубков", icon: "💑", meaning: "Партнёрство, союз, притяжение. Гармоничные отношения.", rev: "Разрыв, неуравновешенность, разногласия." },
      { suit: "Кубки", id: "c3", name: "Тройка Кубков", icon: "🥂", meaning: "Дружба, празднование, общение. Радость в кругу близких.", rev: "Избыточность, сплетни, изоляция." },
      { suit: "Кубки", id: "c4", name: "Четвёрка Кубков", icon: "😤", meaning: "Размышления, апатия, переоценка. Вы упускаете возможности из-за капризов.", rev: "Пробуждение, осознание, новый подход." },
      { suit: "Кубки", id: "c5", name: "Пятёрка Кубков", icon: "😢", meaning: "Потеря, горе, сожаление. Сфокусируйтесь на том, что осталось.", rev: "Принятие, прощение, движение вперёд." },
      { suit: "Кубки", id: "c6", name: "Шестёрка Кубков", icon: "🌸", meaning: "Ностальгия, детство, невинность. Воссоединение с прошлым.", rev: "Проживание прошлым, незрелость." },
      { suit: "Кубки", id: "c7", name: "Семёрка Кубков", icon: "💭", meaning: "Иллюзии, фантазии, выбор. Много вариантов, но не все реальны.", rev: "Определение целей, ясное видение." },
      { suit: "Кубки", id: "c8", name: "Восьмёрка Кубков", icon: "🚶", meaning: "Уход, разочарование, поиск. Оставьте то, что больше не служит.", rev: "Страх перемен, блуждание." },
      { suit: "Кубки", id: "c9", name: "Девятка Кубков", icon: "✨", meaning: "Исполнение желаний, удовлетворение, счастье. Карта загаданного желания.", rev: "Жадность, материализм, неудовлетворённость." },
      { suit: "Кубки", id: "c10", name: "Десятка Кубков", icon: "👨‍👩‍👧‍👦", meaning: "Гармония, счастье в семье, блаженство. Эмоциональное совершенство.", rev: "Семейные конфликты, разлад в отношениях." },
      { suit: "Кубки", id: "cp", name: "Паж Кубков", icon: "💌", meaning: "Сообщение, творчество, интуиция. Эмоциональная новость.", rev: "Эмоциональная незрелость, обман." },
      { suit: "Кубки", id: "ck", name: "Рыцарь Кубков", icon: "🌊", meaning: "Романтика, мечтательность, фантазия. Следуйте за сердцем.", rev: "Идеализация, меланхолия, отсутствие направления." },
      { suit: "Кубки", id: "cq", name: "Королева Кубков", icon: "🧜‍♀️", meaning: "Сострадание, интуиция, забота. Эмоциональная зрелость и мудрость.", rev: "Эмоциональная зависимость, жертвенность." },
      { suit: "Кубки", id: "ck2", name: "Король Кубков", icon: "🎭", meaning: "Эмоциональный контроль, дипломатия, мудрость. Баланс чувств и разума.", rev: "Манипуляции, эмоциональная нестабильность." }
    ],
    swords: [
      { suit: "Мечи", id: "s1", name: "Туз Мечей", icon: "🗡️", meaning: "Прорыв, ясность ума, правда. Пронзите иллюзии и увидите истину.", rev: "Замешательство, жестокость, хаос." },
      { suit: "Мечи", id: "s2", name: "Двойка Мечей", icon: "🤝", meaning: "Тупик, трудный выбор, баланс. Решение требует компромисса.", rev: "Перегруз информацией, нерешительность." },
      { suit: "Мечи", id: "s3", name: "Тройка Мечей", icon: "💔", meaning: "Сердечная боль, потеря, предательство. Тяжёлое, но необходимое переживание.", rev: "Оптимизм, прощение, исцеление." },
      { suit: "Мечи", id: "s4", name: "Четвёрка Мечей", icon: "😴", meaning: "Отдых, восстановление, медитация. Пауза для обновления сил.", rev: "Беспокойство, выгорание, беспокойство." },
      { suit: "Мечи", id: "s5", name: "Пятёрка Мечей", icon: "🏳️", meaning: "Поражение, конфликт, проигрыш. Пиррова победа — задумайтесь о цене.", rev: "Примирение, восстановление, прощение." },
      { suit: "Мечи", id: "s6", name: "Шестёрка Мечей", icon: "⛵", meaning: "Переход, перемещение, исцеление. Время уходить от проблем.", rev: "Застой, возвращение, эмоциональный багаж." },
      { suit: "Мечи", id: "s7", name: "Семёрка Мечей", icon: "🎭", meaning: "Хитрость, обман, стратегия. Не всё честно — будьте бдительны.", rev: "Честность, осознание обмана." },
      { suit: "Мечи", id: "s8", name: "Восьмёрка Мечей", icon: "🕸️", meaning: "Ограничения, жертва, беспомощность. Ограничения часто — иллюзия.", rev: "Освобождение, ясность, самоосознание." },
      { suit: "Мечи", id: "s9", name: "Девятка Мечей", icon: "😰", meaning: "Тревога, кошмары, страх. Ваш разум — источник мучений.", rev: "Надежда, выход из кризиса, облегчение." },
      { suit: "Мечи", id: "s10", name: "Десятка Мечей", icon: "🌅", meaning: "Конец, дно, обновление. Худшее позади — вверх идёт только подъём.", rev: "Восстановление, возрождение, неизбежность." },
      { suit: "Мечи", id: "sp", name: "Паж Мечей", icon: "🔍", meaning: "Любознательность, наблюдательность, правда. Исследуйте факты.", rev: "Сплетни, жестокость, отсутствие направления." },
      { suit: "Мечи", id: "sk", name: "Рыцарь Мечей", icon: "⚔️", meaning: "Амбиции, действие, прямолинейность. Быстрые и решительные действия.", rev: "Агрессия, безрассудство, импульсивность." },
      { suit: "Мечи", id: "sq", name: "Королева Мечей", icon: "❄️", meaning: "Независимость, проницательность, прямота. Ясное, рациональное мышление.", rev: "Холодность, жестокость, мстительность." },
      { suit: "Мечи", id: "sk2", name: "Король Мечей", icon: "🧠", meaning: "Интеллект, авторитет, истина. Логика и правосудие.", rev: "Тирания, манипуляции, злоупотребление властью." }
    ],
    pentacles: [
      { suit: "Пентакли", id: "p1", name: "Туз Пентаклей", icon: "💰", meaning: "Процветание, новые возможности, изобилие. Новое финансовое начинание.", rev: "Расточительство, жадность, упущенные возможности." },
      { suit: "Пентакли", id: "p2", name: "Двойка Пентаклей", icon: "🤹", meaning: "Адаптация, баланс, приоритеты. Лавирование между обязанностями.", rev: "Перегруз, дисбаланс, финансовые проблемы." },
      { suit: "Пентакли", id: "p3", name: "Тройка Пентаклей", icon: "👷", meaning: "Мастерство, teamwork, качество. Признание ваших навыков.", rev: "Отсутствие сотрудничества, низкое качество." },
      { suit: "Пентакли", id: "p4", name: "Четвёрка Пентаклей", icon: "🏦", meaning: "Контроль, безопасность, бережливость. Держитесь за то, что имеете.", rev: "Жадность, материализм, расточительство." },
      { suit: "Пентакли", id: "p5", name: "Пятёрка Пентаклей", icon: "🥶", meaning: "Нужда, бедность, изоляция. Финансовые или физические трудности.", rev: "Восстановление, помощь, улучшение." },
      { suit: "Пентакли", id: "p6", name: "Шестёрка Пентаклей", icon: "🎁", meaning: "Щедрость, помощь, обмен. Давайте и принимайте в равной мере.", rev: "Эгоизм, долги, односторонние отношения." },
      { suit: "Пентакли", id: "p7", name: "Семёрка Пентаклей", icon: "🌱", meaning: "Терпение, оценка прогресса, долгосрочные инвестиции. Ожидание результатов.", rev: "Нетерпение, разочарование, неразумные инвестиции." },
      { suit: "Пентакли", id: "p8", name: "Восьмёрка Пентаклей", icon: "🔨", meaning: "Мастерство, трудолюбие, мастерство. Посвятите себя ремеслу.", rev: "Отсутствие амбиций, лень, перфекционизм." },
      { suit: "Пентакли", id: "p9", name: "Девятка Пентаклей", icon: "🍷", meaning: "Независимость, изобилие, самодостаточность. Награда за упорный труд.", rev: "Зависимость, расточительство, материализм." },
      { suit: "Пентакли", id: "p10", name: "Десятка Пентаклей", icon: "🏠", meaning: "Богатство, семья, наследство. Финансовая безопасность и семейный комфорт.", rev: "Нестабильность, потери, семейные конфликты." },
      { suit: "Пентакли", id: "pp", name: "Паж Пентаклей", icon: "📖", meaning: "Обучение, планирование, новости. Молодой энтузиазм в делах.", rev: "Отсутствие прогресса, лень, отвлечения." },
      { suit: "Пентакли", id: "pk", name: "Рыцарь Пентаклей", icon: "🐂", meaning: "Трудолюбие, надёжность, методичность. Медленно, но верно.", rev: "Лень, упрямство, рутина." },
      { suit: "Пентакли", id: "pq", name: "Королева Пентаклей", icon: "🌺", meaning: "Практичность, безопасность, забота. Создаёт уют и процветание.", rev: "Работоголизм, зависимость, неуравновешенность." },
      { suit: "Пентакли", id: "pk2", name: "Король Пентаклей", icon: "💎", meaning: "Богатство, бизнес, лидерство. Финансовый успех и надёжность.", rev: "Жадность, материализм, упрямство." }
    ]
  };

  // Combine all cards
  const ALL_CARDS = [...TAROT.major, ...TAROT.wands, ...TAROT.cups, ...TAROT.swords, ...TAROT.pentacles];

  // ======== SEED-BASED RANDOM ========
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
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function getSeededRandom(seedStr) {
    return mulberry32(hashString(seedStr));
  }

  // ======== SPREAD GENERATION ========
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

  function getTimeUntilNext(type) {
    const now = new Date();
    if (type === 'day') {
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      return next - now;
    }
    if (type === 'week') {
      const next = new Date(now);
      const dayOfWeek = now.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
      next.setDate(now.getDate() + daysUntilMonday);
      next.setHours(0, 0, 0, 0);
      return next - now;
    }
    if (type === 'month') {
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return next - now;
    }
    return 0;
  }

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 24) {
      const d = Math.floor(h / 24);
      return `${d}д ${h % 24}ч ${m}м`;
    }
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // ======== SPREAD POSITIONS ========
  const SPREADS = {
    day: {
      title: "Карта дня",
      subtitle: "Совет на сегодня",
      positions: ["Сегодняшняя энергия"],
      count: 1
    },
    week: {
      title: "Расклад на неделю",
      subtitle: "Семь карт на семь дней",
      positions: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
      count: 7
    },
    month: {
      title: "Расклад на месяц",
      subtitle: "Глубокий обзор месяца",
      positions: ["Энергия месяца", "Внешние влияния", "Ваши ресурсы", "Тайные силы", "Совет карт", "Итог месяца"],
      count: 6
    }
  };

  function generateSpread(type, seedExtra) {
    const key = type === 'day' ? getDayKey() : type === 'week' ? getWeekKey() : getMonthKey();
    const seed = key + (seedExtra || '');
    const rng = getSeededRandom(seed);
    const spread = SPREADS[type];
    const cards = [];
    const used = new Set();

    for (let i = 0; i < spread.count; i++) {
      let idx;
      do {
        idx = Math.floor(rng() * ALL_CARDS.length);
      } while (used.has(idx));
      used.add(idx);

      const card = { ...ALL_CARDS[idx] };
      card.reversed = rng() < 0.25;
      card.position = spread.positions[i];
      cards.push(card);
    }
    return { type, key, cards, title: spread.title, subtitle: spread.subtitle };
  }

  // ======== INTERPRETATIONS ========
  function getInterpretation(spread) {
    const { cards, type } = spread;
    const summaryParts = [];
    const reversedCount = cards.filter(c => c.reversed).length;
    const positiveCount = cards.filter(c => !c.reversed).length;

    if (type === 'day') {
      const c = cards[0];
      if (c.reversed) {
        summaryParts.push(`Сегодняшний день несёт энергию карты "${c.name}" в перевёрнутом положении. ${c.rev}`);
      } else {
        summaryParts.push(`Сегодня ваш день наполнен энергией "${c.name}". ${c.meaning}`);
      }
    } else if (type === 'week') {
      if (reversedCount > 4) {
        summaryParts.push(`Эта неделя может быть непростой — ${reversedCount} карт из 7 перевёрнуты. Это период внутренней работы и переоценки.`);
      } else if (reversedCount === 0) {
        summaryParts.push(`Прекрасная неделя! Все карты выпали прямо — ожидается гармоничный и продуктивный период.`);
      } else {
        summaryParts.push(`Неделя обещает быть интересной. ${positiveCount} прямых карт поддерживают позитивное течение, а ${reversedCount} перевёрнутых напоминают о внимательности.`);
      }
    } else {
      if (reversedCount > 3) {
        summaryParts.push(`Месяц потребует внутренней работы. Множество перевёрнутых карт указывают на период трансформации и переосмысления.`);
      } else {
        summaryParts.push(`Этот месяц обещает быть насыщенным и продуктивным. Энергии карт поддерживают ваш рост.`);
      }
    }

    return summaryParts.join(' ');
  }

  function getAdvice(spread) {
    const { cards, type } = spread;
    const reversed = cards.filter(c => c.reversed);
    const adviceParts = [];

    if (type === 'day') {
      const c = cards[0];
      if (c.id <= 21) {
        adviceParts.push(`Как карта Старшего Аркана, "${c.name}" — это мощное послание. ${c.reversed ? 'Сегодня будьте осторожны и не принимайте важных решений на эмоциях.' : 'Сегодня благоприятный день для смелых действий — доверяйтесь интуиции.'}`);
      } else {
        adviceParts.push(`Сегодняшняя карта советует ${c.reversed ? 'быть внимательнее к деталям и не торопить события.' : 'действовать уверенно и открыто.'}`);
      }
    } else if (type === 'week') {
      const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const bestDay = cards.reduce((best, c, i) => (!c.reversed && (cards[best].reversed || c.id < cards[best].id)) ? i : best, 0);
      adviceParts.push(`Самый благоприятный день недели — ${weekDays[bestDay]} (${cards[bestDay].position}). Карта "${cards[bestDay].name}" обещает удачу.`);
      if (reversed.length > 0) {
        adviceParts.push(`В дни с перевёрнутыми картами (${reversed.map(c => c.position).join(', ')}) будьте осторожнее и избегайте конфликтов.`);
      }
    } else {
      adviceParts.push(`Обратите внимание на карту "Ваши ресурсы" — она показывает, на что опираться. Карта "Совет карт" даст ключ к главной задаче месяца.`);
      if (reversed.length > 0) {
        adviceParts.push(`Перевёрнутые карты (${reversed.map(c => c.position).join(', ')}) указывают на области, требующие особого внимания.`);
      }
    }

    return adviceParts.join(' ');
  }

  // ======== REACT COMPONENTS ========

  function TarotCard({ card, index, onFlip, isFlipped }) {
    const [sparkles, setSparkles] = useState([]);

    const handleClick = () => {
      if (!isFlipped) {
        const newSparkles = Array.from({length: 5}, (_, i) => ({
          id: Date.now() + i,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60
        }));
        setSparkles(newSparkles);
        setTimeout(() => setSparkles([]), 1000);
        onFlip(index);
      }
    };

    return React.createElement('div', { className: 'tarot-card' + (isFlipped ? ' flipped' : ''), onClick: handleClick },
      React.createElement('div', { className: 'tarot-card-inner' },
        React.createElement('div', { className: 'card-face card-back' },
          React.createElement('div', { className: 'back-pattern' },
            React.createElement('span', { className: 'back-symbol' }, '🌙')
          ),
          sparkles.map(s =>
            React.createElement('div', {
              key: s.id,
              className: 'sparkle',
              style: { left: s.x + '%', top: s.y + '%' }
            })
          )
        ),
        React.createElement('div', { className: 'card-face card-front' + (card.reversed ? ' reversed' : '') },
          React.createElement('span', { className: 'card-number' }, card.suit || 'Аркан'),
          React.createElement('span', { className: 'card-icon' }, card.icon),
          React.createElement('span', { className: 'card-name' }, card.name)
        )
      )
    );
  }

  function Timer({ type }) {
    const [time, setTime] = useState('');

    useEffect(() => {
      const update = () => {
        const ms = getTimeUntilNext(type);
        setTime(formatTime(ms));
      };
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }, [type]);

    const label = type === 'day' ? 'Обновится через' : type === 'week' ? 'Новая неделя через' : 'Новый месяц через';

    return React.createElement('div', { className: 'timer-bar' },
      React.createElement('span', { className: 'timer-icon' }, '⏳'),
      React.createElement('span', { className: 'timer-text' },
        label + ': ',
        React.createElement('span', { className: 'timer-highlight' }, time)
      )
    );
  }

  function App() {
    const tg = window.Telegram?.WebApp;
    const [activeTab, setActiveTab] = useState('day');
    const [flippedCards, setFlippedCards] = useState({});
    const [extraSeed, setExtraSeed] = useState('');

    useEffect(() => {
      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0a0a1a');
        tg.setBackgroundColor('#0a0a1a');
      }
    }, []);

    const currentSpread = useMemo(() =>
      generateSpread(activeTab, extraSeed),
      [activeTab, extraSeed]
    );

    const allFlipped = currentSpread.cards.every((_, i) =>
      flippedCards[`${activeTab}-${i}`]
    );

    const handleFlip = useCallback((index) => {
      setFlippedCards(prev => ({
        ...prev,
        [`${activeTab}-${index}`]: true
      }));
    }, [activeTab]);

    const handleFlipAll = useCallback(() => {
      const newFlipped = { ...flippedCards };
      currentSpread.cards.forEach((_, i) => {
        newFlipped[`${activeTab}-${i}`] = true;
      });
      setFlippedCards(newFlipped);
    }, [activeTab, currentSpread, flippedCards]);

    const handleRefresh = useCallback(() => {
      setFlippedCards({});
      setExtraSeed(String(Date.now()));
    }, []);

    const handleShare = useCallback(() => {
      const text = `🌙 *${currentSpread.title}*\n\n${currentSpread.cards.map(c =>
        `${c.icon} *${c.position}:* ${c.name}${c.reversed ? ' (перевёрнутая)' : ''}`
      ).join('\n')}\n\n✨ Узнай свой расклад!`;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`);
      } else {
        navigator.clipboard?.writeText(text);
      }
    }, [currentSpread, tg]);

    // Init from saved state
    useEffect(() => {
      const saved = localStorage.getItem(`taro_${activeTab}_flipped`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.key === currentSpread.key) {
            setFlippedCards(parsed.flipped || {});
          }
        } catch(e) {}
      }
    }, [activeTab]);

    // Save state
    useEffect(() => {
      localStorage.setItem(`taro_${activeTab}_flipped`, JSON.stringify({
        key: currentSpread.key,
        flipped: flippedCards
      }));
    }, [activeTab, flippedCards, currentSpread]);

    const interpretation = allFlipped ? getInterpretation(currentSpread) : null;
    const advice = allFlipped ? getAdvice(currentSpread) : null;

    const isTriple = currentSpread.cards.length === 7;
    const isSingle = currentSpread.cards.length === 1;

    return React.createElement('div', { className: 'app-container' },
      // Header
      React.createElement('div', { className: 'taro-header' },
        React.createElement('div', { className: 'moon' }, '🌙'),
        React.createElement('h1', null, 'Таро Мистик'),
        React.createElement('p', null, 'Карты, которые знают ответ')
      ),

      // Tabs
      React.createElement('div', { className: 'tabs' },
        ['day', 'week', 'month'].map(tab =>
          React.createElement('button', {
            key: tab,
            className: 'tab' + (activeTab === tab ? ' active' : ''),
            onClick: () => setActiveTab(tab)
          },
            React.createElement('span', { className: 'tab-icon' },
              tab === 'day' ? '☀️' : tab === 'week' ? '📅' : '🌙'
            ),
            React.createElement('span', { className: 'tab-label' },
              tab === 'day' ? 'День' : tab === 'week' ? 'Неделя' : 'Месяц'
            )
          )
        )
      ),

      // Spread area
      React.createElement('div', { className: 'spread-area' },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '8px' } },
          React.createElement('h2', {
            style: {
              fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700,
              color: 'var(--text)', marginBottom: '4px'
            }
          }, currentSpread.title),
          React.createElement('p', {
            style: { color: 'var(--text3)', fontSize: '0.75rem' }
          }, currentSpread.subtitle)
        ),

        React.createElement(Timer, { type: activeTab }),

        // Cards
        React.createElement('div', {
          className: 'cards-grid' + (isSingle ? ' single' : isTriple ? ' triple' : '')
        },
          currentSpread.cards.map((card, i) =>
            React.createElement('div', { key: i, className: 'card-appear', style: { animationDelay: `${i * 0.1}s` } },
              React.createElement('div', { className: 'position-label' }, card.position),
              React.createElement(TarotCard, {
                card, index: i, onFlip: handleFlip,
                isFlipped: !!flippedCards[`${activeTab}-${i}`]
              })
            )
          )
        ),

        // Flip all button
        !allFlipped && React.createElement('button', {
          className: 'flip-all-btn',
          onClick: handleFlipAll
        }, '✨ Открыть все карты'),

        // Refresh
        React.createElement('button', { className: 'refresh-btn', onClick: handleRefresh },
          '🔄 Новый расклад'
        ),

        // Share
        allFlipped && React.createElement('button', { className: 'share-btn', onClick: handleShare },
          '📤 Поделиться раскладом'
        )
      ),

      // Interpretation
      allFlipped && React.createElement('div', { className: 'reading-section', key: currentSpread.key + '-reading' },
        // Individual card meanings
        currentSpread.cards.map((card, i) =>
          React.createElement('div', { key: i, className: 'reading-card fade-in', style: { animationDelay: `${i * 0.08}s` } },
            React.createElement('h3', null,
              card.icon + ' ' + card.position,
              card.reversed && React.createElement('span', { className: 'reversed-badge' }, 'ПЕРЕВЁРНУТАЯ')
            ),
            React.createElement('div', { className: 'card-meaning' },
              React.createElement('span', { className: 'emoji' }, card.icon),
              React.createElement('div', { className: 'info' },
                React.createElement('h4', null, card.name + (card.suit ? ` (${card.suit})` : '')),
                React.createElement('p', null, card.reversed ? card.rev : card.meaning)
              )
            )
          )
        ),

        // Summary
        interpretation && React.createElement('div', { className: 'summary-box fade-in' },
          React.createElement('h3', null, '🔮 Общий прогноз'),
          React.createElement('p', null, interpretation)
        ),

        // Advice
        advice && React.createElement('div', { className: 'advice-box fade-in' },
          React.createElement('h3', null, '✨ Совет карт'),
          React.createElement('p', null, advice)
        )
      ),

      // Footer
      React.createElement('div', { className: 'info-footer' },
        '🌙 Таро Мистик — бесплатные расклады\nРасклады обновляются автоматически.\nДень — в 00:00, Неделя — по понедельникам, Месяц — 1-го числа.'
      )
    );
  }

  // Mount
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
