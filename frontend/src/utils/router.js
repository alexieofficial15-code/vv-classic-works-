import { useState, useEffect } from 'react';
import { getCachedCatalogParts } from '../data/catalogStore';

// Static fallback IDs to parse product URLs without loading the full data module
const KNOWN_STATIC_IDS = [
  'part-vw-turbo-engine-2276',
  'part-vw-crossbar-breather',
  'part-vw-velocity-stack-hat',
  'part-vw-cylinder-heads-dualport',
  'part-vw-weber-44-kit',
  'part-vw-forged-crankshaft-69',
  'part-vw-bosch-009-distributor',
  'part-vw-vintage-speed-exhaust',
  'rogue-super-beetle-1979',
  'vw-bus-t1-patina-1964',
  'vw-beetle-cal-look-1967',
  'karmann-ghia-coupe-1969'
];

/**
 * Slugify a title for URL-safe representation
 */
export function slugify(text) {
  if (!text) return 'item';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse an :id-:slug product URL parameter into { id, slug }
 * Handles part IDs with hyphens (e.g. "part-vw-turbo-engine-2276-slug-here")
 */
export function parseProductSlug(param) {
  if (!param) return { id: null, slug: '' };

  // 1. Check in-memory catalog cache if available
  try {
    const cached = getCachedCatalogParts();
    if (Array.isArray(cached) && cached.length > 0) {
      const match = cached.find(p => p.id === param || param.startsWith(`${p.id}-`));
      if (match) {
        return {
          id: match.id,
          slug: param === match.id ? '' : param.slice(match.id.length + 1)
        };
      }
    }
  } catch (_) {}

  // 2. Check known static catalog IDs without importing heavy dataset
  const knownId = KNOWN_STATIC_IDS.find(id => id === param || param.startsWith(`${id}-`));
  if (knownId) {
    return {
      id: knownId,
      slug: param === knownId ? '' : param.slice(knownId.length + 1)
    };
  }

  // 4. Fallback for numeric IDs (e.g. "42-carburetor-kit")
  const numericMatch = param.match(/^(\d+)-(.*)$/);
  if (numericMatch) {
    return {
      id: numericMatch[1],
      slug: numericMatch[2]
    };
  }

  // 5. Default fallback: keep the full param as ID so that detail pages can query it
  return { id: param, slug: '' };
}

/**
 * Parse current browser pathname into route key and parameters
 */
export function parseRoute(pathname = '/') {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (clean === '/') {
    return { name: 'home', params: {} };
  }
  if (clean === '/engines') {
    return { name: 'engines', params: {} };
  }
  if (clean === '/parts') {
    return { name: 'parts', params: {} };
  }
  if (clean === '/restoration') {
    return { name: 'restoration', params: {} };
  }
  if (clean === '/privacy') {
    return { name: 'privacy', params: {} };
  }
  if (clean === '/shipping') {
    return { name: 'shipping', params: {} };
  }
  if (clean === '/returns') {
    return { name: 'returns', params: {} };
  }
  if (clean === '/terms') {
    return { name: 'terms', params: {} };
  }
  if (clean === '/contact') {
    return { name: 'contact', params: {} };
  }

  // Product detail match: /parts/item/:id-:slug
  const productMatch = clean.match(/^\/parts\/item\/([^/]+)$/);
  if (productMatch) {
    const rawParam = productMatch[1];
    const { id, slug } = parseProductSlug(rawParam);
    return { name: 'product', params: { id, slug, raw: rawParam } };
  }

  // Parts category match: /parts/:category
  const categoryMatch = clean.match(/^\/parts\/([^/]+)$/);
  if (categoryMatch) {
    return { name: 'parts-category', params: { category: categoryMatch[1] } };
  }

  // Unknown route
  return { name: 'not-found', params: { path: clean } };
}

/**
 * Lightweight client-side router hook using the HTML5 History API.
 * Supports real URLs, browser Back/Forward, and hash modals (#cart, #auth, #admin).
 */
export function useRouter() {
  const [location, setLocation] = useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    search: typeof window !== 'undefined' ? window.location.search : ''
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setLocation({
        pathname: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search
      });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to, options = {}) => {
    if (typeof window === 'undefined') return;

    if (to === location.pathname + location.hash) return;

    if (options.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }

    setLocation({
      pathname: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search
    });

    if (!options.preventScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const route = parseRoute(location.pathname);

  return {
    ...location,
    route,
    navigate
  };
}

/**
 * Set document head metadata (title, description, canonical, OG tags, JSON-LD)
 */
export function updateDocumentMeta({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage = 'https://www.classicaircooledvwworks.com/logo.png',
  jsonLd = null
}) {
  if (typeof document === 'undefined') return;

  // Title
  if (title) {
    document.title = title;
  }

  // Description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
  }

  // Canonical Tag (Required format: https://www.classicaircooledvwworks.com + path)
  const canonicalUrl = `https://www.classicaircooledvwworks.com${canonicalPath}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;

  // Open Graph Tags
  const setMetaTag = (property, content) => {
    if (!content) return;
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  setMetaTag('og:title', title || 'Classic Aircooled VW Works');
  setMetaTag('og:description', description || '');
  setMetaTag('og:url', canonicalUrl);
  setMetaTag('og:type', ogType);
  if (ogImage) {
    setMetaTag('og:image', ogImage);
  }

  // JSON-LD Structured Data
  let scriptEl = document.getElementById('route-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'route-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  if (jsonLd) {
    scriptEl.textContent = JSON.stringify(jsonLd);
  } else {
    scriptEl.textContent = '';
  }
}
