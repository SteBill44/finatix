#!/usr/bin/env node
/**
 * SPA prerenderer — visits every public route with a headless browser and
 * saves the fully-rendered HTML to dist/ so crawlers see real content
 * without waiting for React to boot.
 *
 * Usage:
 *   node scripts/prerender.mjs           # assumes dist/ already built
 *   node scripts/prerender.mjs --build   # runs vite build first
 */

import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const BUILD_FLAG = process.argv.includes('--build');

// All public routes that should be indexed by search engines
// Keep in sync with public/sitemap.xml
const ROUTES = [
  '/',
  '/why-cima',
  '/courses',
  '/courses/ba1',
  '/courses/ba2',
  '/courses/ba3',
  '/courses/ba4',
  '/courses/e1',
  '/courses/p1',
  '/courses/f1',
  '/courses/ocs',
  '/courses/e2',
  '/courses/p2',
  '/courses/f2',
  '/courses/mcs',
  '/courses/e3',
  '/courses/p3',
  '/courses/f3',
  '/courses/scs',
  '/pricing',
  '/about',
  '/contact',
  '/verify',
  '/brand',
  '/privacy',
  '/cookies',
  '/help',
  '/terms',
];

// Phrases that indicate a page failed to load its data — don't save these
const ERROR_PHRASES = [
  'course not found',
  "this course doesn't exist",
  'page not found',
  '404',
  'something went wrong',
];

async function waitForServer(url, maxMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error(`Preview server at ${url} did not start within ${maxMs}ms`);
}

function routeToFilePath(route) {
  if (route === '/') return path.join(DIST, 'index.html');
  const segments = route.replace(/^\//, '').split('/');
  return path.join(DIST, ...segments, 'index.html');
}

function hasErrorContent(html) {
  const lower = html.toLowerCase();
  return ERROR_PHRASES.some(phrase => lower.includes(phrase));
}

async function main() {
  if (BUILD_FLAG || !fs.existsSync(DIST)) {
    console.log('→ Building...');
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  }

  // Read the SPA shell once — used as fallback for pages that fail to render
  const spaShell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

  console.log(`→ Starting preview server on :${PORT}...`);
  const server = spawn(
    'node',
    ['node_modules/.bin/vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: false }
  );
  server.stdout.on('data', d => process.stdout.write(`  [vite] ${d}`));
  server.stderr.on('data', d => process.stderr.write(`  [vite] ${d}`));

  let browser;
  try {
    await waitForServer(BASE_URL);
    console.log('→ Server ready.\n');

    browser = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });

    // Block third-party tracking only — let Supabase through so content loads
    await context.route(/analytics|hotjar|intercom|segment|google-analytics|googletagmanager/, route =>
      route.abort()
    );

    let passed = 0;
    let skipped = 0;
    let failed = 0;

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      const page = await context.newPage();
      page.on('pageerror', () => {}); // suppress JS errors from blocked network calls

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

        // Wait for any loading spinners to clear (data-fetching pages)
        await page.waitForFunction(() => {
          const spinner = document.querySelector('.animate-spin');
          return !spinner;
        }, { timeout: 15_000 }).catch(() => {});

        // Give useEffect hooks (SEOHead, JsonLd) time to settle
        await page.waitForTimeout(600);

        const html = await page.evaluate(() => document.documentElement.outerHTML);

        const outPath = routeToFilePath(route);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });

        if (hasErrorContent(html)) {
          // Page loaded but data failed — save SPA shell so React can recover client-side
          fs.writeFileSync(outPath, spaShell, 'utf8');
          console.log(`  ↩  ${route.padEnd(30)} → fallback (data unavailable)`);
          skipped++;
        } else {
          fs.writeFileSync(outPath, `<!DOCTYPE html>\n${html}`, 'utf8');
          console.log(`  ✓  ${route.padEnd(30)} → ${path.relative(ROOT, outPath)}`);
          passed++;
        }
      } catch (err) {
        console.error(`  ✗  ${route.padEnd(30)} ERROR: ${err.message}`);
        // On error, ensure at minimum the SPA shell exists at that path
        const outPath = routeToFilePath(route);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        if (!fs.existsSync(outPath)) {
          fs.writeFileSync(outPath, spaShell, 'utf8');
        }
        failed++;
      } finally {
        await page.close();
      }
    }

    console.log(`\n→ Done. ${passed} prerendered, ${skipped} fallback, ${failed} error.\n`);
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
