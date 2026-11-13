#!/usr/bin/env bash
# Security smoke test for the Birdsong image.
#
#   tests/smoke-test.sh [image]        (default image: birdsong:test)
#
# Starts the image next to a stand-in for BirdNET-Go (tests/mock-birdnet-go.conf, which echoes
# back what reached it), runs it the way docker-compose.tunnel.yml does (read-only, no
# capabilities beyond nginx's own), and checks both doors: the LAN door (80) and the internet
# door (8081) that a Cloudflare Tunnel uses. Needs docker and curl. Cleans up after itself.
set -uo pipefail

IMAGE="${1:-birdsong:test}"
MOCK_IMAGE="${MOCK_IMAGE:-nginx:alpine}"
HERE="$(cd "$(dirname "$0")" && pwd)"
RUN="bs-smoke-$$"
NET="$RUN-net"
TMP="$(mktemp -d)"
FAILS=0 PASSES=0

cleanup() {
    docker rm -f "$RUN-mock" "$RUN-app" "$RUN-open" "$RUN-bad" >/dev/null 2>&1
    docker network rm "$NET" >/dev/null 2>&1
    rm -rf "$TMP"
}
trap cleanup EXIT

pass() { PASSES=$((PASSES + 1)); printf '  ok    %s\n' "$1"; }
fail() { FAILS=$((FAILS + 1)); printf '  FAIL  %s\n' "$1"; [ -n "${2:-}" ] && printf '        %s\n' "$2"; }

# req PORT PATH [curl args...]: sets CODE, BODY (file) and HEADERS (file)
req() {
    local port="$1" path="$2"; shift 2
    BODY="$TMP/body" HEADERS="$TMP/headers"
    CODE=$(curl -sS --path-as-is -o "$BODY" -D "$HEADERS" -w '%{http_code}' "$@" "http://127.0.0.1:$port$path" 2>/dev/null || echo 000)
}
header() { grep -i "^$1:" "$HEADERS" | head -1 | cut -d: -f2- | sed 's/^ *//; s/\r$//'; }

# expect_code LABEL WANT PORT PATH [curl args...]
expect_code() {
    local label="$1" want="$2"; shift 2
    req "$@"
    if [ "$CODE" = "$want" ]; then pass "$label ($CODE)"; else fail "$label" "wanted $want, got $CODE: $(head -c 200 "$BODY")"; fi
}
# blocked LABEL PORT PATH [curl args...]: must be refused, and must never reach BirdNET-Go
blocked() {
    local label="$1"; shift
    req "$@"
    if [ "${CODE:0:1}" = 4 ] && ! grep -q '"echo"' "$BODY"; then pass "$label ($CODE)"; else fail "$label" "got $CODE: $(head -c 200 "$BODY")"; fi
}
body_has()     { if grep -q -- "$2" "$BODY"; then pass "$1"; else fail "$1" "body: $(head -c 300 "$BODY")"; fi; }
body_lacks()   { if grep -q -- "$2" "$BODY"; then fail "$1" "body: $(head -c 300 "$BODY")"; else pass "$1"; fi; }
header_is()    { local v; v="$(header "$2")"; if [ "$v" = "$3" ]; then pass "$1"; else fail "$1" "$2: '$v'"; fi; }
header_has()   { local v; v="$(header "$2")"; if [[ "$v" == *"$3"* ]]; then pass "$1"; else fail "$1" "$2: '$v'"; fi; }
header_lacks() { local v; v="$(header "$2")"; if [ -n "$v" ] && [[ -z "${3:-}" || "$v" == *"$3"* ]]; then fail "$1" "$2: '$v'"; else pass "$1"; fi; }

HARDENED=(--read-only
    --tmpfs /etc/nginx/conf.d:size=1m --tmpfs /var/cache/nginx:size=16m
    --tmpfs /run:size=1m --tmpfs /tmp:size=8m
    --cap-drop ALL --cap-add CHOWN --cap-add SETUID --cap-add SETGID --cap-add NET_BIND_SERVICE
    --security-opt no-new-privileges:true --pids-limit 200)

