// Register service worker with basic update handling
export function registerServiceWorker(swPath = '/service-worker.js') {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swPath).then(reg => {
      console.log('Service worker registered:', reg);

      if (reg.waiting) {
        // there's an updated SW waiting to activate
        console.log('Service worker waiting to activate');
      }

      reg.onupdatefound = () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
            } else {
              // Content cached for offline use
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    }).catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}

// Auto-register when imported in browser environment
if (typeof window !== 'undefined') {
  registerServiceWorker();
}
