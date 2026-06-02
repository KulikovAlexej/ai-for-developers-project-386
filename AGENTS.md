## Описание проекта
Calendar Booking — аналог cal.com. Приложение для бронирования событий (встреч) через публичную страницу с выбором свободных слотов и админ-панель для управления.
## Стек
| Компонент      | Технология                         |
| -------------- | ---------------------------------- |
| Frontend       | Angular 21+, standalone components |
| Backend        | NestJS 11                          |
| ORM            | Prisma 5                           |
| БД             | PostgreSQL                         |
| Спецификация   | TypeSpec → OpenAPI 3.0             |
| Стилизация     | Angular Material                   |
| Mock-сервер    | Stoplight Prism                    |
| Тесты (front)  | Vitest 4                           |
| Тесты (back)   | Jest 30 + Supertest                |
| Линтер (back)  | ESLint (flat config) + Prettier    |
| Форматтер      | Prettier (back + front)            |
## Структура проекта
.
├── specs/
│   ├── calendar.tsp                          # TypeSpec-спецификация API
│   └── generated/@typespec/openapi3/         # Скомпилированный OpenAPI
├── backend/
├── frontend/
├── package.json                              # Root: compile + mock
├── PLAN.md                                   # План разработки (10 этапов)
└── README.md
## Команды
### Backend (`backend/`)
| Команда                | Описание                   |
| ---------------------- | -------------------------- |
| `npm run start:dev`    | Запуск в dev-режиме (watch)|
| `npm run build`        | Сборка                     |
| `npm run lint`         | ESLint + Prettier          |
| `npm run format`       | Prettier                   |
| `npm test`             | Юнит-тесты (Jest)          |
| `npm run test:e2e`     | E2E-тесты (Supertest)      |
| `npm run prisma:generate` | Генерация Prisma Client |
| `npm run prisma:migrate`  | Миграция Prisma         |
### Frontend (`frontend/`)
| Команда         | Описание               |
| --------------- | ---------------------- |
| `npm start`     | `ng serve` (порт 4200) |
| `npm run build` | Сборка                 |
| `npm test`      | Тесты (Vitest)         |
### Root
| Команда            | Описание                            |
| ------------------ | ----------------------------------- |
| `npm run compile`  | TypeSpec → OpenAPI                  |
| `npm run mock`     | Prism mock-сервер (порт 4010)       |
## Конвенции кода
### Общие
-   **Кавычки:** одинарные (`'`)
-   **Точки с запятой:** обязательны
-   **Отступы:** 2 пробела
-   **Кодировка:** UTF-8
-   **Имена файлов:** kebab-case (`app.module.ts`, `booking.component.ts`)
-   **Имена классов:** PascalCase (`AppModule`, `BookingComponent`)
-   **Переменные и методы:** camelCase (`getAvailableSlots`, `eventTypes`)
-   **Тесты:** `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)
### Backend (NestJS)
-   Модули через `@Module({ imports, controllers, providers })`
-   DI через конструктор: `constructor(private readonly service: ServiceType)`
-   Типизация возвращаемых значений обязательна (`: string`, `: Promise<void>`)
-   Explicit return types on all methods
-   Контроллеры в отдельных файлах от сервисов
-   E2E-тесты через `@nestjs/testing` + `supertest`
-   Поддержка trailing commas (`trailingComma: "all"`)
### Frontend (Angular)
-   **Standalone components** (без NgModules)
-   **ChangeDetectionStrategy.OnPush** по умолчанию во всех компонентах
-   `@Component` с `imports`, `templateUrl`, `styleUrl` (единственное число)
-   Сигналы (`signal()`) для реактивного состояния
-   Стилизация через Angular Material (azure-blue тема) — кастомные CSS-файлы используются только для лейаута
-   `bootstrapApplication(App, appConfig)` — без `platformBrowserDynamic`
-   `provideRouter(routes)` для маршрутизации
-   `@for` вместо `*ngFor`, `<router-outlet />` (самозакрывающийся)
-   Контроль потока через встроенные шаблонные конструкции Angular
-   Тесты через `TestBed.configureTestingModule({ imports: [...] })`
-   **Нет barrel-файлов (`index.ts`)** — импорты через прямые пути
### API-спецификация (TypeSpec)
-   API описан в `specs/calendar.tsp`
-   Компиляция: `npm run compile` → OpenAPI 3.0 YAML
-   API-контракт — единственный источник правды
-   Frontend разрабатывается и тестируется через Prism mock-сервер
-   Бэкенд должен строго соответствовать OpenAPI-спецификации
## Тестирование
-   **Backend unit:** `npm test` (Jest, ts-jest, `testRegex: .*\\.spec\\.ts$`)
-   **Backend e2e:** `npm run test:e2e` (Jest + Supertest, `testRegex: .e2e-spec\\.ts$`)
-   **Frontend:** `npm test` (Vitest 4, `@angular/build:unit-test`)
-   Файлы тестов лежат рядом с тестируемым модулем
## Линтинг и форматирование
-   **Backend:** ESLint (flat config `eslint.config.mjs`) + Prettier
    -   `@typescript-eslint/no-explicit-any: off` — разрешено
    -   `@typescript-eslint/no-floating-promises: warn`
    -   `@typescript-eslint/no-unsafe-argument: warn`
-   **Frontend:** только Prettier (ESLint не настроен)
    -   `printWidth: 100` (против 80 в бэке)
    -   Для HTML-файлов используется `parser: "angular"`
-   **EditorConfig** (frontend): `indent_size = 2`, `quote_type = single`
## Важно для AI-агента
1. **Внимательно следить за версиями:** Angular 21, NestJS 11, TypeScript 5.9+/5.7+
2. **При создании новых компонентов/модулей следовать существующим паттернам** (см. `app.controller.ts`, `app.service.ts`, `app.module.ts`).
3. **Не использовать NgModules** во фронтенде — только standalone-компоненты.
4. **Не менять конфигурацию git, не пушить без явной просьбы.**
5. **При работе с API строго придерживаться OpenAPI-спецификации** из `specs/generated/@typespec/openapi3/openapi.yaml`.
6. **Запускать `npm run lint` и `npm test` после внесения изменений** для проверки корректности.