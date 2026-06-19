# Output Schema

Формат итоговых JSON файлов после прохождения research workflow. Эти файлы → вход для билда сайта (HTML / React / любой стек).

> Значения ниже — обезличенные плейсхолдеры, показывают только структуру и формат полей.

---

## research/clinic_data.json

Главный консолидированный файл со всеми ключевыми данными о клинике.

```json
{
  "clinic": {
    "name": "<Название клиники>",
    "legal_name": "ООО «Пример»",
    "inn": "0000000000000",
    "license": "ЛО-00-00-000000 от 01.01.2020",
    "address": "Москва, ул. Примерная, д. 1",
    "district": "<район>",
    "postal_code": "000000",
    "lat": 55.000000,
    "lng": 37.000000,
    "phones": {
      "yandex_current": "+7 (495) 000-00-00",
      "old_site": "8-495-000-00-00"
    },
    "email": "info@example.com",
    "site": "https://example.com/",
    "yclients_booking": "https://nXXXXXX.yclients.com/",
    "instagram": "https://www.instagram.com/example/",
    "vk": null,
    "telegram": null,
    "transit": {
      "metro": [
        { "name": "<станция 1>", "minutes": 11, "distance_m": 950 },
        { "name": "<станция 2>", "minutes": 22, "distance_m": null },
        { "name": "<станция 3>", "minutes": 30, "distance_m": null }
      ],
      "bus": "<маршруты> до ост. <остановка>"
    },
    "hours_partial": "Открыто до 19:00 (полное расписание уточнить)",
    "founded": 2010,
    "ratings": {
      "yandex": {
        "score": 5.0,
        "votes": 0,
        "reviews": 0,
        "award": "Хорошее место <год>"
      },
      "2gis": {
        "score": 4.8,
        "votes": 0
      },
      "prodoctorov": {
        "reviews_count": 0
      }
    },
    "rating_breakdown_yandex": {
      "Качество лечения": "<N>% (<N> отзывов)",
      "Время ожидания": "<N>% (<N>)",
      "Детская стоматология": "<N>% (<N>)"
    },
    "features": [
      "Хорошее место <год> (Я.Карты)",
      "Кешбэк 5% (Я.Карты)",
      "Детский кабинет",
      "Wi-Fi",
      "Парковка",
      "Оплата картой / QR / наличные",
      "Рассрочка",
      "Гарантия",
      "Пандус, подъёмник"
    ],
    "payment_methods": ["карта", "наличные", "QR-код", "кредитная карта", "постоплата"],
    "showcase_yandex": [
      "Профессиональная комплексная чистка зубов",
      "Объёмное моделирование",
      "Авторская реставрация зуба",
      "Консультация с составлением плана лечения",
      "Отбеливание ZOOM-4",
      "Удаление зубного камня"
    ],
    "promo": [
      "Семейная скидка 15% (упомянута в отзывах)",
      "Рассрочка",
      "Кешбэк 5% Я.Карты"
    ],
    "slogan_old": "<слоган со старого сайта>",
    "counters_old": { "clients": 0, "implants": 0, "teeth": 0 }
  },
  "doctors": [
    {
      "slug": "doctor-slug",
      "name": "<ФИО врача>",
      "role": "Главный врач, терапевт, хирург, пародонтолог",
      "edu": "<медицинский вуз>",
      "experience": "20+ лет",
      "extra": "<курсы повышения квалификации>",
      "photo_local": "research/images-old-site/doctor_<hash>.jpg",
      "photo_prodoctorov": "research/doctors-prodoctorov/doctor-slug.jpg"
    }
  ],
  "services_categories": {
    "terapiya": "Терапия (38 позиций)",
    "ortopediya": "Ортопедия (40 позиций)",
    "ortodontiya": "Ортодонтия (30 позиций)",
    "parodontologiya": "Пародонтология (17 позиций)",
    "hirurgiya": "Хирургия (35 позиций)"
  },
  "services_yandex_list": [
    "хирургия", "эстетическая стоматология", "эндодонтия", "имплантология",
    "рентгенография", "ортодонтия", "челюстно-лицевая хирургия", "протезирование",
    "терапия", "френулопластика", "пломбирование", "удаление зубов",
    "отбеливание", "лечение кариеса", "виниры и люминиры", "брекеты",
    "гигиена полости рта", "коронки", "лечение дёсен", "лечение каналов",
    "костная пластика", "лечение периодонтита", "лечение кисты зуба", "реставрация зубов"
  ],
  "implant_systems": ["Dentium", "Nobel", "Straumann", "Alfa Bio", "Ot medical"],
  "sources": {
    "yandex_maps_org": "https://yandex.ru/maps/org/<ID>/",
    "site": "https://example.com/",
    "2gis": "https://2gis.ru/moscow/firm/<ID>",
    "prodoctorov": "https://prodoctorov.ru/moskva/lpu/<ID>/",
    "zoon": "https://zoon.ru/msk/medical/<slug>/",
    "docdoc": "https://docdoc.ru/clinic/<slug>",
    "instagram": "https://www.instagram.com/example/"
  }
}
```

