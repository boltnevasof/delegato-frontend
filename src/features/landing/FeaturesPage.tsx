import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './landing.css'

const FEATURES = [
  {
    title: 'Утренний и вечерний дайджест',
    subtitle: 'AI собирает всё важное за вас',
    desc: 'Каждое утро агент присылает короткий дайджест: встречи, письма, сообщения и важные события дня. Вечером — подводит итоги и напоминает о задачах на завтра.',
    skillsLabel: 'Что делает:',
    skills: [
      { icon: 'calendar', text: 'Собирает встречи из календаря' },
      { icon: 'mail', text: 'Выделяет важные письма' },
      { icon: 'chat', text: 'Делает саммари сообщений Telegram' },
      { icon: 'list', text: 'Показывает задачи и дедлайны' },
    ],
    image: '/landing/features/digest.png',
    cols: 4,
  },
  {
    title: 'Работа со встречами',
    subtitle: 'Создает и управляет встречами',
    desc: 'Просто напишите агенту сообщение — и он создаст событие, отправит приглашения и при необходимости перенесёт встречу.',
    skillsLabel: 'Что умеет:',
    skills: [
      { icon: 'calendar', text: 'Создает события в Google Calendar' },
      { icon: 'user-plus', text: 'Приглашает участников' },
      { icon: 'refresh', text: 'Переносит встречи' },
      { icon: 'bell', text: 'Напоминает о созвонах' },
    ],
    image: '/landing/features/meetings.png',
    cols: 4,
  },
  {
    title: 'Умная работа с почтой',
    subtitle: 'Письма больше не теряются',
    desc: 'Агент анализирует входящие письма и выделяет самое важное.',
    skillsLabel: 'Что делает:',
    skills: [
      { icon: 'search', text: 'Сканирует новые письма' },
      { icon: 'filter', text: 'categories', isCategories: true },
      { icon: 'message', text: 'Делает краткое саммари длинных писем' },
      { icon: 'edit', text: 'Может подготовить ответ' },
    ],
    image: '/landing/features/email.png',
    cols: 4,
  },
  {
    title: 'Работа с Telegram и др. мессенджерами',
    subtitle: 'Управляет чатами и каналами',
    desc: 'Агент работает в самых популярных мессенджерах — Telegram, WhatsApp, Slack. Читает сообщения, делает сводки и отвечает клиентам.',
    skillsLabel: 'Что умеет:',
    skills: [
      { icon: 'message', text: 'Саммари непрочитанных сообщений' },
      { icon: 'edit', text: 'Отправка сообщений в чаты' },
      { icon: 'doc', text: 'Публикации в каналы' },
      { icon: 'chevrons', text: 'Быстрые ответы клиентам' },
    ],
    image: '/landing/features/telegram.png',
    cols: 4,
  },
  {
    title: 'Голосовые команды',
    subtitle: 'Просто скажите, что нужно сделать',
    desc: 'Отправьте голосовое сообщение — агент распознает его и выполнит задачу.',
    skillsLabel: 'Примеры',
    skills: [
      { icon: 'clock', text: 'Создать задачу' },
      { icon: 'calendar', text: 'Добавить встречу' },
      { icon: 'edit', text: 'Отправить сообщение' },
    ],
    image: '/landing/features/voice.png',
    cols: 3,
  },
  {
    title: 'Отложенные задачи',
    subtitle: 'Напоминания и регулярные действия',
    desc: 'Агент может выполнять задачи через заданное время или по расписанию без вашего участия.',
    skillsLabel: 'Примеры',
    skills: [
      { icon: 'bell', text: 'Напомнить отправить документ' },
      { icon: 'calendar', text: 'Создать еженедельную встречу' },
      { icon: 'edit', text: 'Отправить отчёт по расписанию' },
    ],
    image: '/landing/features/delayed.png',
    cols: 3,
  },
  {
    title: 'Работа с сайтами',
    subtitle: 'Автоматизация действий в браузере',
    desc: 'Агент может взаимодействовать с сайтами: заполнять формы, проверять данные и собирать информацию.',
    skillsLabel: 'Что умеет:',
    skills: [
      { icon: 'message', text: 'Заполнять формы' },
      { icon: 'file', text: 'Собирать данные с сайтов' },
      { icon: 'doc', text: 'Проверять цены' },
      { icon: 'search', text: 'Отслеживать изменения' },
    ],
    image: '/landing/features/websites.png',
    cols: 4,
  },
  {
    title: 'Работа с документами и презентациями',
    subtitle: 'Понимает и создаёт документы',
    desc: 'Агент работает с договорами, составляет КП и презентации. Читает и анализирует ваши документы, сохраняет шаблоны в памяти — и по ним готовит новые договоры, письма и отчёты.',
    skillsLabel: 'Что умеет:',
    skills: [
      { icon: 'file', text: 'Составляет договоры и КП по шаблонам' },
      { icon: 'search', text: 'Анализирует PDF, счета и договоры' },
      { icon: 'monitor', text: 'Готовит презентации и отчёты' },
    ],
    image: '/landing/features/documents.png',
    cols: 3,
  },
  {
    title: 'Google Drive',
    subtitle: 'Работает с файлами в облаке',
    desc: 'Агент может создавать документы, заполнять таблицы и находить файлы.',
    skillsLabel: 'Функции',
    skills: [
      { icon: 'plus-circle', text: 'Создание Google Docs' },
      { icon: 'grid', text: 'Работа с таблицами' },
      { icon: 'search', text: 'Поиск файлов' },
    ],
    image: '/landing/features/gdrive.png',
    cols: 3,
  },
  {
    title: 'Контент и соцсети',
    subtitle: 'Помогает вести соцсети',
    desc: 'Агент может готовить посты и публиковать их по расписанию.',
    skillsLabel: 'Что делает',
    skills: [
      { icon: 'doc', text: 'Пишет тексты' },
      { icon: 'search', text: 'Ресёрчит темы' },
      { icon: 'plus-circle', text: 'Публикует посты' },
    ],
    image: '/landing/features/content.png',
    cols: 3,
  },
  {
    title: 'Второй мозг',
    subtitle: 'Хранит и находит ваши знания',
    desc: 'Все ссылки, заметки и идеи сохраняются и легко находятся по смыслу.',
    skillsLabel: 'Что сохраняет',
    skills: [
      { icon: 'file', text: 'Заметки' },
      { icon: 'link', text: 'Ссылки' },
      { icon: 'pin', text: 'Идеи' },
      { icon: 'mic', text: 'Голосовые' },
    ],
    image: '/landing/features/brain.png',
    cols: 4,
  },
  {
    title: 'Отслеживание заказов',
    subtitle: 'Следит за доставками',
    desc: 'Агент отслеживает посылки и сообщает о смене статуса.',
    skillsLabel: 'Что делает',
    skills: [
      { icon: 'search', text: 'Находит трек-номера' },
      { icon: 'info', text: 'Проверяет статус' },
      { icon: 'bell', text: 'Присылает уведомления' },
    ],
    image: '/landing/features/tracking.png',
    cols: 3,
  },
  {
    title: 'Интеграции с таск-трекерами',
    subtitle: 'Работает с задачами',
    desc: 'Агент управляет задачами в популярных системах.',
    skillsLabel: 'Интеграции',
    skills: [
      { icon: 'notion', text: 'Notion', isImg: true },
      { icon: 'trello', text: 'Trello', isImg: true },
      { icon: 'jira', text: 'Jira', isImg: true },
      { icon: 'linear', text: 'Linear', isImg: true },
      { icon: 'google-tasks', text: 'Google Tasks', isImg: true },
    ],
    image: '/landing/features/trackers.png',
    cols: 5,
  },
  {
    title: 'Умный ассистент',
    subtitle: 'Просто задавайте вопросы',
    desc: 'Агент может объяснить, перевести текст, помочь с расчетами или найти информацию.',
    skillsLabel: 'Примеры',
    skills: [
      { icon: 'refresh', text: 'Перевести текст' },
      { icon: 'doc', text: 'Написать письмо' },
      { icon: 'list', text: 'Объяснить тему' },
    ],
    image: '/landing/features/assistant.png',
    cols: 3,
  },
]

