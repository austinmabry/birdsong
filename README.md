# Birdsong

![Birdsong showing a week of detections as a plate of 1800s bird illustrations](docs/screenshot.jpg)

Birdsong draws the birds your [BirdNET-Go](https://github.com/tphakala/birdnet-go)
station has heard as a single plate of hand-cut 1800s illustrations, each
bird sized by how often it called. It is one small Docker container with
one setting. It can also draw from a public
[BirdWeather](https://app.birdweather.com) station, such as a PUC, with no
BirdNET-Go at all.

Created by [Ed Stone](https://ed-stone.co.uk). Current version: 0.42
([changelog](CHANGELOG.md)); images are also tagged by version, e.g. `:0.42`.

## See it in action

[![A tour of Birdsong: the plate over different periods, and the cards for a robin and a little owl](docs/birdsong-v0.42.gif)](docs/birdsong-v0.42.mp4?raw=true)

Shown at double speed; [the full recording](docs/birdsong-v0.42.mp4?raw=true) has sound,
including a little owl heard in the small hours.

## What it shows

- **The plate:** every species heard in the chosen period, sized by its
  number of calls, with an index of species and counts beneath.
- **Periods:** today, seven days (the default), thirty days, or since
  records began. The plate refreshes every minute.
- **A card for each bird**, opened by selecting it:
  - the illustration, with the artist credited
  - a sentence or two about the bird, from Wikipedia
  - calls heard, first and last heard, surest identification, how long
    the species has been known at the station, family, order and how
    common it is locally at this season
  - a note when the bird is new to the station, the year or the season
  - calls by hour of the day, and calls each day for the last thirty days
  - the latest recordings, with the weather at the time, playback and a
    spectrogram; quiet recordings are raised to a comfortable volume as
    they play, with low rumble filtered out
  - other illustrations of the species to choose from
- **One-screen mode** (on by default): the plate shrinks so the index
  fits beneath it without scrolling. Switch it off under Station settings.

## Run it

    docker run -d --name birdsong --restart unless-stopped \
      -p 8095:80 \
      -e BIRDNET_URL=http://192.168.1.50:8080 \
      ghcr.io/dopeytree/birdsong:latest

Then open `http://<your-server>:8095`. `BIRDNET_URL` is the address of
your BirdNET-Go as the container can reach it: use the server's IP, not
`localhost`. That is the only setting.

- **Unraid:** install the template from the terminal, then Docker tab,
  Add Container, and choose `birdsong` under Template:

      wget -O /boot/config/plugins/dockerMan/templates-user/my-birdsong.xml \
        https://raw.githubusercontent.com/dopeytree/birdsong/main/unraid/birdsong.xml

- **Compose:** see `docker-compose.yml`.
- **Preview without a station:** open `/?demo` for a sample plate.

A password on BirdNET-Go is fine and recommended: everything Birdsong reads
is what BirdNET-Go shows any visitor, so Birdsong needs no sign-in. Only if
BirdNET-Go's **private mode** is on does it hide that too; then either switch
private mode off (best) or let this container's address bypass sign-in in
BirdNET-Go's security settings. The bypass trusts every container on the
same Docker host, so prefer the first. Either way, Birdsong passes on only
the handful of read-only calls the page makes, never BirdNET-Go's settings,
sign-in, deleting or restarting. Recordings and
spectrograms appear only if BirdNET-Go keeps audio clips, and weather
only if it has a weather provider switched on.

## Home Assistant

To put Birdsong on a Home Assistant dashboard, add a new view and give it
the **Grid** layout, then add a single **Webpage** (iframe) card with your
Birdsong address, for example `http://192.168.1.50:8095`. One-screen mode
(on by default) suits the card well.

If you open Home Assistant over HTTPS, the browser will refuse to embed a
plain-HTTP page inside it: serve Birdsong through your reverse proxy with
HTTPS and use that address in the card instead.

## From a BirdWeather station

A BirdWeather PUC uploads what it hears to BirdWeather rather than running
BirdNET-Go. To draw its plate, give the station's number instead of
`BIRDNET_URL`: the number at the end of the station's page,
`https://app.birdweather.com/stations/12345` (the whole address works too).

    docker run -d --name birdsong --restart unless-stopped \
      -p 8095:80 \
      -e BIRDWEATHER_STATION=12345 \
      ghcr.io/dopeytree/birdsong:latest

The station must be public; no token is needed. Birdsong asks BirdWeather's
public API itself, so the page and its data still share one address. It asks
only a fixed set of questions, filling in nothing but the station and species
numbers and the dates, and checks BirdWeather's certificate. Any BirdWeather
station works, not only a PUC; with the container set up for BirdWeather, a
different station can also be chosen per browser under Station settings.

BirdWeather has less to say about each bird than BirdNET-Go does. The
plate, the index, calls each day, last heard, how long the species has
been known at the station, and the latest recordings with playback (just
the call, with a second either side) all work. Some things differ:

- **First heard** is a date rather than a time: BirdWeather lists
  detections newest first and can't be asked for the oldest.
- **Calls by hour** covers today or the last seven days. BirdWeather only
  groups by the hour over about a week, so for thirty days and since
  records began the chart shows the last seven days, and says so. For a
  station with no time zone set, the hours are in the viewer's time zone.
- Family, order, how common the bird is at this season, surest
  identification, the new-to-the-station notes, weather at the time and
  spectrograms are left off the card; BirdWeather doesn't provide them.

## Watch from anywhere: Cloudflare Tunnel

To show Birdsong to family elsewhere (on their TV, say) at an HTTPS address
such as `https://birds.example.com`, with nothing opened on your router and a
sign-in that admits only the email addresses you list:

    cp .env.example .env && chmod 600 .env     # add your tunnel token and BirdNET-Go address
    docker compose -f docker-compose.tunnel.yml up -d --build

Instead of a sign-in, you can let in just your family's homes by their
static internet addresses. The step-by-step guide, covering both and the
Cloudflare side, is in [docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md).
The page runs in smart-TV browsers from about 2020 on (Chromium 68 or newer;
for LG, webOS 5 and later). See [Security](#security)
for what protects it.

## HTTPS with Tailscale

To give Birdsong an HTTPS address (which the Home Assistant iframe needs
when Home Assistant itself is HTTPS), Unraid's per-container Tailscale
works well:

1. Edit the container and switch on **Use Tailscale**.
2. Tailscale needs a persistent folder for its identity. The template
   ships one: a **Data folder** (`/mnt/user/appdata/birdsong` mapped to
   `/data`), which Tailscale finds on its own, so there is nothing to
   configure. If your container predates the Data folder, or you run
   plain `docker run`, add `-v /mnt/user/appdata/birdsong:/data`.
   Without it, Tailscale refuses to start, and would otherwise join the
   tailnet as a brand-new machine on every update.
3. Enable **Tailscale Serve** with port `80` (the container's internal
   port, not the LAN port), and make sure MagicDNS and HTTPS
   certificates are enabled for your tailnet (Tailscale admin, DNS).

Birdsong is then at `https://birdsong.<your-tailnet>.ts.net` with a real
certificate. Note that only devices on your tailnet can reach that
address; for every device on your LAN instead, put Birdsong behind a
reverse proxy such as Nginx Proxy Manager with its own certificate.

## What is inside the image

- The page (`html/index.html`, with its script in `html/app.js` and styles
  in `html/app.css`; plain files, no build step) and nginx, which also
  forwards the page's read-only `/api` calls to BirdNET-Go (or asks
  BirdWeather, when `BIRDWEATHER_STATION` is set) so the page and the data
  share one address.
- About 1,400 bird cut-outs covering some 800 species, from the
  [Fugleramme](https://github.com/arnegiacomo/fugleramme) project,
  fetched when the image is built.
- The IM Fell English typeface.

The image is rebuilt every Monday, which is how new Fugleramme artwork
arrives: update the container as you would any other.

## What still comes from the internet

- A bird with no Fugleramme cut-out falls back to an old plate from
  Wikimedia Commons, cut off its page in the browser. Failing that it
  uses BirdNET-Go's (or BirdWeather's) own photo, or just the bird's name.
- The description on each card comes from Wikipedia.

Both are skipped quietly when offline. Everything else is local, unless
the plate is drawn from a BirdWeather station, whose detections, pictures
and recordings come from BirdWeather.

## Settings

"Station settings" on the page holds one-screen mode, an optional
BirdNET-Go address override, an optional BirdWeather station (which takes
precedence over both BirdNET-Go and the container's station, when the
container is set up for BirdWeather), and the credits. These settings, the last
period chosen, and any illustration you pick for a bird are remembered
per browser, not shared between devices.

## Build it yourself

    docker build -t birdsong .
    docker build --build-arg FUGLERAMME_REF=v0.21.3 -t birdsong .   # pin the artwork

To pin a species to an illustration of your choice for everyone, add it
to `CURATED_RAW` near the top of `html/app.js`.

`tests/smoke-test.sh` checks a built image's security: it runs it read-only
beside a stand-in for BirdNET-Go and makes over a hundred requests against
both doors, from the page's own calls to path, query and protocol tricks
aimed at BirdNET-Go. It runs on every push.

    docker build -t birdsong:test . && tests/smoke-test.sh birdsong:test

## Security

Birdsong has two doors into the same page:

- **Port 80, the LAN door**, as it always was: for home, Home Assistant and
  Tailscale.
- **Port 8081, the internet door**, for a Cloudflare Tunnel only, and never
  published on the host. It refuses any request that has not come through
  Cloudflare Access, or, with `ALLOWED_IPS`, from one of the listed home
  internet addresses (see the [guide](docs/cloudflare-tunnel.md)). It limits each
  visitor's request rate, logs who signed in, and adds HSTS and a stricter
  Content-Security-Policy that names the only outside sites the page uses
  (Wikipedia and Wikimedia Commons).

On both doors:

- Only `GET` and `HEAD`, and only the page, its artwork and fonts, and eight
  read-only BirdNET-Go calls, each with exactly the query string the page
  sends. Everything else under `/api` is refused, paths with encoded
  slashes or dots included, so nothing can be steered to BirdNET-Go's
  settings, sign-in, deleting or restarting, or to costly options such as
  denoising or custom spectrograms.
- No cookies, sign-in tokens or forwarded addresses are passed to
  BirdNET-Go, and nothing it sends can set cookies, open the data to other
  sites or show its internal error messages.
- A Content-Security-Policy that allows no inline or outside scripts, plus
  `nosniff`, no referrer, and no version number in the server header.
- The page's BirdNET-Go address comes only from its own Station settings,
  never from the link that opened it, and it follows only `http(s)` links.
- Only the artwork's own kinds of file are served from `/art/`, and never
  through a symbolic link.
- BirdWeather, only when `BIRDWEATHER_STATION` is set: six fixed questions
  under `/bw/`, each taking only digits and dates, sent by Birdsong itself
  with BirdWeather's certificate checked. There is no general way through
  to BirdWeather's API.

`docker-compose.tunnel.yml` also runs both containers read-only, with every
Linux capability dropped except the four nginx needs to start, no privilege
escalation, cloudflared as a non-root user, memory, CPU and process limits,
and cloudflared and Birdsong on a private network with no way out. The
[tunnel guide](docs/cloudflare-tunnel.md#every-layer-and-what-it-stops) has
the full list and what each layer stops.

Found a security problem? Please report it privately to the repository owner
rather than in a public issue.

## Credits and licences

- Code in this repository: MIT, see `LICENSE`.
- Bird cut-outs: the *classic* style of Fugleramme by Arne Giacomo,
  after Gould, the von Wright brothers, Audubon and others,
  **CC BY-SA 4.0**. The image carries its `ATTRIBUTION.md` and manifest
  at `/art/`. Keep the credit shown on the page if you change it.
- Icon (`unraid/icon.png`): the robin cut-out from Fugleramme, after
  H. E. Dresser, CC BY-SA 4.0.
- Descriptions: Wikipedia, CC BY-SA.
- Fallback plates: public-domain works on Wikimedia Commons, chiefly
  *Nederlandsche Vogelen* (Nozeman & Sepp, 1770-1829), Koninklijke Bibliotheek.
- Typeface: IM Fell English by Igino Marini, SIL Open Font Licence
  (`html/fonts/OFL.txt`).
- BirdNET-Go is a separate project (CC BY-NC-SA 4.0, non-commercial) and
  is not included.
- BirdWeather is a separate service; detections are read from its public
  API only when a station is given.
