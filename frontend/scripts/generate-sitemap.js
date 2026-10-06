import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  if (!text) return 'item';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STATIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/engines', priority: '0.9', changefreq: 'weekly' },
  { url: '/parts', priority: '0.9', changefreq: 'daily' },
  { url: '/parts/cylinder-heads', priority: '0.8', changefreq: 'weekly' },
  { url: '/parts/camshafts', priority: '0.8', changefreq: 'weekly' },
  { url: '/parts/brake-kits', priority: '0.8', changefreq: 'weekly' },
  { url: '/parts/electrical-components', priority: '0.8', changefreq: 'weekly' },
  { url: '/parts/suspension-shocks', priority: '0.8', changefreq: 'weekly' },
  { url: '/parts/transmission-clutch', priority: '0.8', changefreq: 'weekly' },
  { url: '/restoration', priority: '0.8', changefreq: 'weekly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
  { url: '/returns', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms', priority: '0.5', changefreq: 'monthly' }
];

async function generateSitemap() {
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const baseUrl = 'https://www.classicaircooledvwworks.com';
  let productRoutes = [];

  const apiUrl = process.env.VITE_API_URL || 'https://vv-classic-works.onrender.com';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${apiUrl}/api/parts`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const parts = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      productRoutes = parts.map(p => ({
        url: `/parts/item/${p.id}-${slugify(p.title)}`,
        priority: '0.7',
        changefreq: 'weekly'
      }));
    }
  } catch (err) {
    // Silently skip if API is unreachable at build time as required
  }

  const allRoutes = [...STATIC_ROUTES, ...productRoutes];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${baseUrl}${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  try {
    fs.writeFileSync(sitemapPath, xmlContent, 'utf8');
  } catch (err) {
    // Non-fatal
  }
}

await generateSitemap();