const SVG_ICONS: Record<string, React.ReactNode> = {
  calendar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  mail: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,7 12,13 2,7"/></svg>,
  chat: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 15.2c.5-1 .8-2.1.8-3.2 0-4.4-4-8-9-8s-9 3.6-9 8c0 4.4 4 8 9 8 1.1 0 2.1-.2 3.1-.5L21 21l.2-5.8z"/></svg>,
  list: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  'user-plus': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  refresh: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  bell: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  filter: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  message: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/></svg>,
  edit: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  doc: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  chevrons: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  clock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="15" y2="15"/></svg>,
  file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  monitor: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  'plus-circle': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  grid: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  link: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  pin: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  mic: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  info: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

export function FeaturesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp">
      {/* Header */}
      <header className={`lp-header${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-wrap lp-header-inner">
          <Link className="lp-logo" to="/">Delegato</Link>

          <nav className={`lp-nav${menuOpen ? ' open' : ''}`}>
            <Link to="/features" className="active">Возможности</Link>
            <Link to="/#cases">Кейсы</Link>
            <Link to="/#pricing">Тарифы</Link>
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
        <section className="lp-wrap lp-section feat-hero">
          <p className="lp-kicker">Core Jobs</p>
          <h2>Что Delegato <span>делает</span><br /><span>уже сейчас</span></h2>
        </section>

        {/* Feature Blocks */}
        {FEATURES.map((feat, index) => {
          const isReverse = index % 2 === 1
          const colsClass = feat.cols === 3 ? ' feat-skills-3' : feat.cols === 5 ? ' feat-skills-5' : ''

          return (
            <section key={index} className={`feat-block${isReverse ? ' feat-block-reverse' : ''}`}>
              <div className="lp-wrap feat-block-inner">
                <div className="feat-content">
                  <h3>{feat.title}</h3>
                  <p className="feat-subtitle">{feat.subtitle}</p>
                  <p className="feat-desc">{feat.desc}</p>
                  <p className="feat-skills-label">{feat.skillsLabel}</p>
                  <div className={`feat-skills${colsClass}`}>
                    {feat.skills.map((skill, si) => (
                      <div className="feat-skill" key={si}>
                        {'isImg' in skill && skill.isImg ? (
                          <img src={`/landing/icons/${skill.icon}.svg`} alt={skill.text} width="24" height="24" />
                        ) : (
                          SVG_ICONS[skill.icon] || null
                        )}
                        {'isCategories' in skill && skill.isCategories ? (
                          <span>
                            Делит на категории:<br />
                            <span className="feat-tag blue">Срочное</span>
                            <span className="feat-tag orange">Рассылки</span>
                            <span className="feat-tag red">Спам</span>
                          </span>
                        ) : (
                          <span>{skill.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="feat-illustration">
                  <img src={feat.image} alt={feat.title} />
                </div>
              </div>
            </section>
          )
        })}

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
