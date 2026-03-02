# Delegato Frontend

Фронтенд-приложение платформы **Delegato** — сервиса для делегирования бизнес-рутины персональному AI-агенту. Агент автоматизирует встречи, входящие сообщения, напоминания и другие задачи через Telegram, WhatsApp и Slack.

## Стек технологий

- **React 19** + **TypeScript 5.9**
- **Vite 7** — сборка и dev-сервер
- **react-router-dom 7** — маршрутизация (lazy loading)
- **TanStack Query v5** — серверное состояние и кэширование
- **react-hook-form** — формы и валидация
- **openapi-typescript** — генерация типов из OpenAPI-спецификации
- **nginx:alpine** — продакшн-сервер (Docker)

## Структура проекта

```
src/
  api/              # HTTP-клиент, модули API, сгенерированные типы
    generated/      # Типы из OpenAPI-спецификации
  app/              # Провайдеры, роутер, точка входа
  features/         # Функциональные модули
    agent/          # Редакторы SOUL.md и AGENT.md
    auth/           # Авторизация (email OTP, Google OAuth)
    billing/        # Подписка, тарифы, история платежей
    channels/       # Каналы связи (Telegram, WhatsApp, Email)
    dashboard/      # Главная панель управления
    landing/        # Лендинг
    onboarding/     # Пошаговый онбординг (5 шагов)
    pricing/        # Страница тарифов
    skills/         # Маркетплейс навыков агента
    support/        # Форма обратной связи
    tools/          # Каталог инструментов
  shared/
    hooks/          # useAuth, useApiError, useAsyncTask
    layouts/        # DashboardLayout, AuthLayout, OnboardingLayout
    styles/         # CSS-переменные (variables.css), глобальные стили
    ui/             # Переиспользуемые компоненты (Button, Card, Modal, Spinner и др.)
```

## Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (http://localhost:5173)
npm run dev
```

### Docker

```bash
# Скопировать переменные окружения
cp .env.example .env

# Сборка и запуск (http://localhost)
docker compose up --build -d

# Остановка
docker compose down
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_BASE_URL` | Базовый URL бэкенд-API | `http://localhost:8000/api/v1` |
| `VITE_TELEGRAM_BOT_NAME` | Имя Telegram-бота для подключения канала | — |

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер с HMR |
| `npm run build` | Сборка для продакшена (`tsc` + `vite build`) |
| `npm run preview` | Предпросмотр продакшен-сборки |
| `npm run gen:types` | Генерация TypeScript-типов из OpenAPI-спецификации |

## Основные страницы

| Маршрут | Страница |
|---|---|
| `/` | Лендинг |
| `/auth` | Авторизация |
| `/onboarding/*` | Онбординг нового пользователя |
| `/dashboard` | Панель управления агентом |
| `/agent/personality` | Редактор личности (SOUL.md) |
| `/agent/rules` | Редактор правил (AGENT.md) |
| `/agent/skills` | Маркетплейс навыков |
| `/agent/tools` | Каталог инструментов |
| `/agent/channel` | Каналы связи |
| `/billing` | Подписка и тарифы |
| `/support` | Обратная связь |
