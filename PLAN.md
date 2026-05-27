# План проекта: Calendar Booking (аналог cal.com)

## Стек

| Компонент | Технология |
|-----------|------------|
| Frontend | Angular 18+ |
| Mock-сервер | Stoplight Prism (из OpenAPI) |
| Backend | NestJS |
| ORM | Prisma |
| БД | PostgreSQL |

| Спецификация | TypeSpec → OpenAPI |

## Порядок работ

Фронтенд разрабатывается и тестируется **до** бэкенда — через Prism (mock-сервер), запущенный из OpenAPI-спецификации. Когда бэкенд готов, фронт просто переключается на реальный API без изменений кода.

```
TypeSpec → OpenAPI → Prism (mock) → Angular (фронт)
                  ↘ NestJS (реальный бэк) → замена Prism
```

---

## Этап 0: Инициализация проектов

- [x] Создать backend:
  ```bash
  nest new backend --skip-git --package-manager npm
  ```
- [x] Создать frontend:
  ```bash
  ng new frontend --routing --style css --skip-git
  ```
- [x] Установить Prisma в backend:
  ```bash
  cd backend && npm install prisma @prisma/client
  ```
- [x] Проверить сборку frontend:
  ```bash
  cd frontend && ng build
  ```

---

## Этап 1: TypeSpec → OpenAPI → Prism

- [x] Установить TypeSpec CLI:
  ```bash
  npm install -D @typespec/compiler @typespec/http @typespec/rest @typespec/openapi3
  ```
- [x] Создать `specs/calendar.tsp` (уже готов)
- [x] Скомпилировать TypeSpec в OpenAPI 3.0:
  ```bash
  npx tsp compile specs/calendar.tsp --output-dir specs/generated
  ```
- [x] Установить Prism:
  ```bash
  npm install -D @stoplight/prism-cli
  ```
- [x] Создать npm-скрипт для запуска mock-сервера:
  ```json
  "scripts": {
    "mock": "prism mock specs/generated/openapi.yaml --port 4010"
  }
  ```
- [x] Проверить, что Prism отвечает:
  ```bash
  curl http://localhost:4010/api/event-types
  # → [{ id: "…", title: "…", description: "…", duration: 30 }]
  ```

---

## Этап 2: Angular — сервисы и модели (по OpenAPI)

- [ ] Сгенерировать TypeScript-типы из OpenAPI (или написать вручную):
  - `EventType` — `id`, `title`, `description`, `duration`
  - `Booking` — `id`, `eventTypeId`, `guestName`, `guestEmail`, `startTime`, `endTime`, `createdAt`
  - `Slot` — `startTime`, `endTime`
  - `CreateEventTypeRequest`, `CreateBookingRequest`
  - `ConflictError`, `NotFoundError`, `ValidationError`
- [ ] Создать `ApiService` — обёртка над `HttpClient`:
  - Базовый URL: `http://localhost:4010/api` (переключаемый)
  - Методы: `get`, `post`, `patch`, `delete`
- [ ] Создать сервисы:
  - `EventTypesService`
  - `BookingsService`
  - `SlotsService`
- [ ] Настроить маршрутизацию:
  ```typescript
  const routes: Routes = [
    { path: '', component: EventTypesListComponent },
    { path: 'book/:eventTypeId', component: BookingComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'admin/event-types', component: AdminEventTypesComponent },
    { path: 'admin/bookings', component: AdminBookingsComponent },
  ];
  ```
- [ ] Добавить `provideHttpClient()` в `app.config.ts`

---

## Этап 3: Angular — Публичная часть (гость)

- [ ] **`EventTypesListComponent`** — страница со списком типов событий
  - `GET /api/event-types`
  - Карточка: название, описание, длительность
  - Кнопка «Записаться» → переход на `/book/:id`
- [ ] **`BookingComponent`** — страница бронирования
  - Получить `eventType` по `:id`
  - Отобразить календарь на 14 дней
  - При выборе даты → `GET /api/event-types/:id/slots?from=...&to=...`
  - Форма: имя, email, выбор свободного слота
  - `POST /api/bookings`
  - Страница подтверждения / ошибки
- [ ] **Компонент календаря** — кастомный или из библиотеки (например, Angular CDK datepicker или простой грид)

---

## Этап 4: Angular — Админ-панель

- [ ] **`AdminEventTypesComponent`**
  - Таблица типов событий
  - Форма создания (POST /api/event-types)
  - Форма редактирования (PATCH /api/event-types/:id)
  - Кнопка удаления с подтверждением (DELETE /api/event-types/:id)
- [ ] **`AdminBookingsComponent`**
  - `GET /api/bookings` — список всех броней
  - Таблица: дата, время, гость, email, тип события
  - Сортировка по дате
- [ ] **`AdminDashboardComponent`** — навигационная страница админки
  - Ссылки на управление типами и просмотр броней

---

## Этап 5: Интеграция фронтенда с Prism

