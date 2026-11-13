# Changelog

## Unreleased

### Watch from anywhere, safely
- Cloudflare Tunnel support: `docker-compose.tunnel.yml` runs Birdsong with
  cloudflared, so it can be served at an HTTPS address with no ports opened
  on the router, behind a Cloudflare Access sign-in. Step-by-step guide in
  `docs/cloudflare-tunnel.md`; settings in `.env.example`.
- A second, internet-facing door on port 8081 for the tunnel: refuses
  requests that did not come through Cloudflare Access (setting:
  `REQUIRE_CLOUDFLARE_ACCESS`), rate-limits each visitor, logs who signed
  in, and sends HSTS and a stricter Content-Security-Policy.
- Both containers run read-only with capabilities dropped, no privilege
  escalation and resource limits, on networks that keep cloudflared away
  from the LAN.

### Security
- Fixed: `/api` forwarded every request to BirdNET-Go, including its
  settings, sign-in, deleting and restarting, and BirdNET-Go is told to
  trust this container. Only the eight read-only calls the page makes are
  now passed on, and only as `GET` with plain paths.
- No longer passed to BirdNET-Go: cookies, `Authorization`, Cloudflare's
  sign-in token, and `X-Forwarded-For` / `X-Real-IP` (which a visitor
  could set to pose as a LAN address). BirdNET-Go's cookies, CORS headers
  and error details are no longer passed back.
- The page's script and styles moved to `html/app.js` and `html/app.css`,
  so a Content-Security-Policy can forbid inline scripts entirely. Security
  headers on every response; `GET` and `HEAD` only; no server version.
- Removed the undocumented `?server=` link parameter, which let a link
  point the page at any server. The address now comes only from Station
  settings. Links on cards are followed only if they are `http(s)`.
- A malformed `BIRDNET_URL` now stops the container with a message instead
  of being written into nginx's config.
- `tests/smoke-test.sh`, run on every push, checks all of the above.

### Screens left on
- When BirdNET-Go cannot be reached as the page opens, it now keeps trying
  every minute and recovers by itself, instead of staying on the sample.
- Behind a sign-in such as Cloudflare Access, the page reloads to the
  sign-in when it lapses, instead of quietly going out of date.

### Fixes
- Fixed: the container failed to start with Unraid's per-container
  Tailscale enabled (`nginx: invalid option: "off"`).
- Fixed: a trailing slash on `BIRDNET_URL` is now removed as intended
  (the start-up script was not executable and was being skipped).

## 0.42 — 2026-11-10

First public release.

### The plate
- Every species heard in the chosen period drawn as one plate, each bird
  sized by its number of calls, with an index of species beneath.
- Four periods: today, seven days (the default), thirty days, since
  records began. Refreshes every minute.
- One-screen mode, on by default: the plate shrinks so the index fits
  beneath it with no scrolling.
- Birds never overlap; a strip of clear paper is kept around each.

### Artwork
- About 1,400 hand-cut 1800s illustrations from the Fugleramme project
  (after Gould, the von Wright brothers, Audubon and others) baked into
  the image, covering some 800 species.
- Cut-outs are tinted to the paper colour so their edges blend with the page.
- A bird Fugleramme lacks falls back to a public-domain plate from
  Wikimedia Commons, lifted off its page in the browser; hand-picked
  plates for the collared dove and mute swan.
- Each bird's card offers the other plates of its species to choose from;
  the choice is remembered per browser.

### Bird cards
- A sentence or two about the bird from its Wikipedia article.
- Calls heard, first and last heard, surest identification, days known
  at the station, family, order, and how common the bird is here at this
  season.
- A note when a bird is new to the station, the year or the season.
- Calls by hour of the day, and calls each day over the last thirty days.
- The latest recordings with the weather at the time, playback, and a
  spectrogram of the newest one.

### Container
- One image: the page, its typeface and the artwork, served by nginx,
  which also forwards /api to BirdNET-Go. One setting: BIRDNET_URL.
- Rebuilt weekly to pick up new Fugleramme artwork.
- Unraid template with icon; sample plate at /?demo.
