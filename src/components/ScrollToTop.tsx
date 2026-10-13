import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to top on route change, or to the #anchor when one is present (retries while the page renders). */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let tries = 0;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 20) {
        window.clearInterval(timer);
        el?.scrollIntoView({ block: 'start' });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
