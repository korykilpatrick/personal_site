import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToLocation: React.FC = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    const pathnameChanged = previousPathnameRef.current !== pathname;
    previousPathnameRef.current = pathname;

    const frameId = window.requestAnimationFrame(() => {
      if (hash) {
        let targetId = hash.slice(1);
        try {
          targetId = decodeURIComponent(targetId);
        } catch {
          // Keep the literal fragment when it contains malformed URI escapes.
        }
        const target = document.getElementById(targetId);
        if (target) {
          target.focus({ preventScroll: true });
          if (typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ block: 'start' });
          }
          return;
        }
      }

      // Let the browser restore the saved scroll position for Back/Forward.
      // Forcing the document to zero here makes returning to a deep archive
      // result feel like starting the search over.
      if (navigationType === 'POP') return;

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (pathnameChanged) {
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hash, navigationType, pathname]);

  return null;
};

export default ScrollToLocation;
