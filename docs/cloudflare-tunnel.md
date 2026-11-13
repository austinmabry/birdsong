# Birdsong on the internet, safely: Cloudflare Tunnel and Access

This guide puts Birdsong at an HTTPS address such as `https://birds.example.com`, so family
elsewhere can watch your garden's birds (on a TV, say), without opening anything on your
router and without letting strangers in.

Menu names below are Cloudflare's as of November 2026; they move from time to time.

## How it fits together

```
 Parents' TV ──HTTPS──▶ Cloudflare ──▶ Cloudflare Access ──▶ tunnel ──▶ cloudflared ──▶ Birdsong ──▶ BirdNET-Go
                        (certificate,   (sign-in: only the     (outgoing    (your server)   :8081        (LAN, read-only
                         firewall)       emails you list)       connection)                              calls only)
```

- **No ports are opened on your router.** cloudflared, running beside Birdsong, makes an
  *outgoing* connection to Cloudflare. Nothing on the internet can connect to your house.
- **Nobody reaches the page without signing in.** Cloudflare Access stops every visitor at
  Cloudflare's edge and lets through only the email addresses you list, after they type a
  code sent to that address.
- **Even a signed-in visitor can only look.** Birdsong passes on just the eight read-only
  BirdNET-Go calls the page uses. BirdNET-Go's settings, sign-in, deleting and restarting
  are out of reach, whatever is typed into the address bar.

### Every layer, and what it stops

| Layer | What it does | What it stops |
|---|---|---|
| Cloudflare Tunnel | Outgoing connection only; no port forwarding | Port scans and direct attacks on your home IP |
| Cloudflare Access | Email one-time code for listed addresses only | Everyone you have not invited |
| cloudflared, *Protect with Access* | Checks the signature on Access's token before passing a request on | Requests that slip past Access, e.g. if the Access app is deleted or mis-set |
| Birdsong's internet door (port 8081) | Refuses any request without an Access token (fail closed) | A tunnel set up without Access ending up open to everyone |
| Read-only allow-list | 8 GET calls to BirdNET-Go, each with exactly the query string the page sends; plain paths only; no cookies, tokens or forwarded addresses passed on; BirdNET-Go's error messages hidden | Changing settings, deleting detections, restarting, costly options (denoising, custom spectrograms, huge result pages), path tricks that sneak past the list, posing as a LAN client |
| Rate limits | 20 page and 5 data requests a second per visitor, with headroom for bursts | Hammering BirdNET-Go |
| Browser protections | Strict Content-Security-Policy (no inline or outside scripts), HSTS, no framing, no referrer, no sniffing | Script injection, clickjacking, leaking the address to other sites |
| Containers | Read-only, all Linux capabilities dropped (nginx keeps four to start), no privilege escalation, cloudflared not root, memory/CPU/process limits, rotated logs | A bug in nginx or cloudflared becoming a foothold |
| Networks | cloudflared and Birdsong share a network with no way out; cloudflared cannot reach BirdNET-Go or your LAN through it | cloudflared being used to reach other machines at home |

The LAN door (`http://<server>:8089`, set by `LAN_PORT` in `.env`) is for use at home, with the same
read-only allow-list but no sign-in. It turns away anything that arrived through Cloudflare,
so pointing the tunnel at it by mistake fails closed. Never forward that port on your router:
the tunnel replaces that. Docker publishes ports past host firewalls such as ufw, so on a
server with a public IP address of its own, set `LAN_BIND` in `.env` to the server's LAN
address (or `127.0.0.1`).

## What you need

- A domain name whose DNS is on Cloudflare. The free plan is enough. (If you have no domain,
  one costs around $10 a year from Cloudflare Registrar or elsewhere.)
- The server where BirdNET-Go runs, or any machine at home that can reach it, with Docker
  and Docker Compose. With a BirdWeather station (a PUC, say) instead of BirdNET-Go, any
  machine with Docker will do. On Unraid, the *Docker Compose Manager* plugin runs compose files.
- This repository on that machine: `git clone https://github.com/austinmabry/birdsong`.
- Two-factor authentication on your Cloudflare account (**My Profile > Authentication**).
  Whoever controls the account controls who gets in, so this matters more than anything
  else here.

