# Changelog

## Unreleased

### Recordings you can hear
- Recordings play at a comfortable volume. Many are very quiet: PUC
  recordings measured 50 to 65 dB below full volume, about a thousandth of
  it. Before playing, the page filters out rumble below 200 Hz, measures the
  loudest moment of the call and raises the sound so it comes close to full
  volume (by up to 66 dB), with a limiter as a safety net. Works for
  BirdNET-Go and BirdWeather alike; browsers that can't process sound this
  way play the recording as it is.

### BirdWeather stations
- New: draw the plate from a public BirdWeather station, such as a PUC,
  instead of BirdNET-Go. Set `BIRDWEATHER_STATION` to the station's
  number (or its whole address); with that set, a station can also be
  chosen per browser under Station settings. The card shows what
  BirdWeather offers: calls by hour and by day, first heard (as a date)
  and last heard, days known at the station, and the latest recordings
  with playback of just the call.
- Birdsong asks BirdWeather itself, through six fixed questions under
  `/bw/` that take only station and species numbers and dates, with
  BirdWeather's certificate checked; there is no open way through to its
  API, and the page still makes only GET requests. BirdWeather is looked
  up when asked, so Birdsong starts even if DNS is briefly down.
- Stations whose time zone was never set now work: BirdWeather refuses any
  question that includes it, so it is asked separately and the hours fall
  back to the viewer's time zone. An unknown station number says so.
- Fixed: a first-heard date without a time no longer shows as the day
  before for stations west of Greenwich.

### Watch from anywhere, safely
- Cloudflare Tunnel support: `docker-compose.tunnel.yml` runs Birdsong with
  cloudflared, so it can be served at an HTTPS address with no ports opened
  on the router, behind a Cloudflare Access sign-in. Step-by-step guide in
  `docs/cloudflare-tunnel.md`; settings in `.env.example`.
- A second, internet-facing door on port 8081 for the tunnel: refuses
  requests that did not come through Cloudflare Access (setting:
  `REQUIRE_CLOUDFLARE_ACCESS`), rate-limits each visitor, logs who signed
  in, and sends HSTS and a stricter Content-Security-Policy.
- `ALLOWED_IPS`: let in the listed home internet addresses through the
  internet door without a sign-in, alone or alongside Cloudflare Access;
  paired with a Cloudflare firewall rule in the guide.
- Both containers run read-only with capabilities dropped, no privilege
  escalation and resource limits, on networks that keep cloudflared away
  from the LAN.

### Security
- Fixed: `/api` forwarded every request to BirdNET-Go, including its
  settings, sign-in, deleting and restarting, and BirdNET-Go is told to
  trust this container. Only the eight read-only calls the page makes are
  now passed on, and only as `GET` with plain paths.
- Each allowed call accepts only the exact query string the page sends,
  so BirdNET-Go options such as denoising, custom spectrogram sizes or
  large result pages cannot be asked for through Birdsong.
- Paths with encoded slashes or dots, doubled slashes or dot segments are
  refused everywhere (a crafted `//other.site/..%2F/` link could otherwise
  send the page's buttons to another site), and the page's own reloads
  always stay on Birdsong's address.
- Only the artwork's own kinds of file are copied into the image and served
  from `/art/`, never through symbolic links; nginx ignores `X-Accel-*`
  headers from BirdNET-Go; error replies are plain for every status.
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
- A malformed `BIRDNET_URL` (including one with a second line) now stops
  the container with a message instead of being written into nginx's config.
- README: BirdNET-Go no longer needs to trust Birdsong's address; with
  private mode off it treats Birdsong as an anonymous visitor, which is
  safer.
- `tests/smoke-test.sh`, run on every push, checks all of the above.

### Screens left on
- Works in older smart-TV browsers (Chromium 68 and later; LG TVs from
  2020): no newer script syntax, a stand-in for `replaceChildren`, and
  plain fallbacks for newer CSS (`clamp()`, `min()`, `inset`, flex `gap`,
  `:focus-visible`).
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
