# Tiny Tantrum Games — studio website

Static website for **tinytantrumgames.com**: a studio home page, one page and one privacy policy per game, terms, support, `app-ads.txt`, a sitemap and a 404 page. No frameworks and no tracking. Fonts are self-hosted.

- Edit **`site.config.json`** (studio details + games)
- Run **`node build-site.js`** → the site is written to **`dist/`** (preview: `npx serve dist -l 3000`)
- `src/` holds the styles, script, fonts, images and videos. `build-site.js` holds the page templates.

## Deploy

**Docker (production, VPS):** `docker build -t tinytantrum .` builds the site and serves it with nginx on port 80 inside the container, with cache and security headers (`docker/nginx.conf`). In the yugnatar stack it runs as the `tinytantrum` service behind the shared nginx, which handles TLS for tinytantrumgames.com. See `DEPLOYMENT.md` §14 in that repo.

**Cloudflare Pages (alternative):** upload `dist/`. See `DEPLOY.md`.