docker network create "$NET" >/dev/null
docker run -d --name "$RUN-mock" --network "$NET" --network-alias birdnet \
    -v "$HERE/mock-birdnet-go.conf:/etc/nginx/conf.d/default.conf:ro" "$MOCK_IMAGE" >/dev/null
docker run -d --name "$RUN-app" --network "$NET" "${HARDENED[@]}" \
    -e BIRDNET_URL=http://birdnet:8080/ \
    -p 127.0.0.1::80 -p 127.0.0.1::8081 "$IMAGE" >/dev/null

for _ in $(seq 1 40); do
    [ "$(docker inspect -f '{{.State.Health.Status}}' "$RUN-app" 2>/dev/null)" = healthy ] && break
    [ "$(docker inspect -f '{{.State.Running}}' "$RUN-app" 2>/dev/null)" = true ] || break
    sleep 1
done
LAN=$(docker port "$RUN-app" 80/tcp | head -1 | sed 's/.*://')
NET_DOOR=$(docker port "$RUN-app" 8081/tcp | head -1 | sed 's/.*://')
if [ -z "$LAN" ] || [ -z "$NET_DOOR" ]; then
    echo "The container did not start:"; docker logs "$RUN-app" 2>&1 | tail -20; exit 1
fi
# The internet door only answers requests that came through Cloudflare Access.
CF=(-H "Cf-Access-Jwt-Assertion: test.token.value" -H "CF-Connecting-IP: 203.0.113.7")

echo "Container"
[ "$(docker inspect -f '{{.State.Health.Status}}' "$RUN-app")" = healthy ] && pass "healthy while read-only with dropped capabilities" || fail "healthcheck" "$(docker logs "$RUN-app" 2>&1 | tail -5)"

echo "LAN door: the page"
expect_code "page" 200 "$LAN" /
header_has  "CSP allows only Birdsong's own scripts" Content-Security-Policy "script-src 'self';"
header_lacks "CSP has no unsafe-inline" Content-Security-Policy "unsafe-inline"
header_is   "nosniff" X-Content-Type-Options nosniff
header_is   "Server header has no version" Server nginx
header_lacks "LAN door still allows framing (Home Assistant)" X-Frame-Options
body_lacks  "no inline script in the page" "<script>"
expect_code "app.js" 200 "$LAN" /app.js
expect_code "app.css" 200 "$LAN" /app.css
expect_code "font" 200 "$LAN" /fonts/IMFeENrm28P.ttf
expect_code "artwork manifest" 200 "$LAN" /art/artwork/classic/manifest.json
header_has  "artwork is cached" Cache-Control "max-age=604800"
header_has  "security headers survive on cached files" Content-Security-Policy "default-src 'none'"
expect_code "healthz" 200 "$LAN" /healthz
expect_code "Cloudflare traffic sent to the LAN door by mistake is refused" 403 "$LAN" / -H "CF-Ray: 8d2c1a2b3c4d5e6f-LHR"
expect_code "robots.txt" 200 "$LAN" /robots.txt
blocked "unknown file" "$LAN" /etc/passwd
blocked "dot file" "$LAN" /.git/config
blocked "traversal" "$LAN" /art/../../../../etc/passwd
body_lacks "malformed requests get the plain reply" "nginx"
blocked "directory listing" "$LAN" /art/
body_lacks "error pages do not name the server" "nginx"
blocked "POST" "$LAN" / -X POST -d x=1
blocked "TRACE" "$LAN" / -X TRACE
blocked "OPTIONS" "$LAN" / -X OPTIONS

