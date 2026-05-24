# Research Workflow

Детальный пошаговый процесс сбора всех публичных данных о мед.клинике. Применимо к стоматологии, косметологии, педиатрии, гинекологии — любому профилю в РФ.

Каждый шаг включает: что искать, как, готовый код, формат вывода.

---

## Шаг 0. Вход

Что нужно от лида (минимум):
- Название клиники
- Город
- ИЛИ Yandex Maps URL (если уже знаешь)

Что желательно дополнительно:
- Старый сайт клиники
- Адрес

---

## Шаг 1. Discovery — найти все источники

**Цель**: собрать URL'ы всех публичных страниц о клинике.

### 1.1 Google поиск

Запрос: `"<название>" <тип клиники> <район/адрес> <город>`

Пример: `"апекс" стоматология изюмская 39 бутово`

В Playwright:
```js
await page.goto('https://www.google.com/search?q=' + encodeURIComponent(query));

const sources = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href]'));
  return links
    .map(a => ({ text: a.textContent.trim().substring(0, 100), href: a.href }))
    .filter(r => {
      const h = r.href;
      return (
        h.includes('yandex.ru/maps/org/') ||
        h.includes('2gis.ru/') ||
        h.includes('prodoctorov.ru/') ||
        h.includes('zoon.ru/') ||
        h.includes('docdoc.ru/') ||
        h.includes('vk.com/') ||
        h.includes('instagram.com/') ||
        h.includes('t.me/') ||
        /^https?:\/\/[^/]+\.ru\//.test(h)
      ) && !h.includes('google.com');
    });
});
```

### 1.2 Что искать в результатах

| Домен | Зачем |
|---|---|
| `yandex.ru/maps/org/<ID>/` | Главный источник. Сохранить `<ID>` для прямого доступа к Reviews/Gallery |
| `2gis.ru/<city>/firm/<ID>/` | Альтернативный рейтинг + accessibility |
| `prodoctorov.ru/<city>/lpu/<ID>-<slug>/` | Только тут стажи врачей |
| `zoon.ru/<city>/medical/<slug>/` | Backup отзывов |
| `docdoc.ru/clinic/<slug>` | Backup |
| Прямой домен клиники | Юр.реквизиты, прайс xlsx, hi-res фото |
| `instagram.com/<handle>` | Свежие фото, акции |
| `vk.com/<handle>` | Свежие фото, акции |
| `t.me/<handle>` | Канал клиники |

### 1.3 Yandex Maps URL trick

Если есть URL вида `yandex.ru/maps/org/<ID>/`, то:
- Reviews: `yandex.ru/maps/org/<ID>/reviews/`
- Photos: `yandex.ru/maps/org/<ID>/gallery/`

`<ID>` — числовой, постоянный.

---

## Шаг 2. Yandex Maps — основная страница

URL: `https://yandex.ru/maps/org/<ID>/`

### 2.1 Что вытащить

```js
const data = await page.evaluate(() => {
  const txt = document.body.innerText;
  const phones = txt.match(/\+7[\s\-\(\)]*\d{3}[\s\-\(\)]*\d{3}[\s\-\(\)]*\d{2}[\s\-\(\)]*\d{2}/g) || [];
  return {
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1,h2,h3'))
      .map(e => e.textContent.trim()).filter(Boolean).slice(0, 20),
    body_first: txt.substring(0, 6000),
    phones: [...new Set(phones)],
    rating_block: document.querySelector('[class*="business-rating"]')?.innerText || '',
  };
});
```

### 2.2 Парсинг текста

Из `body_first` извлечь регулярками:

- Рейтинг: `/(\d\.\d)\s*\n?\s*(\d+)\s*оцен/`
- Кол-во отзывов: `/(\d+)\s*отзыв/`
- Награды: `Хорошее место 2026`, `Кешбэк <N>%`
- Адрес: `/Адрес\s*\n([^\n]+)/`
- Часы: `/Открыто до (\d{1,2}:\d{2})/`

### 2.3 Особенности (features)

Я.Карты группируют под заголовком «Особенности». Известные ключевые слова:

