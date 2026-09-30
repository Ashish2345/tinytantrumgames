# Tiny Tantrum Games website: go live

**Cost:** the domain is about **$10–11/year** (about NPR 1,500). Hosting and email forwarding are **free**.
**Recommended:** Cloudflare, which gives you the domain, hosting and a `hello@` email address in one place.

## 0. Build the site (1 min)
The site is ready for release. The details are filled in; only these are left for later:
- `admobPublisherId` in `site.config.json`: add your `pub-…` number once AdMob gives it to you. Until then `app-ads.txt` holds only a comment, which is fine.
- `"playUrl"` and `"status": "live"` for each game when it goes live on Google Play. The buttons then change to "Get it on Google Play".

Open Command Prompt in this folder and run:
```
node build-site.js
```
This creates or refreshes the **`dist`** folder. That folder *is* the website. If it says the folder can't be removed, delete `dist` yourself and run it again.

**Updating later:** change `site.config.json` or the files in `src/`, run the command again and upload the new `dist`. Images, videos and styles get a new version tag automatically, so visitors never see an old copy.

## 1. Buy the domain (5 min)
1. Create a free account at https://dash.cloudflare.com (you need a card that works for online dollar payments).
2. **Domain Registration → Register Domains** → search `tinytantrumgames.com` → buy it (turn on auto-renew).

*(Namecheap or Porkbun work too. Then add the domain to Cloudflare as a site so steps 2–3 still apply.)*

## 2. Put the site online (5 min)
1. Cloudflare → **Workers & Pages → Create → Pages → Upload assets**.
2. Project name: `tinytantrumgames` → drag the **`dist`** folder in → **Deploy**.
   It's now live at `https://tinytantrumgames.pages.dev`.
3. In the project: **Custom domains → Set up a custom domain** → `tinytantrumgames.com` → Activate. Repeat for `www.tinytantrumgames.com`.
   It usually works within a few minutes, and can take up to an hour.

## 3. Get hello@tinytantrumgames.com (3 min)
1. Cloudflare → your domain → **Email → Email Routing → Get started**.
2. Create the address `hello` → destination: your Gmail → click the verification link Google sends you.
   Mail to `hello@tinytantrumgames.com` now arrives in your Gmail.

## 4. Check it
- https://tinytantrumgames.com
- https://tinytantrumgames.com/snack-stuck/privacy/ ← use this in Google Play and in the game
- https://tinytantrumgames.com/color-pour/privacy/
- https://tinytantrumgames.com/app-ads.txt (after you add your AdMob publisher ID)

## 5. Use it in Google Play Console
- **Developer name:** Tiny Tantrum Games
- **Website:** https://tinytantrumgames.com
- **Email:** hello@tinytantrumgames.com
- **Privacy policy** for each app: its `/…/privacy/` link above
- For **Color Pour**, update its privacy policy link in Play Console to the new one too.

## Adding a new game later
1. Copy a game block in `site.config.json` and change the name, slug, texts, package ID and icon. Put the icon in `src/assets/img/`.
2. `node build-site.js`
3. Cloudflare → your Pages project → **Create deployment** → upload the new `dist` folder.
