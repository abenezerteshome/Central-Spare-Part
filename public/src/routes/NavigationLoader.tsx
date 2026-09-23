import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';

const NavigationLoader = () => {
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const handleNavigationClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === location.pathname) {
        return;
      }

      setNavigating(true);
    };

    document.addEventListener('click', handleNavigationClick, true);
    return () => document.removeEventListener('click', handleNavigationClick, true);
  }, [location.pathname]);

  useEffect(() => {
    setNavigating(false);
  }, [location.pathname]);

  return navigating ? <Loader /> : null;
};

export default NavigationLoader;