```js
const known = ['Детский кабинет', 'Wi-Fi', 'Парковка', 'Пандус', 'Подъёмник',
               'Оплата картой', 'Рассрочка', 'Гарантия', 'Лицензия'];
const features = known.filter(k => body_first.includes(k));
```

### 2.4 Рейтинг по категориям

Я.Карты дают breakdown по типам процедур. Например:
- «Качество лечения • 99% положительный 156 отзывов»
- «Чистота • 94% положительный 18 отзывов»

Парсить:
```
const breakdownRegex = /([А-Яа-я ]+)\s*•\s*(\d+)%\s*положительный\s*(\d+)\s*отзыв/g;
```

Это бриллиант для маркетинга — на сайте показываешь конкретные % по категориям.

### 2.5 Витрина услуг

В body часто секция «Витрина» — короткий список топ-услуг с ценами.

---

## Шаг 3. Yandex Maps — отзывы

URL: `https://yandex.ru/maps/org/<ID>/reviews/`

### 3.1 Главная проблема — lazy loading

Я.Карты грузят отзывы по 20-30 штук при скролле scroll-контейнера. Нужно прокручивать пока `scrollHeight` не перестанет расти.

### 3.2 Workflow

```js
await page.goto(`https://yandex.ru/maps/org/${ID}/reviews/`);

// Шаг 1 — прокрутить scroll контейнер до конца
await page.evaluate(async () => {
  const sc = document.querySelector('[class*="scroll__container"]')
    || document.documentElement;
  let prev = 0;
  for (let i = 0; i < 60; i++) {
    sc.scrollTo(0, sc.scrollHeight);
    await new Promise(r => setTimeout(r, 600));
    if (sc.scrollHeight === prev) break;
    prev = sc.scrollHeight;
  }
});

// Шаг 2 — раскрыть длинные отзывы кликом «ещё»
await page.evaluate(async () => {
  document.querySelectorAll('[class*="business-review-view__expand"]')
    .forEach(b => b.click());
  await new Promise(r => setTimeout(r, 800));
});

// Шаг 3 — извлечь через itemprop selectors (стабильнее class regex)
const reviews = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('[class*="business-reviews-card-view__review"]'));
  const seen = new Set();
  const out = [];
  cards.forEach(card => {
    const author = (card.querySelector('[itemprop="name"]')?.innerText || '').trim();
    const date = (card.querySelector('[itemprop="datePublished"]')?.getAttribute('content') || '').trim();
    const body = (card.querySelector('[itemprop="reviewBody"]')?.innerText || '').trim();
    const rating = card.querySelector('meta[itemprop="ratingValue"]')?.getAttribute('content') || '';
    const key = author + '|' + date;
    if (!seen.has(key) && body.length > 20) {
      seen.add(key);
      out.push({ author, date, rating, body });
    }
  });
  return { unique: out.length, reviews: out };
});
```

### 3.3 Дедупликация

Я.Карты рендерят один отзыв в несколько DOM-узлов (карточка целиком + текст отдельно). **Дедупить ВСЕГДА** по `author+date`.

### 3.4 Фильтрация для сайта

Не показывай все 100 — выбери топ-12 по критериям:
- `rating === '5.0'`
- `body.length > 150` (содержательные)
- разные врачи упомянуты (разнообразие)
- свежие в приоритете

---

## Шаг 4. Yandex Maps — фотогалерея

URL: `https://yandex.ru/maps/org/<ID>/gallery/`

### 4.1 Главная проблема

В сетке-превью видно только ~13 фото. Чтобы достать ВСЕ (бывает 50+) — открыть lightbox и пролистать стрелками.

### 4.2 Workflow

```js
await page.goto(`https://yandex.ru/maps/org/${ID}/gallery/`);

// Кликнуть первую превьюшку — открыть viewer
await page.evaluate(() => {
  const cells = document.querySelectorAll('.media-wrapper');
  cells[0]?.click();
});
await page.waitForTimeout(800);

