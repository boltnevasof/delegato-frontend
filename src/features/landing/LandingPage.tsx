import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './landing.css'

const CASES = [
  {
    id: 'case-1',
    title: 'Фитнес-клуб, Казань',
    desc: 'Записывает клиентов через чат-бота, рассылает напоминания за день и за час, отвечает на вопросы о ценах и расписании, собирает обратную связь. Каждое утро — сводка администратору: кто записан, кто отменил, какие слоты свободны.',
    result: '-32%',
    resultLabel: 'потерянных записей',
    modalAbout: 'Индивидуальные тренировки, групповые занятия, оздоровительные процедуры. Общение с клиентами в Telegram.',
    modalItems: [
      'Записывает клиентов на тренировки и процедуры через чат-бота — проверяет расписание, подтверждает запись',
      'Рассылает напоминания за день и за час до занятия',
      'Отвечает на типовые вопросы: цены, расписание, свободные слоты, адрес',
      'Собирает обратную связь после посещения',
      'Каждое утро отправляет администратору сводку: кто записан, кто отменил, какие слоты свободны',
    ],
  },
  {
    id: 'case-2',
    title: 'WB-селлер, товарный бизнес',
    desc: 'Парсит остатки на складе и сигналит когда пора закупать, пересчитывает маржинальность при изменении цен, мониторит конкурентов на WB, собирает отзывы и готовит черновики ответов. Еженедельная сводка по выручке и динамике.',
    result: '+12',
    resultLabel: 'ч/нед без ручных таблиц',
    modalAbout: 'Один владелец, 50+ SKU на Wildberries. Закупки, остатки, юнит-экономика в таблицах.',
    modalItems: [
      'Каждое утро парсит таблицу остатков — считает на сколько дней хватит по каждому SKU и сигналит, когда пора закупать',
      'Следит за себестоимостью: при изменении цен у поставщика пересчитывает маржинальность и пингует если она упала ниже порога',
      'Мониторит карточки конкурентов на WB — изменения цен, новые товары, обновления описаний. Еженедельный отчёт',
      'Собирает новые отзывы — алерт на негатив, черновик ответа',
      'Еженедельная сводка: выручка по SKU, динамика остатков, маржинальность по категориям',
    ],
  },
  {
    id: 'case-3',
    title: 'Рекламное агентство, удалёнка',
    desc: 'Каждое утро собирает просроченные задачи из Notion, за 2 дня до сдачи проверяет статусы, анализирует переписки с клиентами и ловит невыполненные обещания. Считает загрузку команды и готовит ежемесячный отчёт по клиентам.',
    result: '+21',
    resultLabel: 'ч/мес освобождённого времени',
    modalAbout: 'Основатель, 2 дизайнера, копирайтер. 10–15 клиентов одновременно, задачи в Notion, переписки в Telegram.',
    modalItems: [
      'Каждое утро собирает из Notion просроченные задачи и задачи без исполнителя — пингует в общий чат',
      'За 2 дня до сдачи проверяет статус задач и сигналит если что-то не в работе',
      'Анализирует переписки с клиентами — формирует список невыполненных обещаний',
      'Считает загрузку команды: сколько задач на каждом, кто перегружен, у кого есть слоты',
      'Раз в месяц — отчёт по клиентам: задачи выполнены, средняя скорость, количество правок',
    ],
  },
  {
    id: 'case-4',
    title: 'Онлайн-школа английского',
    desc: 'Следит за оплатами и пингует по просрочкам, считает загрузку преподавателей, ведёт журнал посещений по голосовым сообщениям. Еженедельная сводка по выручке и оттоку. Генерирует контент для Telegram-канала школы.',
    result: '+18%',
    resultLabel: 'к продлениям за месяц',
    modalAbout: 'Основатель и 3 преподавателя. 80+ учеников, уроки через Zoom, расписание в Google Calendar, оплата через сайт.',
    modalItems: [
      'Следит за оплатами: парсит данные с сайта, пингует если ученик не оплатил следующий пакет',
      'Считает загрузку преподавателей: часы, количество учеников, процент отмен',
      'Ведёт журнал посещений в Google Sheets — преподаватель скидывает голосовое, агент заносит тему и присутствующих',
      'Еженедельная сводка: выручка, продления, отток, загрузка, пустующие слоты',
      'Генерирует контент для Telegram-канала школы на основе тем прошедших уроков',
    ],
  },
]