## 1. Set up the sign-in first

Do this before the tunnel exists, so there is never a moment when the page is open.

1. In the Cloudflare dashboard, open **Zero Trust**. The first time, pick a team name
   (it becomes `<team>.cloudflareaccess.com`) and the **Free** plan (up to 50 users; a card
   may be asked for but is not charged).
2. **Zero Trust > Integrations > Identity providers > Add new identity provider >
   One-time PIN.** This is the "we email you a code" sign-in; nobody needs an account
   anywhere.
3. **Zero Trust > Access controls > Applications > Add an application > Self-hosted.**
   - Name: `Birdsong`.
   - Domain: `birds` . `example.com` (your subdomain and domain).
   - **Session Duration: 1 month**, the longest allowed, so the TV rarely asks again.
   - Add a policy: **Action: Allow**, **Include: Emails**, and list each address:
     yours and your parents'. Do **not** use "Emails ending in" or "Everyone", and do not
     allow by "Login Methods: One-time PIN" alone: that lets in anyone with any email.
   - Login methods: **One-time PIN** only.
   - Save.
4. Open the application again and note its **Application Audience (AUD) Tag**
   (under **Additional settings**). You need it, and your team name, in step 3.

### Or: let in your homes by internet address, with no sign-in

If the people watching have static home internet addresses, you can skip the sign-in
altogether: only those homes can open the page, and nothing is ever typed on the TV.
Two locks do this, one at Cloudflare and one in Birdsong, each enough on its own. Use this
**instead of** the Access application above (don't create one for this address, or delete it).

1. **Find each home's address as Cloudflare sees it.** On a device using that home's
   internet, ideally the TV's own browser, open `https://www.cloudflare.com/cdn-cgi/trace`
   and note the `ip=` line.
   - If it has colons (`ip=2001:db8:...`), that home reaches Cloudflare over IPv6, and IPv6
     addresses change within the home's range. List the home's whole IPv6 range (the
     "prefix", such as `2001:db8:1234:5600::/56`, shown on the router's internet status page
     or by the provider) as well as its IPv4 address.
   - If the router's own internet (WAN) address differs from the `ip=` IPv4 address, the
     provider shares one address among many customers (CGNAT): letting it in would let them
     in too. Use the emailed code for that home instead.
2. **Lock at Cloudflare: a firewall rule.** **Security rules > Create rule > Custom rules**,
   name it `Birdsong: our homes only`, choose **Edit expression** and enter (with your
   hostname and addresses):

   ```
   (http.host eq "birds.example.com" and not ip.src in {203.0.113.7 198.51.100.9 2001:db8:1234:5600::/56})
   ```

   Action **Block**, then **Deploy**. Everyone else gets Cloudflare's "blocked" page.
3. **Lock in Birdsong**, in `.env` (step 2 below):

   ```
   REQUIRE_CLOUDFLARE_ACCESS=false
   ALLOWED_IPS=203.0.113.7, 198.51.100.9, 2001:db8:1234:5600::/56
   ```

   The internet door then admits only these addresses, as Cloudflare reports them, which a
   visitor cannot fake. The LAN door at home is unaffected.
4. In step 3, leave **Protect with Access** off: there is no Access sign-in to check.

What to know about this choice:

- Anyone using either home's internet can watch: visitors on the Wi-Fi, and any device on
  that network. For pictures of birds that is usually fine; remember the recordings.
- If a provider ever changes an address, that home sees the "blocked" page until you
  update both the rule and `ALLOWED_IPS` (then `docker compose -f docker-compose.tunnel.yml up -d`).
- Birdsong's log shows which address each visit came from, not who it was.
- **Both at once:** keep `REQUIRE_CLOUDFLARE_ACCESS=true` and set `ALLOWED_IPS`. Listed homes
  get straight in and anyone else (you, travelling) signs in with an emailed code. On the
  Cloudflare side that needs, instead of the firewall rule, the Access application with two
  policies: **Bypass** with **Include: IP ranges** (the homes) and the **Allow** policy for
  emails; and **Protect with Access** off, since bypassed visits carry no token.

## 2. Create the tunnel and start Birdsong

1. **Networking > Tunnels > Create a tunnel.** Name it `birdsong`.
2. When it shows install commands, choose **Docker** and copy only the token: the long
   string starting `eyJ` after `--token`. **Do not run the command it shows**; the compose
   file below runs cloudflared for you, hardened.
3. On the server, in the repository folder:

   ```bash
   cp .env.example .env && chmod 600 .env
   ```

   Edit `.env`: set `BIRDNET_URL` to your BirdNET-Go address (for example
   `http://192.168.1.50:8080`), or, for a BirdWeather station such as a PUC, leave
   `BIRDNET_URL` empty and set `BIRDWEATHER_STATION` to the number at the end of the
   station's page (`app.birdweather.com/stations/12345`). Paste the token after `TUNNEL_TOKEN=`.
4. Start it:

   ```bash
   docker compose -f docker-compose.tunnel.yml up -d --build
   ```

5. Within a minute the tunnel shows as **Healthy** in the dashboard. Its logs:

   ```bash
   docker compose -f docker-compose.tunnel.yml logs cloudflared
   ```

### On Unraid

The same compose file runs on Unraid; only getting the files and the `docker compose`
command differ. Everything below is typed in Unraid's terminal (the `>_` icon at the top
right of the web interface).