// Листать ArrowRight, собирая URL высокого разрешения
const photos = await page.evaluate(async () => {
  const collected = new Set();
  for (let i = 0; i < 60; i++) {
    document.querySelectorAll('img').forEach(img => {
      if (img.src.includes('avatars.mds.yandex.net') && img.naturalWidth > 200) {
        collected.add(img.src);
      }
    });
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, bubbles: true,
    }));
    await new Promise(r => setTimeout(r, 350));
  }
  return Array.from(collected);
});
```

### 4.3 Размеры

URL формат: `https://avatars.mds.yandex.net/get-altay/<bucket>/<id>/<SIZE>`

Варианты SIZE:
- `S_height` — превью ~100px
- `M_height` — ~300px
- `XXXL` — полный размер (1080-2000px)

**Брать XXXL.**

### 4.4 Скачивание

```python
import urllib.request, os
os.makedirs('research/images-yandex', exist_ok=True)
for i, url in enumerate(photo_urls):
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        with open(f'research/images-yandex/yandex_{i:02d}.jpg', 'wb') as f:
            f.write(r.read())
```

### 4.5 Curate потом

Из 50 фото обычно ~30-35 годных. Отбраковать:
- Бизнес-карты, лицензии, сертификаты (отдельно в `research/legal/`)
- Фото рта/зубов пациентов (некрасиво в галерее)
- Скриншоты прайсов, объявлений
- Размытые / тёмные

Использовать в проде: интерьер, рецепция, оборудование, фасад.

---

## Шаг 5. Prodoctorov — врачи

URL: `https://prodoctorov.ru/<city>/lpu/<ID>-<slug>/`

### 5.1 Что даёт уникального

- **Стаж врачей в годах** — нигде больше не публикуется
- Список врачей с ФИО и специализациями
- Квадратные фото 100×100 (low-res, backup)
- Описание клиники в свободной форме (для SEO meta description)

### 5.2 Извлечение

```js
const data = await page.evaluate(() => {
  const text = document.body.innerText;
  return {
    title: document.title,
    meta: document.querySelector('meta[name="description"]')?.content,
    text: text.substring(0, 8000),
    doctorPhotos: Array.from(document.querySelectorAll('img'))
      .map(i => i.src)
      .filter(s => s && s.includes('prodoctorov.ru/media/photo'))
      .filter(s => s.includes('doctorimage')),
  };
});
```

### 5.3 Парсинг врачей

Блок начинается с «Врачи стоматологии» / «Врачи косметологии» / etc.

Каждый врач формата:
```
<кол-во> отзывов
Фамилия Имя Отчество
специализации через запятую
Стаж N лет
```

Regex:
```
/([А-Я][а-я]+\s[А-Я][а-я]+\s[А-Я][а-я]+)\s*\n([^\n]+)\nСтаж\s*(\d+)\s*лет/g
```

### 5.4 Скачать фото

URL pattern: `https://prodoctorov.ru/media/photo/<city>/doctorimage/<doctor_id>/<file_id>-<doctor_id>-<surname>_square_small.jpg`

```python
urls = [...]  # из data.doctorPhotos
for url in urls:
    surname = url.split('-')[-1].replace('_square_small.jpg', '')
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        open(f'research/doctors-prodoctorov/{surname}.jpg', 'wb').write(r.read())
```

---

## Шаг 6. Старый сайт клиники

Если есть свой сайт — там лежат: юр.реквизиты, прайс-листы xlsx, hi-res фото врачей. Этого нет на агрегаторах.

### 6.1 Главная страница

```js
const data = await page.evaluate(() => {
  return {
    title: document.title,
    h1h2h3: Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.textContent.trim()),
    text: document.body.innerText.substring(0, 8000),
    links: Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({text: a.textContent.trim(), href: a.href}))
      .filter(l => l.text && !l.href.startsWith('javascript:')),
    images: Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s),
    meta_desc: document.querySelector('meta[name="description"]')?.content || '',
  };
});
```

### 6.2 Что искать в тексте

