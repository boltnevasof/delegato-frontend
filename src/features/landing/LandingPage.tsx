import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import './landing.css'

const JOBS = [
  { id: '01', time: '5-8 ч/нед', title: 'Расписание и встречи', desc: 'Согласует встречи, создаёт/переносит события, отправляет напоминания и подтверждения.', cls: 'l-job-a' },
  { id: '02', time: '8-10 ч/нед', title: 'Обработка входящих', desc: 'Сортирует поток, отвечает на типовые сообщения, эскалирует только важное.', cls: 'l-job-b' },
  { id: '03', time: '3-5 ч/нед', title: 'Ресёрч и отчёты', desc: 'Ищет поставщиков, цены и конкурентов, отдаёт результат в чат, PDF или таблицу.', cls: 'l-job-c' },
  { id: '04', time: 'без пропусков', title: 'Внешняя память', desc: 'Следит за дедлайнами, звонками, счетами и критичными задачами без ручного трекинга.', cls: 'l-job-d' },
  { id: '05', time: '+конверсия', title: 'Ответы клиентам', desc: 'FAQ-ответы, запись на услуги, напоминания и передача нестандарта владельцу.', cls: 'l-job-e' },
  { id: '06', time: '2-3 ч/нед', title: 'Метрики бизнеса', desc: 'Собирает данные из CRM/Sheets, считает динамику и алертит об отклонениях.', cls: 'l-job-f' },
]

const CASES = [
  { title: 'Салон красоты, Алматы', desc: 'Автоответы в WhatsApp и напоминания о записи.', result: '-32% потерянных лидов за 6 недель' },
  { title: 'Маркетинговое агентство, Минск', desc: 'Сортировка входящих + утренний брифинг владельцу.', result: '+21 ч/мес освобождённого времени' },
  { title: 'Онлайн-школа, Москва', desc: 'FAQ-ответы в Telegram и контроль оплат.', result: '+18% к оплатам за месяц' },
]