---

## research/reviews_yandex.json

```json
{
  "unique": 100,
  "reviews": [
    {
      "author": "<имя автора>",
      "date": "2026-01-01T00:00:00.000Z",
      "rating": "5.0",
      "body": "<текст отзыва>"
    }
  ]
}
```

**Поля:**
- `author` — имя из `[itemprop="name"]`
- `date` — ISO timestamp из `[itemprop="datePublished"]`
- `rating` — строка `"5.0"` или `"1.0"` (через `meta[itemprop="ratingValue"]`)
- `body` — текст из `[itemprop="reviewBody"]`

---

## research/photos_yandex.json

```json
{
  "count": 50,
  "urls": [
    "https://avatars.mds.yandex.net/get-altay/<id>/<hash>/XXXL",
    "https://avatars.mds.yandex.net/get-altay/<id>/<hash>/XXXL"
  ]
}
```

URL'ы XXXL разрешения. Файлы скачиваются в `research/images-yandex/yandex_NN.jpg`.

---

## research/prices/all_prices.json

Распарсенные xlsx файлы. Структура — массив строк на категорию:

```json
{
  "terapiya": [
    ["ТЕРАПИЯ"],
    ["№", "перечень услуг", "цена"],
    [1, "Консультация стоматолога-терапевта", 1000],
    [2, "Услуги ассистента", 200],
    [3, "Использование системы Оптрагейт, Коффердам", "500/1000"],
    [5, "Анестезия инфильтрационная,проводниковая", 800]
  ],
  "ortopediya": [...],
  "ortodontiya": [...],
  "parodontologiya": [...],
  "hirurgiya": [...]
}
```

**Особенности**:
- Первая строка часто заголовок категории (одна ячейка)
- Вторая строка — заголовки столбцов
- Цена может быть числом ИЛИ строкой:
  - `"500/1000"` — два варианта (взять первый)
  - `"200 / зуб"` — цена + unit
  - `"от 10000"` — извлечь число
  - `"18000-29000"` — диапазон (взять min, остаток как unit)
  - `"уточняйте"` — null

---

## research/sources.json

Аудит лог — где что нашли:

```json
[
  { "text": "<название> - стоматология в Москве", "href": "https://example.com/" },
  { "text": "<название>, стоматологическая клиника", "href": "https://yandex.ru/maps/org/<ID>/" },
  { "text": "Стоматология «<название>»", "href": "https://prodoctorov.ru/moskva/lpu/<ID>/" },
  { "text": "Стоматология <название>", "href": "https://2gis.ru/moscow/firm/<ID>" },
  { "text": "Стоматология <название>", "href": "https://www.instagram.com/example/" }
]
```

---

## Открытые вопросы для клиента

Что обычно НЕ удаётся вытащить из публичных источников — формирует список open questions для встречи с клиникой:

```json
{
  "open_questions": [
    "Точные часы работы по дням (на ЯК только «до 19:00»)",
    "Актуальный первичный телефон (на ЯК один, на старом сайте другой)",
    "Действующие акции и скидки",
    "Реальные фото врачей в hi-res на едином фоне (некоторые с Prodoctorov 100×100)",
    "Фото before/after с разрешением пациентов",
    "Точный текст политики конфиденциальности от юриста клиники",
    "Yclients API token для реального submit формы записи",
    "Yandex Metrika / GA счётчик",
    "Подтверждение брендов имплантов (на сайте указано одно, на Prodoctorov другое)",
    "Кастомный домен или поддомен на Vercel?"
  ]
}
```

---

## Использование в pipeline

После research → передать `clinic_data.json` в билдер:

```
input:
  - clinic_data.json
  - reviews_yandex.json (filtered top-12)
  - prices/all_prices.json
  - images-* (curated)
  - photos_yandex.json

output:
  - HTML/React сайт с реальными данными
  - public/images/ оптимизированные
  - content/*.ts модули если React-стек
```