```
// ООО + название (часто в подвале)
text.match(/ООО\s*[«"]([^»"]+)[»"]/)

// ИНН (10 или 12 цифр)
text.match(/ИНН[:\s]*(\d{10}|\d{12})/)

// Лицензия — формат "ЛО-77-01-020937 от 22.12.2020"
text.match(/(ЛО-\d{2}-\d{2}-\d{6})(?:\s*от\s*(\d{2}\.\d{2}\.\d{4}))?/)

// Email
text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)

// Телефоны
text.match(/(?:8|\+7)[\s\-\(]?\d{3}[\s\-\)]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g)
```

### 6.3 Прайс-листы (xlsx)

Старые мед.сайты часто раздают прайсы файлами:
```js
const xlsxLinks = links.filter(l => l.href.endsWith('.xlsx'));
```

Скачать:
```bash
mkdir -p research/prices
for url in $XLSX_URLS; do
  filename=$(basename "$url")
  curl -sL "$url" -o "research/prices/$filename"
done
```

Распарсить через openpyxl:
```python
import openpyxl, json, os

files = [f for f in os.listdir('research/prices') if f.endswith('.xlsx')]
out = {}
for f in files:
    wb = openpyxl.load_workbook(f'research/prices/{f}', data_only=True)
    rows = []
    for sh in wb.sheetnames:
        for r in wb[sh].iter_rows(values_only=True):
            row = [c for c in r if c is not None]
            if row: rows.append(row)
    out[f.replace('.xlsx','')] = rows

with open('research/prices/all_prices.json', 'w', encoding='utf-8') as fp:
    json.dump(out, fp, ensure_ascii=False, indent=2)
```

### 6.4 Фото с старого сайта

Скрап по типичным путям:
```bash
mkdir -p research/images-old-site
for n in 1 2 3 4 5 6 7 8 9 10; do
  curl -sL "https://site.ru/images/clinic/$n.jpg" -o "research/images-old-site/clinic_$n.jpg"
done
```

Лицензия часто отдельным файлом:
```bash
curl -sL "https://site.ru/images/clinic/lic.jpg" -o "research/images-old-site/license_1.jpg"
```

Фото врачей часто в `uploads/service_big/<hash>.jpg`:
```bash
for url in $DOCTOR_PHOTOS_URLS; do
  hash=$(basename "$url" | sed 's/\.jpg//')
  curl -sL "$url" -o "research/images-old-site/doctor_${hash}.jpg"
done
```

### 6.5 Маппинг фото врача → ФИО

Проблема: на старом сайте фото лежат с hash-именами (`9ccb30ef5cebf159a3ed3507f6ac4f09.jpg`), без указания ФИО.

Решения:
1. **HTML парсинг**: на странице фото врача стоит рядом с заголовком его имени. Сопоставить порядок img'ов с порядком h3.
2. **Визуальное определение**: AI открывает каждое фото → определяет наличие бейджа на халате с ФИО → если есть, мапит.
3. **Если бейджа нет** — записать как `doctor_unknown_N.jpg`, помечать как open question для клиента.

---

## Шаг 7. 2GIS

URL: `https://2gis.ru/<city>/firm/<ID>/tab/info`

### 7.1 Что даёт уникального

- **Доступная среда** (пандус, подъёмник, низкие пороги) — нет на ЯК
- Парковки поблизости (количество и расположение)
- Другая аудитория голосов рейтинга
- Иногда более детальный список услуг

### 7.2 Особенность: текст с точками

2GIS вставляет ASCII-точки `..............` как разделители. Чистить:
```js
const cleaned = text.replace(/\.{5,}/g, ' ').replace(/\s+/g, ' ').trim();
```

### 7.3 Извлечение

```js
const data = await page.evaluate(() => {
  const text = document.body.innerText.replace(/\.{5,}/g, ' ').replace(/\s+/g, ' ');
  const ratingMatch = text.match(/(\d\.\d)\s*(\d+)\s*оценок/);
  const accessIdx = text.indexOf('Доступная среда');
  const accessBlock = text.substring(accessIdx, accessIdx + 200);
  const parkingsMatch = text.match(/(\d+)\s*парковок/);
  return {
    rating: ratingMatch ? { value: ratingMatch[1], votes: ratingMatch[2] } : null,
    accessBlock,
    parkings: parkingsMatch?.[1],
  };
});
```

