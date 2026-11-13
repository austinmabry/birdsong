# ---- stage 1: fetch the Fugleramme artwork (CC BY-SA 4.0) -------------------
FROM alpine/git AS art
ARG FUGLERAMME_REF=main
# Only plain files of the kinds the page uses (pictures, the manifest, the credits): nothing
# the project might add later can end up served as a page or script from Birdsong's address.
RUN git clone --depth 1 --branch "${FUGLERAMME_REF}" https://github.com/arnegiacomo/fugleramme /src \
 && mkdir -p /art/artwork/classic \
 && cd /src/assets/artwork/classic \
 && find . -type f \( -name '*.webp' -o -name '*.png' -o -name '*.json' -o -name 'ATTRIBUTION.md' \) \
      | tar -cf - -T - | tar -xf - -C /art/artwork/classic \
 && cp /src/assets/birdnet_aliases.json /src/assets/ATTRIBUTION.md /art/ \
 && git -C /src rev-parse HEAD > /art/FUGLERAMME_COMMIT

# ---- stage 2: the page, the artwork and a small web server ------------------
FROM nginx:alpine
# NGINX_ENVSUBST_FILTER: fill in only Birdsong's own settings in the config templates.
ENV BIRDNET_URL=http://birdnet-go:8080 \
    REQUIRE_CLOUDFLARE_ACCESS=true \
    NGINX_ENVSUBST_FILTER="^(BIRDNET_URL|BS_[A-Z_]+)$"
# The stock site would otherwise answer if the templates could not be rendered.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf.template nginx/birdsong-api.inc.template /etc/nginx/templates/
COPY nginx/birdsong/ /etc/nginx/birdsong/
COPY --chmod=755 nginx/05-birdsong.envsh /docker-entrypoint.d/05-birdsong.envsh
COPY html/ /usr/share/nginx/html/
COPY --from=art /art/ /usr/share/nginx/html/art/
# Keep nginx in the foreground from its config rather than the usual
# `-g "daemon off;"` argument: wrappers that re-launch the command (Unraid's
# Tailscale hook) split that argument at the space and nginx refuses to start.
RUN sed -i '1i daemon off;' /etc/nginx/nginx.conf
# 80: the LAN door. 8081: the internet door, for a Cloudflare Tunnel only (never publish it).
EXPOSE 80 8081
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
CMD ["nginx"]