echo "LAN door: BirdNET-Go calls the page makes"
expect_code "species summary" 200 "$LAN" /api/v2/analytics/species/summary
body_has    "summary comes from BirdNET-Go" "Erithacus rubecula"
header_lacks "no cookies from BirdNET-Go" Set-Cookie
header_lacks "no CORS opening from BirdNET-Go" Access-Control-Allow-Origin
header_lacks "no X-Powered-By" X-Powered-By
header_is   "BirdNET-Go answers are not cached" Cache-Control "private, no-store"
expect_code "species info" 200 "$LAN" "/api/v2/species?scientific_name=Turdus%20merula" \
    -H "Cookie: birdnet_session=abc" -H "Authorization: Bearer abc" -H "X-Forwarded-For: 192.168.1.10" \
    -H "X-Real-IP: 192.168.1.10" -H "Cf-Access-Jwt-Assertion: secret.jwt" -H "Range: bytes=0-1"
body_has   "cookie not forwarded" '"cookie":""'
body_has   "Authorization not forwarded" '"authorization":""'
body_has   "X-Forwarded-For not forwarded" '"xff":""'
body_has   "X-Real-IP not forwarded" '"xrealip":""'
body_has   "Cloudflare token not forwarded" '"jwt":""'
body_has   "Range is forwarded (audio seeking)" '"range":"bytes=0-1"'
body_has   "Birdsong names itself to BirdNET-Go" '"ua":"Birdsong"'
expect_code "daily" 200 "$LAN" "/api/v2/analytics/species/daily?date=2026-11-13"
expect_code "hourly" 200 "$LAN" "/api/v2/analytics/time/distribution/hourly?species=Turdus%20merula&start_date=2026-11-01&end_date=2026-11-13"
expect_code "trend" 200 "$LAN" "/api/v2/analytics/time/daily?species=Turdus%20merula&start_date=2026-11-01&end_date=2026-11-13"
expect_code "recordings" 200 "$LAN" "/api/v2/detections?species=Turdus%20merula&numResults=4&includeWeather=true"
expect_code "spectrogram" 200 "$LAN" "/api/v2/spectrogram/123?size=md"
expect_code "audio" 200 "$LAN" /api/v2/audio/123
expect_code "species photo" 200 "$LAN" /api/v2/media/image/Turdus%20merula
expect_code "BirdNET-Go error replaced" 500 "$LAN" "/api/v2/species?scientific_name=Boom"
body_lacks "BirdNET-Go error details hidden" "secret"

echo "LAN door: everything else in BirdNET-Go is out of reach"
blocked "settings" "$LAN" /api/v2/settings
blocked "settings section" "$LAN" /api/v2/settings/security
blocked "sign-in" "$LAN" /api/v2/auth/login -X POST -d '{}'
blocked "restart" "$LAN" /api/v2/control/restart -X POST
blocked "delete a detection" "$LAN" /api/v2/detections/1 -X DELETE
blocked "one detection" "$LAN" /api/v2/detections/1
blocked "clip extraction" "$LAN" /api/v2/audio/1/clip -X POST
blocked "spectrogram generation" "$LAN" /api/v2/spectrogram/1/generate -X POST
blocked "POST to an allowed route" "$LAN" /api/v2/analytics/species/summary -X POST
blocked "huge result count" "$LAN" "/api/v2/detections?numResults=1000"
blocked "missing result count" "$LAN" "/api/v2/detections?species=x"
blocked "old API" "$LAN" /api/v1/detections
blocked "audio by file name" "$LAN" /api/v2/media/audio/clip.wav
blocked "unknown API path" "$LAN" /api/v2/anything

echo "LAN door: path tricks"
blocked "dot-dot" "$LAN" /api/v2/species/../settings
blocked "encoded slash and dots" "$LAN" "/api/v2/settings/..%2F..%2Fv2%2Fspecies"
blocked "encoded dots" "$LAN" "/api/v2/settings/%2e%2e/species"
blocked "encoded letter" "$LAN" "/api/v2/%73pecies"
blocked "double slash" "$LAN" "/api/v2//species"
blocked "audio id with traversal" "$LAN" "/api/v2/audio/1%2F..%2F..%2Fsettings"
blocked "photo name with traversal" "$LAN" "/api/v2/media/image/..%2F..%2Fsettings"
blocked "backslash" "$LAN" '/api/v2/species%5C..%5Csettings'
blocked "semicolon parameter" "$LAN" '/api/v2/species;x=1'