export function LandingPage() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const revealRefs = useRef<HTMLElement[]>([])

  const addRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }, [])

  // Scroll to hash anchor on navigation (e.g. from /features → /#cases)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [location.hash])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    revealRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveModal(null)
    }
    if (activeModal) {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeModal])

  function scrollTo(id: string) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeCase = CASES.find((c) => c.id === activeModal)

  return (
    <div className="lp">
      {/* Header */}
      <header className={`lp-header${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-wrap lp-header-inner">
          <a className="lp-logo" href="#home" onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            Delegato
          </a>

          <nav className={`lp-nav${menuOpen ? ' open' : ''}`}>
            <Link to="/features">Возможности</Link>
            <a href="#cases" onClick={(e) => { e.preventDefault(); scrollTo('cases') }}>Кейсы</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}>Тарифы</a>
            <a className="lp-btn lp-btn-main" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Запустить</a>
          </nav>

          <button
            className={`lp-burger${menuOpen ? ' active' : ''}`}
            aria-label="Открыть меню"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="home" className="lp-wrap lp-hero">
          <div className="lp-hero-left fade-in" ref={addRevealRef}>
            <h1>
              <span>ИИ-агент</span>, который{' '}
              <br />
              сэкономит бизнесу{' '}
              <br />
              <span>2–3 часа в день</span>
            </h1>

            <p>
              Telegram, почта, счета, напоминания, поиск —{' '}
              <br />
              агент делает сам, вы подключаетесь{' '}
              <br />
              когда нужны.
            </p>

            <a className="lp-about" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">
              <span>▶</span>
              О нашем сервисе
            </a>
          </div>

          <div className="lp-hero-right" aria-label="Демо область">
            <img className="lp-hero-right-image" src="/hero.png" alt="Delegato hero visual" />
          </div>
        </section>

        {/* Core Jobs */}
        <section id="jobs" className="lp-wrap lp-section">
          <p className="lp-kicker">Core Jobs</p>
          <h2>
            Что Delegato <span>делает</span><br />
            <span>уже сейчас</span>
          </h2>

          <div className="lp-jobs-layout fade-in" ref={addRevealRef}>
            <div className="lp-jobs-left">
              <article className="lp-card lp-job job-01">
                <div className="lp-job-meta"><b>01</b><small>каждый день</small></div>
                <h3>Утренний и вечерний дайджест</h3>
                <p>Утром — события из календаря, срочные письма, саммари непрочитанных сообщений в Telegram. Вечером — что сделано, что осталось, завтрашние встречи и дедлайны.</p>
              </article>

              <article className="lp-card lp-job job-04">
                <div className="lp-job-meta"><b>04</b><small>hands-free</small></div>
                <h3>Работа с голосом</h3>
                <p>Распознаёт голосовые сообщения и выполняет задачи на их основе — как если бы вы написали текстом.</p>
              </article>
            </div>

            <article className="lp-card lp-job job-02 blue">
              <div className="lp-job-meta"><b>02</b><small>всё в одном</small></div>
              <h3>Google Workspace</h3>
              <p>Почта, календарь, документы, таблицы, диск — в одном агенте. Разбирает и категоризирует письма, создаёт встречи, формирует отчёты в Sheets и Docs прямо в вашем облаке.</p>
            </article>

            <div className="lp-jobs-right">
              <article className="lp-card lp-job job-03">
                <div className="lp-job-meta"><b>03</b><small>автопилот</small></div>
                <h3>Контент и соцсети</h3>
                <p>Пишет и публикует посты в соцсети и Telegram-каналы по расписанию или по запросу. Ресёрчит тему, адаптирует тон под площадку.</p>
              </article>

              <div className="lp-jobs-right-bottom">
                <article className="lp-card lp-job job-05">
                  <div className="lp-job-meta"><b>05</b><small>без парсеров</small></div>
                  <h3>Работа с браузером</h3>
                  <p>Заполняет формы, собирает данные с сайтов, мониторит конкурентов. Что раньше требовало сложных парсеров — теперь делает ИИ-агент.</p>
                </article>

                <article className="lp-card lp-job job-06 deep">
                  <div className="lp-job-meta"><b>06</b><small>как ChatGPT</small></div>
                  <h3>Умный ассистент</h3>
                  <p>Генерация текстов, анализ документов, расчёты, переводы, мозговой штурм — всё, для чего предприниматели используют ChatGPT, но прямо в вашем рабочем чате.</p>
                </article>
              </div>
            </div>
          </div>

          <div className="lp-jobs-cta fade-in" ref={addRevealRef}>
            <Link className="lp-btn lp-btn-outline lp-btn-lg" to="/features">Смотреть все возможности</Link>
          </div>
        </section>

        {/* Cases */}
        <section id="cases" className="lp-wrap lp-section">
          <p className="lp-kicker">Кейсы</p>
          <h2>
            Где бизнес уже <span>экономит</span><br />
            <span>время и деньги</span>
          </h2>

          <div className="lp-cases-grid">
            {CASES.map((c) => (
              <article
                key={c.id}
                className="lp-card lp-case fade-in"
                ref={addRevealRef}
                onClick={() => setActiveModal(c.id)}
              >
                <h3>{c.title}</h3>
                <p className="lp-case-desc">{c.desc}</p>
                <div className="lp-case-result">
                  <strong>{c.result}</strong>
                  <span>{c.resultLabel}</span>
                </div>
                <button className="lp-case-more">Подробнее</button>
              </article>
            ))}
          </div>

          {/* Modal */}
          <div
            className={`lp-modal-overlay${activeModal ? ' open' : ''}`}
            onClick={() => setActiveModal(null)}
          >
            <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
              <button className="lp-modal-close" aria-label="Закрыть" onClick={() => setActiveModal(null)}>
                &times;
              </button>
              {activeCase && (
                <div className="lp-modal-body">
                  <h3>{activeCase.title}</h3>
                  <p className="lp-modal-about">{activeCase.modalAbout}</p>
                  <h4>Что делает агент:</h4>
                  <ul>
                    {activeCase.modalItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="lp-wrap lp-section">
          <p className="lp-kicker">Тарифы</p>
          <h2>
            Три уровня<br />
            <span>внедрения Delegato</span>
          </h2>

          <div className="lp-pricing-grid fade-in" ref={addRevealRef}>
            <article className="lp-card lp-plan">
              <h3>Базовый</h3>
              <p className="lp-price">4 590 ₽/мес</p>
              <ul>
                <li>Умный ассистент — вопросы, переводы, расчёты</li>
                <li>Работа с Google Workspace — Drive, Calendar, Gmail</li>
                <li>Утренний и вечерний дайджест</li>
                <li>Разбор и категоризация почты</li>
                <li>Напоминания и повторяющиеся задачи</li>
                <li>Распознавание голосовых сообщений</li>
                <li>Работа с таск-трекерами</li>
                <li>Отправка сообщений в Telegram-чаты и каналы</li>
                <li>База знаний — сохраняет заметки, ссылки, идеи и находит по смыслу</li>
              </ul>
              <a className="lp-btn lp-btn-outline" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Выбрать</a>
            </article>

            <article className="lp-card lp-plan featured">
              <p className="lp-badge">Популярный</p>
              <h3>Ассистент</h3>
              <p className="lp-price">9 990 ₽/мес</p>
              <p className="lp-plan-includes">Всё из «Базового», плюс:</p>
              <ul>
                <li>Работа в браузере — заполнение форм, сбор данных, мониторинг конкурентов</li>
                <li>Работа с договорами, презентациями, КП</li>
                <li>Генерация и публикация контента в соцсети</li>
                <li>Черновики и ответы на письма</li>
                <li>Трекинг доставок и заказов</li>
                <li>Полная мощность модели: сложные рассуждения, длинные документы, качественные тексты</li>
              </ul>
              <a className="lp-btn lp-btn-main" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Запустить Ассистент</a>
            </article>

            <article className="lp-card lp-plan">
              <h3>Кастом</h3>
              <p className="lp-price">от 30 000 ₽/мес</p>
              <ul>
                <li>Выбор модели под задачи (GPT, Claude, комбинация)</li>
                <li>Настройка агента под процессы, скрипты, шаблоны клиента</li>
                <li>Подключение специфических сервисов</li>
                <li>Обучение агента под конкретные сайты и интерфейсы</li>
                <li>Выделенная поддержка</li>
              </ul>
              <a className="lp-btn lp-btn-outline" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Обсудить</a>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="lp-wrap lp-cta" id="cta">
          <div className="lp-cta-copy">
            <h2>Попробуйте бесплатно</h2>
            <p>Протестируйте агента на своих задачах без оплаты. Убедитесь, что он полезен - и только потом выбирайте тариф.</p>
            <a className="lp-btn lp-btn-main" href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Начать бесплатно</a>
          </div>
          <div className="lp-cta-art" aria-hidden="true" />
        </section>
      </main>

      <footer className="lp-wrap lp-footer">
        <span>&copy; 2026 Delegato</span>
        <div>
          <a href="#">Политика</a>
          <a href="https://t.me/alex_delegato" target="_blank" rel="noopener noreferrer">Контакты</a>
        </div>
      </footer>
    </div>
  )
}
