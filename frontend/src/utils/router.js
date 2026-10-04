import { useState, useEffect } from 'react';

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
 */
export function parseProductSlug(param) {
  if (!param) return { id: null, slug: '' };
  const firstHyphen = param.indexOf('-');
  if (firstHyphen === -1) {
    return { id: param, slug: '' };
  }
  return {
    id: param.substring(0, firstHyphen),
    slug: param.substring(firstHyphen + 1)
  };
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