1. From **Apps**, install **Docker Compose Manager**. It provides the `docker compose` command.
2. If you installed Birdsong earlier from its Unraid template, stop and remove that container
   in the **Docker** tab: the compose file uses the same container name (`birdsong`).
3. Fetch this repository into appdata. Unraid has no `git` of its own, so a throwaway git
   container does it:

   ```bash
   docker run --rm -v /mnt/user/appdata:/git alpine/git clone https://github.com/austinmabry/birdsong birdsong-src
   ```

   (Add `--branch <name>` after `clone` to take a branch other than `main`. If the repository
   is private, download it as a ZIP from GitHub instead and unzip it into
   `/mnt/user/appdata/birdsong-src` over the network share.)
4. Make the settings file, then fill it in with `nano .env` (Ctrl+O saves, Ctrl+X quits):

   ```bash
   cd /mnt/user/appdata/birdsong-src && cp .env.example .env && chmod 600 .env
   ```

   `BIRDNET_URL` is your Unraid server's IP and BirdNET-Go's port, e.g.
   `http://192.168.1.10:8080`; or, for a PUC or other BirdWeather station, leave it empty and
   set `BIRDWEATHER_STATION` to the station's number. If BirdNET-Go has its own IP address on `br0`, Birdsong can
   only reach it with **Settings > Docker > Host access to custom networks** switched on
   (Advanced view; the Docker service must be stopped to change it).
5. Build and start:

   ```bash
   docker compose -f docker-compose.tunnel.yml up -d --build
   ```

Both containers then appear in the **Docker** tab; start, stop and logs work there, but
change settings in `.env` and run the command above again rather than editing them in the
tab. They come back by themselves after a reboot. To update later:

```bash
cd /mnt/user/appdata/birdsong-src && docker run --rm -v "$PWD":/git alpine/git pull
```

```bash
docker compose -f docker-compose.tunnel.yml build --pull && docker compose -f docker-compose.tunnel.yml up -d
```

Unraid's own **Check for updates** cannot update an image built on the server, so use these.

## 3. Publish Birdsong through the tunnel

1. **Networking > Tunnels >** `birdsong` **> Routes > Add route > Published application.**
2. Subdomain `birds`, Domain `example.com`, **Service URL `http://birdsong:8081`**.
   (Port 8081, the internet door, not 80.)
3. Open **Additional application settings > Access** and switch on **Protect with Access**.
   Enter your team name and the AUD tag from step 1. cloudflared now checks every request's
   Access token itself before Birdsong sees it. Do not skip this: Birdsong can only see that
   a token is present; this is what checks it is genuine.
4. Save. Cloudflare creates the DNS record and the HTTPS certificate on its own.

## 4. Check the locks