echo "Internet door (Cloudflare Tunnel)"
expect_code "refused without Cloudflare Access" 403 "$NET_DOOR" /
body_lacks "refusal does not name the server" "nginx"
expect_code "page through Cloudflare Access" 200 "$NET_DOOR" / "${CF[@]}"
header_has  "HSTS" Strict-Transport-Security "max-age=31536000"
header_is   "no framing" X-Frame-Options DENY
header_has  "CSP forbids framing" Content-Security-Policy "frame-ancestors 'none'"
header_lacks "CSP lists exact hosts, no http: wildcard" Content-Security-Policy " http:"
header_has  "not indexed" X-Robots-Tag noindex
expect_code "API through Cloudflare Access" 200 "$NET_DOOR" "/api/v2/species?scientific_name=Turdus%20merula" "${CF[@]}"
body_has    "Cloudflare token not forwarded to BirdNET-Go" '"jwt":""'
body_has    "visitor address not forwarded to BirdNET-Go" '"cfip":""'
blocked "settings" "$NET_DOOR" /api/v2/settings "${CF[@]}"
blocked "delete" "$NET_DOOR" /api/v2/detections/1 -X DELETE "${CF[@]}"
blocked "healthz is LAN-only" "$NET_DOOR" /healthz "${CF[@]}"
blocked "API refused without Cloudflare Access" "$NET_DOOR" /api/v2/analytics/species/summary

limited=0
for _ in $(seq 1 70); do
    req "$NET_DOOR" /api/v2/analytics/species/summary "${CF[@]}"
    [ "$CODE" = 429 ] && limited=$((limited + 1))
done
[ "$limited" -gt 0 ] && pass "API rate limit per visitor ($limited of 70 refused)" || fail "API rate limit" "no 429 in 70 rapid requests"
expect_code "another visitor is not limited" 200 "$NET_DOOR" /api/v2/analytics/species/summary \
    -H "Cf-Access-Jwt-Assertion: x" -H "CF-Connecting-IP: 198.51.100.9"
lan_limited=0
for _ in $(seq 1 70); do req "$LAN" /api/v2/analytics/species/summary; [ "$CODE" = 429 ] && lan_limited=$((lan_limited + 1)); done
[ "$lan_limited" = 0 ] && pass "LAN door is not rate limited" || fail "LAN door rate limited" "$lan_limited refused"
docker logs "$RUN-app" >"$TMP/log" 2>&1
grep -q '^203.0.113.7 .*cf_ray=' "$TMP/log" && pass "log names the visitor, not cloudflared" || fail "visitor address in log"

echo "Settings"
docker run -d --name "$RUN-open" --network "$NET" -e BIRDNET_URL=http://birdnet:8080 \
    -e REQUIRE_CLOUDFLARE_ACCESS=false -p 127.0.0.1::8081 "$IMAGE" >/dev/null
sleep 2
OPEN=$(docker port "$RUN-open" 8081/tcp | head -1 | sed 's/.*://')
expect_code "REQUIRE_CLOUDFLARE_ACCESS=false opens the internet door" 200 "$OPEN" /
docker run --name "$RUN-bad" -e 'BIRDNET_URL=http://birdnet:8080; } server { listen 9; ' "$IMAGE" >/dev/null 2>&1
if [ "$(docker inspect -f '{{.State.ExitCode}}' "$RUN-bad")" != 0 ] && docker logs "$RUN-bad" 2>&1 | grep -q "BIRDNET_URL should look like"; then
    pass "a malformed BIRDNET_URL stops the container"
else
    fail "malformed BIRDNET_URL" "$(docker logs "$RUN-bad" 2>&1 | tail -3)"
fi

echo
echo "$PASSES passed, $FAILS failed"
[ "$FAILS" = 0 ]
