/**
 * Scrape Yandex Maps clinic data — org page, reviews, gallery
 * 
 * Usage:
 *   node scrape-yandex-maps.js <yandex_org_id> [output_dir]
 *   
 * Example:
 *   node scrape-yandex-maps.js 109445100310 ./research
 */
import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

const ORG_ID = process.argv[2];
const OUT = process.argv[3] || './research';

if (!ORG_ID) {
  console.error('Usage: node scrape-yandex-maps.js <org_id> [output_dir]');
  process.exit(1);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.join(OUT, 'images-yandex'), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// === 1. ORG PAGE ===
console.log(`Fetching org page for ${ORG_ID}...`);
await page.goto(`https://yandex.ru/maps/org/${ORG_ID}/`, { waitUntil: 'networkidle' });

const orgData = await page.evaluate(() => {
  const txt = document.body.innerText;
  const phones = txt.match(/\+7[\s\-\(\)]*\d{3}[\s\-\(\)]*\d{3}[\s\-\(\)]*\d{2}[\s\-\(\)]*\d{2}/g) || [];
  return {
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1,h2,h3'))
      .map(e => e.textContent.trim()).filter(Boolean).slice(0, 20),
    body_first: txt.substring(0, 8000),
    phones: [...new Set(phones)],
  };
});
await fs.writeFile(path.join(OUT, 'yandex_org_raw.json'), JSON.stringify(orgData, null, 2));
console.log('  ✓ org page → yandex_org_raw.json');

// === 2. REVIEWS ===
console.log('Fetching reviews...');
await page.goto(`https://yandex.ru/maps/org/${ORG_ID}/reviews/`, { waitUntil: 'networkidle' });

// Scroll until no more lazy loads
await page.evaluate(async () => {
  const sc = document.querySelector('[class*="scroll__container"]') || document.documentElement;
  let prev = 0;
  for (let i = 0; i < 60; i++) {
    sc.scrollTo(0, sc.scrollHeight);
    await new Promise(r => setTimeout(r, 600));
    if (sc.scrollHeight === prev) break;
    prev = sc.scrollHeight;
  }
});

// Expand all "ещё" buttons
await page.evaluate(async () => {
  document.querySelectorAll('[class*="business-review-view__expand"]').forEach(b => b.click());
  await new Promise(r => setTimeout(r, 800));
});

const reviewsData = await page.evaluate(() => {
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
await fs.writeFile(path.join(OUT, 'reviews_yandex.json'), JSON.stringify(reviewsData, null, 2));
console.log(`  ✓ ${reviewsData.unique} unique reviews → reviews_yandex.json`);

// === 3. PHOTOS ===
console.log('Fetching gallery photos...');
await page.goto(`https://yandex.ru/maps/org/${ORG_ID}/gallery/`, { waitUntil: 'networkidle' });

// Click first thumbnail to open viewer
await page.evaluate(() => {
  const cells = document.querySelectorAll('.media-wrapper');
  cells[0]?.click();
});
await page.waitForTimeout(800);

const photoUrls = await page.evaluate(async () => {
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

await fs.writeFile(
  path.join(OUT, 'photos_yandex.json'),
  JSON.stringify({ count: photoUrls.length, urls: photoUrls }, null, 2)
);
console.log(`  ✓ ${photoUrls.length} photo URLs → photos_yandex.json`);

// Download all photos
console.log('Downloading photos...');
for (let i = 0; i < photoUrls.length; i++) {
  const url = photoUrls[i];
  const fname = path.join(OUT, 'images-yandex', `yandex_${String(i).padStart(2, '0')}.jpg`);
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await resp.arrayBuffer());
    await fs.writeFile(fname, buf);
    process.stdout.write(`.`);
  } catch (e) {
    console.error(`\nFailed: ${url}`);
  }
}
console.log(`\n  ✓ ${photoUrls.length} photos downloaded`);

await browser.close();
console.log('Done.');