If you let in homes by address instead of a sign-in: from one of those homes the page
opens straight away; from a phone on mobile data (Wi-Fi off) Cloudflare shows its
"blocked" page. Try `https://birds.example.com/api/v2/settings` from a listed home: it says
*Not available.* The rest of this step is for the sign-in.

From any computer:

```bash
curl -sI https://birds.example.com/ | head -n 3
```

You should get a `302` redirect to `https://<team>.cloudflareaccess.com/...`: the sign-in.
Anything else (a `200`, or Birdsong's page) means Access is not in front; go back to step 1.

```bash
curl -sI https://birds.example.com/api/v2/settings | head -n 1
```

Also a `302` to the sign-in. Then open the address in a private browser window, sign in
with a listed email, and the plate appears. Try `https://birds.example.com/api/v2/settings`
while signed in: it says *Not available.*

Birdsong's log names each visitor and who they signed in as:

```bash
docker compose -f docker-compose.tunnel.yml logs -f birdsong
```

```
203.0.113.7 [13/Nov/2026:18:02:11 +0000] "GET / HTTP/1.1" 200 3946 "Mozilla/5.0 (SMART-TV ...)" cf_ray=8e1f... country=US user=mum@example.com
```

## 5. Recommended Cloudflare settings for the domain

All on the free plan:

- **SSL/TLS > Edge Certificates**
  - **Always Use HTTPS**: on.
  - **Minimum TLS Version**: 1.2. Any TV made in roughly the last ten years copes; if an
    old set cannot open the page, this is the setting to try lowering.
  - HSTS: Birdsong already sends it for its own address, so there is no need to switch it
    on for the whole domain.
- **Security rules > Create rule > Custom rules**: block other countries. For example,
  *Field* `Hostname` *equals* `birds.example.com` **and** *Country* *is not in* `United States`,
  action **Block**. Add your parents' country if it differs, and remember it if anyone travels.
- **Bot Fight Mode**: leave it off. It cannot be made to skip one page, and it is known to
  trip over smart-TV browsers. Access already keeps bots out.

## 6. On the TV

**Which TVs.** Birdsong runs in the built-in browser of TVs whose browser is Chromium 68 or
newer. For LG that is every model from 2020 on (webOS 5 and later): model names ending in
X (such as OLED55CX, 2020), 1 (C1, 2021), 2, 3, 4 and so on. LG's 2018–2019 sets (C8, C9,
B9 and the like; webOS 4, Chromium 53) have a browser too old for the page; on those, use
a streaming stick with a modern browser, or cast a browser tab from a phone or laptop.

If you let in homes by address, the TV opens the page with no sign-in at all; just
bookmark it. With the emailed code:

1. Open the TV's web browser and go to `https://birds.example.com`.
2. Cloudflare's sign-in page asks for an email: enter one you listed, choose
   **Send login code**, and type the six-digit code from that email (it arrives from
   `noreply@notify.cloudflare.com` and lasts ten minutes) with the remote.
3. The plate appears. One-screen mode, on by default, fits it to the screen. Bookmark
   it or pin it to the TV's home screen.

It stays signed in for a month. When the sign-in lapses, the page reloads itself to the
sign-in screen rather than going quietly out of date; sign in again the same way.
Birdsong also keeps trying if BirdNET-Go is briefly unreachable, and picks up again by
itself when it is back.

If the TV's own browser is awkward, a streaming stick with a proper browser, or casting a
browser tab from a phone or laptop, works just as well.

## Keeping it safe over time

