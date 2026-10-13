import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders its children only once the placeholder is about to scroll into view.
 * Used for heavy below-the-fold sections (e.g. the video showcase) so their network
 * requests do not compete with the first screen on page load.
 *
 * @param {number} [minHeight] - Height reserved before the section mounts (avoids layout jumps below the fold)
 * @param {string} [rootMargin] - How early to start loading before the section is visible
 */
export default function LazyMount({ children, minHeight = 600, rootMargin = '500px 0px', id }) {
  const holderRef = useRef(null);
  const [visible, setVisible] = useState(
    typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    if (visible) return undefined;
    const node = holderRef.current;
    if (!node) return undefined;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  if (visible) return <>{children}</>;
  return <div ref={holderRef} id={id} style={{ minHeight }} aria-hidden="true" />;
}
