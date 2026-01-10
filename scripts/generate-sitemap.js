#!/usr/bin/env node
// Simple sitemap generator
// Usage: SITE_URL=https://example.com node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');

const siteUrl = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '');
const publicDir = path.join(__dirname, '..', 'public');
const outFile = path.join(publicDir, 'sitemap.xml');

function walk(dir, baseUrl) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full, path.join(baseUrl, entry.name)));
    } else if (entry.isFile()) {
      // exclude source maps and hidden files
      if (entry.name.endsWith('.map') || entry.name.startsWith('.')) continue;
      files.push({ fsPath: full, urlPath: path.join(baseUrl, entry.name) });
    }
  }
  return files;
}

// Collect files under public to include in sitemap; map index.html to directory root
let urls = [];
try {
  if (!fs.existsSync(publicDir)) {
    console.error('Public directory not found:', publicDir);
    process.exit(1);
  }
  const files = walk(publicDir, '/');
  const now = new Date().toISOString().slice(0,10);
  const seen = new Set();

  for (const f of files) {
    let url = f.urlPath.replace(/\\\\/g, '/');
    if (url.endsWith('/index.html')) {
      url = url.replace(/index.html$/, '');
    }
    // skip default assets (optional): you may modify the filter rules below
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|js|css|map)$/i)) continue;
    // dedupe
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push({ loc: `${siteUrl}${url}`, lastmod: now, changefreq: 'monthly', priority: '0.7' });
  }

  // Always include root
  if (!seen.has('/')) {
    urls.unshift({ loc: `${siteUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' });
  }

  const xmlParts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const u of urls) {
    xmlParts.push('  <url>');
    xmlParts.push(`    <loc>${u.loc}</loc>`);
    if (u.lastmod) xmlParts.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq) xmlParts.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (u.priority) xmlParts.push(`    <priority>${u.priority}</priority>`);
    xmlParts.push('  </url>');
  }
  xmlParts.push('</urlset>');

  fs.writeFileSync(outFile, xmlParts.join('\n') + '\n', 'utf8');
  console.log('Sitemap generated at', outFile);
} catch (err) {
  console.error('Error generating sitemap:', err);
  process.exit(1);
}