---

## Шаг 8. Соцсети

### 8.1 Discovery

Если из Google поиска не нашли — попробовать стандартные handles:
- `https://www.instagram.com/<возможный_handle>/`
- `https://vk.com/<возможный_handle>`
- `https://t.me/<возможный_handle>`

Handle часто = транслитерация названия (`stomapeks` для АПЕКС).

### 8.2 Instagram

Профиль без логина показывает:
- Аватар
- Био
- Кол-во подписчиков
- Превью последних ~12 постов

Извлечь:
```js
const igData = await page.evaluate(() => {
  const meta = document.querySelector('meta[property="og:description"]')?.content || '';
  const followersMatch = meta.match(/([\d,]+)\s+Followers/);
  return {
    title: document.title,
    description: meta,
    followers: followersMatch?.[1].replace(/,/g, ''),
  };
});
```

**Важно**: Instagram требует логин для просмотра постов. Для метаданных профиля достаточно `og:description`.

### 8.3 VK

VK более открыт чем Instagram. Публичная стена, альбомы — доступны без логина.

```js
const vkData = await page.evaluate(() => {
  return {
    name: document.querySelector('.page_name')?.innerText,
    description: document.querySelector('.page_status')?.innerText,
    posts: Array.from(document.querySelectorAll('.wall_post_text'))
      .map(p => p.innerText).slice(0, 10),
    photos: Array.from(document.querySelectorAll('.page_photo img'))
      .map(i => i.src).slice(0, 20),
  };
});
```

### 8.4 Telegram

Публичные каналы доступны через `/s/` префикс:
```
https://t.me/s/<handle>
```

```js
const tgData = await page.evaluate(() => {
  return {
    title: document.querySelector('.tgme_channel_info_header_title')?.innerText,
    description: document.querySelector('.tgme_channel_info_description')?.innerText,
    subscribers: document.querySelector('.tgme_channel_info_counter .counter_value')?.innerText,
    recentMessages: Array.from(document.querySelectorAll('.tgme_widget_message_text'))
      .map(m => m.innerText).slice(0, 10),
  };
});
```

---

## Шаг 9. Backup источники

Открывать только если основных данных мало.

### 9.1 Zoon

URL: `https://zoon.ru/<city>/medical/<slug>/reviews/`

Парс отзывов аналогично Я.Карт. Я.Карты обычно покрывают 90%, но Zoon может дать ещё ~20-30 уникальных.

### 9.2 DocDoc

URL: `https://docdoc.ru/clinic/<slug>`

Дополнительные характеристики приёма.

### 9.3 НаПоправку

URL: `https://napopravku.ru/<city>/lpu/<slug>/`

Backup рейтинг + врачи.

---

## Шаг 10. Консолидация

После прохода всех источников — собрать всё в один JSON. Структура в [OUTPUT-SCHEMA.md](./OUTPUT-SCHEMA.md).

---

## Шаг 11. Чек-лист готовности

```
[ ] research/clinic_data.json — все ключевые поля заполнены
[ ] research/reviews_yandex.json — минимум 50 отзывов
[ ] research/photos_yandex.json — минимум 20 фото URL
[ ] research/images-yandex/*.jpg — все скачаны
[ ] research/images-old-site/clinic_*.jpg — фото интерьера (если был старый сайт)
[ ] research/images-old-site/doctor_*.jpg — hi-res фото врачей (если был старый сайт)
[ ] research/doctors-prodoctorov/*.jpg — квадратные фото (backup)
[ ] research/prices/all_prices.json — прайс распарсен
[ ] research/prices/*.xlsx — оригиналы
[ ] research/sources.json — список всех URL источников (для аудита)
```

---

## Шаг 12. Время + стоимость

При работе AI агента (Sonnet через Playwright):