- [ ] Запустить `prism mock` и `ng serve` (из `frontend/`) одновременно
- [ ] Проверить все сценарии:
  - Список типов событий
  - Создание/редактирование/удаление типа (admin)
  - Выбор слота и создание брони (гость)
  - Получение ошибки 409 при конфликте
  - Получение 404 при несуществующем типе
  - Список броней (admin)
- [ ] Исправить ошибки, если фронт не соответствует контракту

---

## Этап 6: NestJS — Prisma и БД

- [ ] На основе OpenAPI написать `backend/prisma/schema.prisma`:
  ```prisma
  model EventType {
    id          String   @id @default(uuid())
    title       String
    description String
    duration    Int
    bookings    Booking[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }

  model Booking {
    id          String   @id @default(uuid())
    eventTypeId String
    eventType   EventType @relation(fields: [eventTypeId], references: [id])
    guestName   String
    guestEmail  String
    startTime   DateTime
    endTime     DateTime
    createdAt   DateTime @default(now())

    @@index([startTime, endTime])
  }
  ```
- [ ] Создать БД PostgreSQL (локально / Docker)
- [ ] Запустить миграцию:
  ```bash
  cd backend && npx prisma migrate dev --name init
  ```
- [ ] Подключить `PrismaModule` глобально в NestJS

---

## Этап 7: NestJS — Модуль EventTypes

- [ ] Сгенерировать модуль, сервис, контроллер
- [ ] DTO: `CreateEventTypeDto`, `UpdateEventTypeDto`
- [ ] `EventTypesService`:
  - `findAll()` — все типы
  - `findOne(id)` — по id
  - `create(dto)` — создание
  - `update(id, dto)` — обновление
  - `delete(id)` — удаление
- [ ] `EventTypesController`:
  - `GET /api/event-types` → `findAll()`
  - `POST /api/event-types` → `create()`
  - `PATCH /api/event-types/:id` → `update()`
  - `DELETE /api/event-types/:id` → `delete()`
- [ ] Проверить через `curl`

---

## Этап 8: NestJS — Модуль Bookings + Slots

- [ ] Сгенерировать модули/сервисы
- [ ] `BookingsService`:
  - `findAll()` — все будущие брони, сортировка по `startTime`
  - `create(dto)`:
    1. Найти `EventType` → получить `duration`
    2. Вычислить `endTime = startTime + duration`
    3. Проверить: `startTime` в окне [now, now + 14 дней]
    4. Проверить overlap: `startTime < :endTime AND endTime > :startTime`
    5. Создать `Booking`
- [ ] `SlotsService`:
  - `getAvailableSlots(eventTypeId, from, to)`:
    1. Получить `duration` из `EventType`
    2. Получить все брони в диапазоне
    3. Сгенерировать слоты с шагом `duration`
    4. Исключить занятые
- [ ] Контроллеры:
  - `GET /api/bookings` → `findAll()`
  - `POST /api/bookings` → `create()`
  - `GET /api/event-types/:id/slots?from=...&to=...` → `getAvailableSlots()`

---

## Этап 9: Переключение фронта с Prism на реальный бэкенд

- [ ] Добавить в NestJS CORS для `http://localhost:4200`
- [ ] Поменять `baseUrl` в `ApiService` с `http://localhost:4010/api` на `http://localhost:3000/api` (или настроить proxy в Angular)
- [ ] Настроить прокси в Angular (`proxy.conf.json`):
  ```json
  {
    "/api": {
      "target": "http://localhost:3000",
      "secure": false
    }
  }
  ```
- [ ] Запустить оба приложения, проверить полный цикл:
  - Admin: CRUD типов событий
  - Guest: просмотр → выбор слота → бронь
  - Admin: просмотр броней
  - Conflict: запись на занятый слот → 409
- [ ] Удалить Prism из зависимостей (опционально)

---

## Этап 10: Документация и деплой

- [ ] Наполнить БД seed-данными через Prisma Seed
- [ ] Дополнить `README.md`
- [ ] Настроить Docker / docker-compose: `postgres + api + web`
- [ ] Проверить Production сборку:
  ```bash
  cd backend && npm run build
  cd ../frontend && ng build --configuration=production
  ```
- [ ] Написать e2e-тесты (Playwright) — опционально

---

## Итого: оценка этапов

| Этап | Описание | Примерное время |
|------|----------|----------------|
| 0 | Инициализация проектов | 30 мин |
| 1 | TypeSpec → OpenAPI → Prism | 1–2 ч |
| 2 | Angular сервисы и модели | 1–2 ч |
| 3 | Публичная часть (гость) | 3–4 ч |
| 4 | Админ-панель | 2–3 ч |
| 5 | Интеграция фронта с Prism | 1–2 ч |
| 6 | Prisma и БД | 1 ч |
| 7 | NestJS — EventTypes | 1–2 ч |
| 8 | NestJS — Bookings + Slots | 2–3 ч |
| 9 | Переключение на реальный бэк | 1 ч |
| 10 | Документация и деплой | 1–2 ч |
| **Итого** | | **14–22 ч** |
