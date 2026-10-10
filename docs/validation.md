# RouteRelay — Validation procedures

**Automated** checks can be run by command; **manual** checks
need a human in a browser. Both are required before claiming a
task done. Run automated checks after every change; run manual
checks at least once before the demo.

## Automated

```bash
# 1. Typecheck + production build
npm run build
# Expect: tsc passes, vite emits dist/

# 2. Production preview serves the shell, SW, and hashed assets
npm run preview &
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4173/          # 200
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4173/sw.js    # 200
ASSET=$(ls dist/assets | grep '\.js$' | head -1)
curl -sS -o /dev/null -w "%{http_code}\n" "http://localhost:4173/assets/$ASSET"  # 200
kill %1

# 3. No external URLs in the built output (critical-path hygiene)
grep -rEo 'https?://[^"'"'"' )]+' dist | grep -v 'www.w3.org' | sort -u
# Expect: no output. (www.w3.org matches are XML namespaces inside
# React's bundle, not network fetches.)

# 4. Dev server smoke test
npm run dev &
curl -sS http://localhost:5173/ | grep -o 'src/main.tsx'
kill %1
```

## Manual

| # | Procedure | Pass condition |
|---|-----------|----------------|
| M1 | `npm run dev`, open http://localhost:5173 | Shell renders; DEMO MODE badge, status pills, both selectors, empty state visible; no console errors |
| M2 | Core flow: select incident sc01 + destination "North Terminal" | Results placeholder shows both; no errors |
| M3 | Refresh the page | Selection persists (localStorage) |
| M4 | Browser dev tools → Application → Storage → clear, then re-select | Storage pill still says "local (persistent)"; flow works |
| M5 | `npm run build && npm run preview`, open http://localhost:4173 | Production build renders identically |
| M6 | **First-load caching:** on M5 URL, reload once while online | DevTools → Application → Service Workers shows `/sw.js` active; Cache Storage contains routerelay-shell-v1 |
| M7 | **Airplane-mode reload:** enable airplane mode (or DevTools → Network → Offline), hard-reload M5 page | App shell + data render from cache; selectors work; no failed network requests |
| M8 | Back online; DevTools → Network: confirm no request is made to load demo data (it is bundled) | Data arrives inside the JS bundle, not via fetch |
| M9 | Missing/stale data simulation: edit `src/data/network.json` to invalid JSON, run `npm run build` | Build fails loudly — malformed bundled data cannot ship silently |
| M10 | Narrow viewport (~360px) | Layout stacks to one column; selectors usable |

## Notes

- Do **not** claim offline success because the dev server runs
  locally. Only M6+M7 (real browser, real airplane mode) count.
- The service worker's first load must be online; it then
  caches the shell. That is by design and must be stated in the
  demo, not hidden.
- If a manual check fails, record the failure in
  `docs/tasks.md` (uncheck the related task) rather than
  claiming it.

## CDP automation (optional, zero-dependency)

M1–M3, M6 and M7 were automated during preparation using
headless Chromium + the Chrome DevTools Protocol over Node's
built-in WebSocket (no Puppeteer/Playwright needed):

```bash
# terminal 1: production server
npm run build && npm run preview

# terminal 2: headless Chromium with remote debugging
chromium --headless=new --no-sandbox --disable-gpu \
  --remote-debugging-port=9222 --user-data-dir=/tmp/routerelay-cdp \
  about:blank

# terminal 3: a small Node script that connects to
# http://127.0.0.1:9222/json/list, then via WebSocket:
#   Page.navigate to http://localhost:4173/
#   Runtime.evaluate to read DOM state and fire select 'change' events
#   Network.emulateNetworkConditions {offline:true} + Page.navigate
#     to simulate airplane mode and confirm a cached render
```

Checks executed this way on 2026-10-10: shell content, selector
population, interaction-driven results placeholder, localStorage
persistence across hard reload, SW control + cache creation, and a
full render while the network stack was forced offline — all with
zero console errors.
