PWA Integration and Sitemap

This repository now includes basic PWA files (service worker and registration), a robots.txt and a sitemap generator script.

Files added
- public/robots.txt — Basic robots file referencing /sitemap.xml
- public/sitemap.xml — Example sitemap (contains a default homepage entry). Run the generator to create a full sitemap.
- scripts/generate-sitemap.js — Script that scans the public directory and writes public/sitemap.xml. Use SITE_URL to set your site base URL.
- public/service-worker.js — A simple service worker that caches the root and serves cached content when offline.
- src/register-service-worker.ts — TypeScript helper to register the service worker and handle basic update lifecycle events.

Usage
1. Generate sitemap
   SITE_URL=https://your-site.example.com node scripts/generate-sitemap.js
   This will write public/sitemap.xml based on files found in public/ (skips common static asset extensions).

2. Service worker
   - The service worker file is at public/service-worker.js and will be served at /service-worker.js when hosting the site.
   - The TypeScript registration helper (src/register-service-worker.ts) registers the service worker on page load. Import it in your client entry (or include the corresponding compiled JS) to enable registration.

Notes
- Replace the placeholder SITE_URL when generating the sitemap to ensure the <loc> entries are absolute and correct for search engines.
- The provided service worker is intentionally simple. Consider using Workbox or expanding caching strategies for production (asset revisioning, runtime caching rules, offline fallback page, etc.).
- If your hosting serves the site under a subpath, adjust the paths and service worker scope accordingly.

If you'd like, I can:
- Adjust the sitemap generator to read your app's routes (if you provide where routes are defined),
- Configure a more advanced service worker with Workbox,
- Add a production-ready registration flow with user notifications when updates are available.