- **Update monthly.** In the repository folder:

  ```bash
  git pull
  docker compose -f docker-compose.tunnel.yml build --pull
  docker compose -f docker-compose.tunnel.yml up -d
  ```

  This rebuilds Birdsong on the latest nginx and fetches new artwork. cloudflared is pinned
  in `docker-compose.tunnel.yml` (`cloudflare/cloudflared:2026.11.0`); raise the tag to the
  newest release from time to time ([releases](https://github.com/cloudflare/cloudflared/releases)).
- **If the token leaks** (a screenshot, a pasted `.env`), use **Rotate token** on the
  tunnel, put the new one in `.env`, and run `up -d` again.
- **Removing someone**: delete their email from the Access policy. To sign everyone out at
  once, use **Revoke existing tokens** on the application.
- **Glance at Access's sign-in logs** now and then (under **Zero Trust > Insights**), and at
  Birdsong's own log, which names who signed in (step 4).
- **Recordings** can catch voices in the background. Anyone signed in can play recent
  recordings of each species, as at home. BirdNET-Go's privacy filter, which discards
  clips with human speech, is worth switching on.
- **BirdNET-Go should treat Birdsong as a stranger** (with BirdNET-Go only). Keep BirdNET-Go on your LAN only,
  with its own password on and **private mode off**, and do not add Birdsong (or the Docker
  host) to its trusted addresses. Everything Birdsong reads is what BirdNET-Go shows any
  visitor, so nothing is lost, and anything that somehow got past Birdsong's checks would
  still meet BirdNET-Go's sign-in. If you need private mode on, BirdNET-Go must trust the
  address Birdsong's requests come from, which is the Docker host's: every container on
  that server, cloudflared included. Then also use the firewall rule below that stops
  cloudflared reaching your LAN.

## Optional: a firewall around the containers

The compose file names its Docker bridges `bs-lan` and `bs-egress`, so a host firewall can
narrow what each container reaches. These `iptables` rules (for comfortable Linux users)
let Birdsong reach only BirdNET-Go, and stop cloudflared reaching anything on your home
network. Replace `192.168.1.50` and `8080` with your BirdNET-Go:

```bash
sudo iptables -I DOCKER-USER 1 -i bs-egress -d 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16 -j DROP
sudo iptables -I DOCKER-USER 1 -i bs-lan -j DROP
sudo iptables -I DOCKER-USER 1 -i bs-lan -d 192.168.1.50 -p tcp --dport 8080 -j RETURN
sudo iptables -I DOCKER-USER 1 -i bs-lan -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
```

If the plate comes from a BirdWeather station, leave out the two `bs-lan` rules: Birdsong then
needs to reach BirdWeather on the internet. They apply to traffic leaving a container for another machine; they do not survive a
reboot until saved the way your system does it (for example `netfilter-persistent save`,
or a start-up script on Unraid). Check the page still loads afterwards. They do not
apply when BirdNET-Go runs in a container on the same Docker network as Birdsong.

## Trouble

| What you see | Likely cause |
|---|---|
| *Not available.* on a white page, for every visitor | The internet door saw no Access token: the Access application does not cover this address, or the route points at port 80. Check step 1's domain and step 3's `http://birdsong:8081`. |
| A 403 or 502 error after signing in (not *Not available.*) | cloudflared turned the request away: *Protect with Access* has the wrong team name or AUD tag, or cloudflared cannot reach `<team>.cloudflareaccess.com` to check the token. |
| The tunnel never turns Healthy | The token in `.env` is incomplete, or outgoing port 7844 is blocked; see `logs cloudflared`. |
| "BirdWeather has no public station ..." | Check the number at the end of the station's page, and that the station is public on BirdWeather. |
| The sample plate, "BirdNET-Go could not be reached" | `BIRDNET_URL` is wrong or unreachable from the container. Test from the server: `curl http://192.168.1.50:8080/api/v2/analytics/species/summary`. |
| "BirdNET-Go asked for a sign-in" | BirdNET-Go's private mode is on. Switch it off (best), or see "BirdNET-Go should treat Birdsong as a stranger" above. |
| The container stops at once, "BIRDNET_URL should look like..." | `BIRDNET_URL` must be just `http://address:port`, with no path. |
| Cloudflare's "blocked" page at a home you listed | That home's address has changed, or it reaches Cloudflare over IPv6. Check `https://www.cloudflare.com/cdn-cgi/trace` from there and update the firewall rule and `ALLOWED_IPS`. |
| *Not available.* at a home you listed, but no "blocked" page | The address is in the Cloudflare rule but not in `ALLOWED_IPS` (or `REQUIRE_CLOUDFLARE_ACCESS` is still true with no sign-in). |
| The page stays on "Listening…" on a TV | The TV's browser is too old (LG before 2020); see step 6. |
