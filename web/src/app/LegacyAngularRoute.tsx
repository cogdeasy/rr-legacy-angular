import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './LegacyAngularRoute.scss';

/**
 * Strangler-fig bridge for routes still owned by Angular. The Angular application is
 * proxied same-origin under `/legacy` (see vite.config.ts) so it shares the mocked
 * `rr_portal_auth` session, and its own header, sidebar and footer chrome is hidden —
 * the React shell around the frame supplies those.
 */
export function LegacyAngularRoute() {
  const { pathname } = useLocation();
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) {
      return;
    }
    const hideLegacyChrome = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      const style = doc.createElement('style');
      style.textContent = `
        app-header, app-sidebar, app-footer { display: none !important; }
        .main-content { margin-left: 0 !important; padding: 0 !important; }
      `;
      doc.head.appendChild(style);
    };
    iframe.addEventListener('load', hideLegacyChrome);
    return () => iframe.removeEventListener('load', hideLegacyChrome);
  }, []);

  return (
    <iframe
      ref={frame}
      className="legacy-frame"
      title={`Legacy Angular route ${pathname}`}
      src={`/legacy${pathname}`}
    />
  );
}