const TARIFFS = [
  {
    name: 'Start',
    price: '19 900 ₽',
    features: ['1 агент', 'Telegram + Calendar', 'Core jobs 1,2,4', 'Стандартные лимиты'],
    featured: false,
    cta: 'Выбрать',
    ghost: true,
  },
  {
    name: 'Assistant',
    price: '39 900 ₽',
    features: ['До 3 агентов', 'Telegram + WA + Slack', 'Премиум-скиллы + Job 5', 'Приоритетная поддержка'],
    featured: true,
    cta: 'Запустить Assistant',
    ghost: false,
  },
  {
    name: 'Custom / On-Prem',
    price: null,
    features: ['OpenClaw on-prem', 'Интеграции с CRM/ERP', 'Усиленная безопасность', 'Enterprise сопровождение'],
    featured: false,
    cta: 'Обсудить',
    ghost: true,
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const revealRefs = useRef<HTMLElement[]>([])

  const addRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }, [])

  // IntersectionObserver for reveal animations
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
      { threshold: 0.16 },
    )

    revealRefs.current.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index * 30, 240)}ms`
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Track scroll to toggle header style
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleCta() {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  function scrollTo(id: string) {
    setMenuOpen(false)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />

      {/* Header */}
      <header className={`l-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="l-container l-nav-wrap">
          <a className="l-logo" href="#landing-home" onClick={(e) => { e.preventDefault(); scrollTo('landing-home') }}>
            Delegato
          </a>
          <button
            className="l-menu-toggle"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <nav className={`l-nav ${menuOpen ? 'open' : ''}`}>
            <a href="#landing-features" onClick={(e) => { e.preventDefault(); scrollTo('landing-features') }}>
              Возможности
            </a>
            <a href="#landing-cases" onClick={(e) => { e.preventDefault(); scrollTo('landing-cases') }}>
              Кейсы
            </a>
            <a href="#landing-pricing" onClick={(e) => { e.preventDefault(); scrollTo('landing-pricing') }}>
              Тарифы
            </a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="l-avatar" title="Личный кабинет">
                <span className="l-avatar-icon" aria-hidden="true">
                  <span className="l-avatar-head" />
                  <span className="l-avatar-body" />
                </span>
              </Link>
            ) : (
              <button className="l-btn l-btn-sm" onClick={handleCta}>
                Запустить
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="l-hero" id="landing-home">
          <div className="l-container l-reveal" ref={addRevealRef}>
            <div className="l-hero-head">
              <div className="l-hero-head-left">
                <h1>Делегируйте рутину бизнеса<br />с персональным AI-агентом</h1>
              </div>
              <div className="l-hero-head-right">
                <p>Delegato автоматизирует встречи, входящие сообщения, напоминания и рутину в Telegram, WhatsApp и Slack — без терминала и сложной настройки.</p>
              </div>
            </div>
          </div>

          <div className="l-container l-hero-video-wrap l-reveal" ref={addRevealRef}>
            <div className="l-hero-video-placeholder" role="img" aria-label="Место для демо видео">
              <button className="l-play-btn" aria-label="Запустить демо">▶</button>
              <p>Место для демо видео</p>
            </div>
          </div>
        </section>

        {/* Features / Core Jobs */}
        <section className="l-section" id="landing-features">
          <div className="l-container">
            <div className="l-section-head l-reveal" ref={addRevealRef}>
              <p className="l-kicker">Core Jobs</p>
              <h2>Что Delegato делает уже сейчас</h2>
            </div>

            <div className="l-jobs-board l-reveal" ref={addRevealRef}>
              {JOBS.map((job) => (
                <article key={job.id} className={`l-job-tile ${job.cls}`}>
                  <div className="l-job-meta">
                    <span>{job.id}</span>
                    <small>{job.time}</small>
                  </div>
                  <h3>{job.title}</h3>
                  <p>{job.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Cases */}
        <section className="l-section" id="landing-cases">
          <div className="l-container">
            <div className="l-section-head l-reveal" ref={addRevealRef}>
              <p className="l-kicker">Кейсы</p>
              <h2>Где бизнес уже экономит время и деньги</h2>
            </div>
            <div className="l-cases-grid">
              {CASES.map((c) => (
                <article key={c.title} className="l-case l-reveal" ref={addRevealRef}>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <strong>{c.result}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="l-section" id="landing-pricing">
          <div className="l-container">
            <div className="l-section-head l-reveal" ref={addRevealRef}>
              <p className="l-kicker">Тарифы</p>
              <h2>Три уровня внедрения Delegato</h2>
            </div>
            <div className="l-pricing-grid">
              {TARIFFS.map((t) => (
                <article
                  key={t.name}
                  className={`l-price-card l-reveal ${t.featured ? 'l-featured' : ''}`}
                  ref={addRevealRef}
                >
                  {t.featured && <p className="l-chip">Популярный</p>}
                  <h3>{t.name}</h3>
                  {t.price && <p className="l-price">{t.price}<span>/мес</span></p>}
                  <ul>
                    {t.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`l-btn ${t.ghost ? 'l-btn-ghost' : ''}`}
                    onClick={handleCta}
                  >
                    {isAuthenticated ? 'Личный кабинет' : t.cta}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="l-section l-cta" id="landing-contact">
          <div className="l-container l-cta-inner l-reveal" ref={addRevealRef}>
            <h2>Запустим первого агента за 1 день</h2>
            <p>Оставьте заявку — подготовим конфигурацию под ваш бизнес и каналы.</p>
            <button className="l-btn" onClick={handleCta}>
              {isAuthenticated ? 'Перейти в дашборд' : 'Запросить демо'}
            </button>
          </div>
        </section>
      </main>

      <footer className="l-footer">
        <div className="l-container l-footer-wrap">
          <p>© 2026 Delegato</p>
          <div>
            <a href="#">Политика</a>
            <a href="#">Контакты</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