| Шаг | Время | Токены |
|---|---|---|
| Discovery (Google) | 2 мин | ~5K |
| Я.Карт org page | 3 мин | ~15K |
| Я.Карт reviews (~100) | 5 мин | ~20K |
| Я.Карт gallery (~50 фото) | 8 мин | ~10K |
| Старый сайт + xlsx | 5 мин | ~15K |
| Prodoctorov | 2 мин | ~8K |
| 2GIS | 2 мин | ~5K |
| Соцсети (если открыты) | 3 мин | ~10K |
| Скачивание изображений | 5 мин | ~2K |
| Консолидация JSON | 2 мин | ~5K |
| **Итого** | **~35 мин** | **~95K** |

Стоимость на Sonnet (~$3/M input, $15/M output): **~$2-4** на клинику.

---

## Шаг 13. Антипаттерны

| Не надо | Надо |
|---|---|
| Выдумывать цифры («3000+ пациентов в год») | Помечать TBD, добавлять в open questions |
| Стоковые фото врачей | Реальные с источников ИЛИ инициалы fallback ИЛИ skip |
| Копировать тексты со старого сайта дословно | Переписывать под свой tone of voice |
| Брать первый попавшийся номер телефона | Сравнивать ЯК vs старый сайт vs Prodoctorov, брать свежий |
| Игнорировать 152-ФЗ disclaimer на форме записи | Всегда «Имеются противопоказания. Проконсультируйтесь со специалистом» |
| Доверять одному рейтингу | Сравнивать ЯК (5.0) vs 2GIS (4.8) vs Prodoctorov (1.5) |
| Не дедуплицировать отзывы | Я.Карты рендерят дубли. Dedupe по author+date |
| `_square_small.jpg` от Prodoctorov как основное | 100×100 — только fallback. Hi-res брать со старого сайта |
| Хранить фотки в репо без оптимизации | Прогонять через sharp/cwebp/avifenc |

---

## Шаг 14. Применимость к другим профилям

| Тип клиники | Особенности research |
|---|---|
| Стоматология | Прайс xlsx часто разбит на 5 категорий. Бренды имплантов важны (Nobel/Straumann/Dentium) |
| Косметология | Прайс по процедурам. Лицензия + сертификаты косметологов |
| Педиатрия | Акцент на детский кабинет, игровая зона. Реже есть прайс — обычно «по консультации» |
| Гинекология | Приватный tone of voice. УЗИ, анализы — отдельные прайсы |
| Многопрофильная | 10-15 направлений, шире прайс, разные команды врачей |
| Лаборатория | Огромный прайс на анализы. Не нужны фото врачей. Нужны фото локации |

Все источники (ЯК, 2GIS, Prodoctorov) индексируют любые профили. Скрипты те же.

---

## Реальный пример — АПЕКС (стоматология, Бутово, Москва)

Вход: одна строчка из leadgen базы:
```
"Апекс", Южное Бутово, Москва, ул. Изюмская 39 к1,
https://yandex.ru/maps/org/109445100310/, https://stomapeks.ru/
```

Через 30 минут работы извлекли:
- ООО «ИМПЕРИАЛ», ИНН 1187746945352, лицензия ЛО-77-01-020937 от 22.12.2020
- 7 врачей с ФИО, специализациями, стажем (Балабанова 20+, Рылик 37, Шкабрика 9, Андрейчук, Вафаев к.м.н. 10+, Дарсигов 7, Шитова 20+)
- 100 уникальных отзывов с Я.Карт (97 пятёрок, 3 единицы)
- 50 фото высокого разрешения
- 154 услуги по 5 категориям (полный прайс из xlsx)
- Рейтинг breakdown: Качество лечения 99%, Чистота 94%, Анестезия 100%, Детская стома 100%, и т.д.
- Особенности: детский кабинет, парковка, Wi-Fi, рассрочка, пандус
- Метро: Скобелевская 11 мин (950м), Б. Адмирала Ушакова 22 мин
- 2 телефона (актуальный +7 495 157-27-70 на ЯК vs устаревший +7 495 410-73-33 со старого сайта)
- Награды: «Хорошее место 2026», кэшбэк 5% Я.Карт
- Скидка 15% семейная (упомянута в отзывах)
