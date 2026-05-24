# Output Schema

Формат итоговых JSON файлов после прохождения research workflow. Эти файлы → вход для билда сайта (HTML / React / любой стек).

---

## research/clinic_data.json

Главный консолидированный файл со всеми ключевыми данными о клинике.

```json
{
  "clinic": {
    "name": "АПЕКС",
    "legal_name": "ООО «ИМПЕРИАЛ»",
    "inn": "1187746945352",
    "license": "ЛО-77-01-020937 от 22.12.2020",
    "address": "Москва, ул. Изюмская, д. 39, корп. 1",
    "district": "Южное Бутово",
    "postal_code": "117645",
    "lat": 55.549949,
    "lng": 37.569118,
    "phones": {
      "yandex_current": "+7 (495) 157-27-70",
      "old_site": "8-495-410-73-33"
    },
    "email": "stomapex21@yandex.ru",
    "site": "https://stomapeks.ru/",
    "yclients_booking": "https://n551917.yclients.com/",
    "instagram": "https://www.instagram.com/stomapeks21/",
    "vk": null,
    "telegram": null,
    "transit": {
      "metro": [
        { "name": "Улица Скобелевская", "minutes": 11, "distance_m": 950 },
        { "name": "Бульвар Адмирала Ушакова", "minutes": 22, "distance_m": null },
        { "name": "Улица Старокачаловская", "minutes": 30, "distance_m": null }
      ],
      "bus": "С1, С53, 146, 636 до ост. Ул. Новобутовская д. 13"
    },
    "hours_partial": "Открыто до 19:00 (полное расписание уточнить)",
    "founded": 2010,
    "ratings": {
      "yandex": {
        "score": 5.0,
        "votes": 281,
        "reviews": 227,
        "award": "Хорошее место 2026"
      },
      "2gis": {
        "score": 4.8,
        "votes": 42
      },
      "prodoctorov": {
        "reviews_count": 3
      }
    },
    "rating_breakdown_yandex": {
      "Качество лечения": "99% (156 отзывов)",
      "Время ожидания": "100% (46)",
      "Детская стоматология": "100% (40)",
      "Удаление зубов": "94% (20)",
      "Пломбирование": "100% (18)",
      "Чистота": "94% (18)",
      "Анестезия": "100% (17)",
      "Чистка зубов": "88% (17)",
      "Реставрация зубов": "100% (16)",
      "Расположение": "100% (13)",
      "Протезирование": "83% (12)"
    },
    "features": [
      "Хорошее место 2026 (Я.Карты)",
      "Кешбэк 5% (Я.Карты)",
      "Детский кабинет",
      "Wi-Fi",
      "Парковка (35 поблизости)",
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
    "slogan_old": "АПЕКС - ЭТО ВАША БЕЛОСНЕЖНАЯ УЛЫБКА",
    "counters_old": { "clients": 1024, "implants": 4976, "teeth": 17987 }
  },
  "doctors": [
    {
      "slug": "balabanova",
      "name": "Балабанова Светлана Николаевна",
      "role": "Главный врач, терапевт, хирург, пародонтолог",
      "edu": "СПбГМУ им. И.П. Павлова",
      "experience": "20+ лет",
      "extra": "Курсы ЦНИИС по эндодонтии, ортодонтии (Сторина, СПб), Vector-терапия",
      "photo_local": "research/images-old-site/doctor_4b5312b4d14318d8282b90d3a0aad351.jpg",
      "photo_prodoctorov": "research/doctors-prodoctorov/balabanova.jpg"
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
    "yandex_maps_org": "https://yandex.ru/maps/org/109445100310/",
    "site": "https://stomapeks.ru/",
    "2gis": "https://2gis.ru/moscow/firm/70000001047647063",
    "prodoctorov": "https://prodoctorov.ru/moskva/lpu/76086-apeks/",
    "zoon": "https://zoon.ru/msk/medical/stomatologicheskaya_klinika_apeks_v_yuzhnom_butovo/",
    "docdoc": "https://docdoc.ru/clinic/stomatologiya_apeks_5",
    "instagram": "https://www.instagram.com/stomapeks21/"
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
      "author": "Наталья А",
      "date": "2026-04-14T17:00:02.888Z",
      "rating": "5.0",
      "body": "Рылик Анжела Юрьевна - потрясающий специалист. Ни в одной из клиник района я не видел такого качественного специалиста, как здесь. С зубом мудрости вообще никто не хотел работать..."
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
    "https://avatars.mds.yandex.net/get-altay/5120632/2a0000017f49cf7ad8ab7da4635c469cb512/XXXL",
    "https://avatars.mds.yandex.net/get-altay/4546519/2a0000017f49cf9f017bebda414563a7d275/XXXL"
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
  { "text": "АПЕКС - стоматология в Москве", "href": "https://stomapeks.ru/" },
  { "text": "Апекс, стоматологическая клиника", "href": "https://yandex.ru/maps/org/apeks/109445100310/" },
  { "text": "Стоматология «Апекс»", "href": "https://prodoctorov.ru/moskva/lpu/76086-apeks/" },
  { "text": "Стоматология Апекс", "href": "https://2gis.ru/moscow/firm/70000001047647063" },
  { "text": "Стоматология АПЕКС", "href": "https://www.instagram.com/stomapeks21/" }
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
