# Сервис генерации PDF анкет соискателей

Этот сервис предоставляет HTTP API для генерации PDF анкет соискателей на основе переданных данных. Использует HTML+CSS шаблоны для красивого оформления PDF документов.

## Запуск с Docker

### Используя docker-compose (рекомендуется):

```bash
docker-compose up --build
```

### Используя Docker напрямую:

```bash
# Сборка образа
docker build -t pdf-generator .

# Запуск контейнера
docker run -p 8000:8000 pdf-generator
```

## Использование API

### Основной эндпоинт: POST /generate-pdf/

Отправьте POST запрос с JSON данными на `http://localhost:8000/generate-pdf/`

#### Пример запроса:

```json
{
  "full_name": "Иванов Иван Иванович",
  "birth_date": "15.03.1990",
  "email": "ivanov@example.com",
  "phone": "+7 (999) 123-45-67",
  "city": "Москва",
  "gender": "Мужской",
  "citizenship": "Российская Федерация",
  "education": "Московский государственный университет, Факультет вычислительной математики и кибернетики",
  "graduation_year": "2012",
  "work_experience": "5 лет работы в IT-компаниях, опыт разработки на Python, Java, JavaScript",
  "professional_skills": "Python, Django, FastAPI, PostgreSQL, Docker, Git, Linux",
  "foreign_languages": "Английский - B2, Немецкий - A2",
  "about_me": "Ответственный и целеустремленный разработчик с опытом работы в команде",
  "github_link": "https://github.com/ivanov",
  "telegram_link": "@ivanov_dev",
  "ready_to_relocate": true,
  "ready_to_business_trips": false
}
```

#### Ответ:
Сервис вернет PDF файл с анкетой соискателя.

### Дополнительные эндпоинты:

- `GET /` - Информация о сервисе
- `GET /health` - Проверка здоровья сервиса
- `GET /docs` - Автоматическая документация API (Swagger UI)

## Структура проекта

```
.
├── main.py              # Основной файл FastAPI приложения
├── pdf_service.py       # Модуль генерации PDF с HTML+CSS
├── cors_config.py       # Конфигурация CORS
├── test_cors.py         # Тестовый скрипт для проверки CORS
├── templates/           # HTML шаблоны
│   ├── form.html        # Форма анкеты
│   └── applicant-form.js # JavaScript для формы
├── static/              # Статические файлы
│   └── js/              # JavaScript файлы
├── requirements.txt     # Python зависимости
├── Dockerfile          # Docker конфигурация
├── docker-compose.yml  # Docker Compose конфигурация
└── README.md           # Документация
```

## Настройка CORS

Приложение настроено для работы с CORS (Cross-Origin Resource Sharing) для поддержки запросов с разных доменов.

### Конфигурация CORS

CORS настройки находятся в файле `cors_config.py`:

- **Для разработки**: разрешены все origins (`*`)
- **Для продакшена**: необходимо указать конкретные домены

### Изменение настроек CORS

1. Отредактируйте файл `cors_config.py`
2. Укажите нужные домены в функции `get_cors_origins()`
3. Перезапустите приложение

### Тестирование CORS

Для проверки CORS настроек используйте curl:

```bash
# Проверка OPTIONS запроса
curl -X OPTIONS http://localhost:8000/generate-pdf/ \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" -v

# Проверка POST запроса
curl -X POST http://localhost:8000/generate-pdf/ \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"full_name":"Test User","birth_date":"1990-01-01","email":"test@example.com","phone":"+7 999 123-45-67","city":"Moscow","gender":"Male","citizenship":"Russia","education":"Higher","graduation_year":"2012","work_experience":"5 years","professional_skills":"Python, FastAPI","foreign_languages":"English","about_me":"Test","ready_to_relocate":false,"ready_to_business_trips":true}'
```

### Разрешенные origins по умолчанию:

- `http://localhost:8000`
- `http://localhost:3000`
- `http://127.0.0.1:8000`
- `http://127.0.0.1:3000`

## Технологии

- **FastAPI** - веб-фреймворк для создания API
- **WeasyPrint** - библиотека для конвертации HTML+CSS в PDF
- **Jinja2** - шаблонизатор для HTML
- **Pydantic** - валидация данных
- **Docker** - контейнеризация
- **Uvicorn** - ASGI сервер

## Разработка

Для локальной разработки без Docker:

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск сервиса
python main.py
```

Сервис будет доступен по адресу: http://localhost:8000
