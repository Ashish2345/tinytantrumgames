// Builds the Tiny Tantrum Games website into ./dist from site.config.json.
//   node build-site.js          → dist/  (upload this folder to your host)
//   node build-site.js --flat   → links point at .../index.html (for previewing files directly)
// No packages needed. Add a game = add an entry to "games" in site.config.json and run again.
const fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.join(ROOT, 'dist'), FLAT = process.argv.includes('--flat');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://' + C.domain;
const niceDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const YEAR = new Date(C.policyUpdated + 'T12:00:00Z').getUTCFullYear();

// relative link helpers: every page knows its depth so the site works on any host and from disk
const rel = (depth, target) => { // target like '' (home), 'snack-stuck/', 'assets/site.css'
  const up = depth ? '../'.repeat(depth) : './';
  if (target === '' || target.endsWith('/')) return up + target + (FLAT ? 'index.html' : '');
  return up + target;
};

const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 17c3-7 9-4 11-9 3 6 9 2 12 8 4-5 11-1 12 5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="38" r="21" fill="#FF4B3E" stroke="currentColor" stroke-width="3.2"/><path d="M20 31l8 3M44 31l-8 3" stroke="#1C1233" stroke-width="3.4" stroke-linecap="round"/><circle cx="25.5" cy="38" r="2.6" fill="#1C1233"/><circle cx="38.5" cy="38" r="2.6" fill="#1C1233"/><path d="M24 49c4-4 12-4 16 0" fill="none" stroke="#1C1233" stroke-width="3.4" stroke-linecap="round"/></svg>`;

function page({ depth, file, title, description, active, body, canonical, image, ld, rootLinks }) {
  const img = SITE + '/' + (image || 'assets/img/social-card.jpg');
  const L = rootLinks && !FLAT ? (t => '/' + t) : (t => rel(depth, t));
  const nav = [['Games', '', 'home'], ['Support', 'support/', 'support'], ['Privacy', 'privacy/', 'privacy']];
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}/${canonical || ''}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/${canonical || ''}">
<meta property="og:site_name" content="${esc(C.studio)}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${img}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="theme-color" content="#FFE24A" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#170F2B" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${L('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${L('apple-touch-icon.png')}">
<link rel="preload" href="${L('assets/fonts/lilita-one-latin-400-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L('assets/site.css')}">
<script src="${L('assets/site.js')}" defer></script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n` : ''}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
  <a class="brand" href="${L('')}">${LOGO}<span>${esc(C.studio)}</span></a>
  <nav class="nav" aria-label="Main">${nav.map(([n, t, k]) => `<a href="${L(t)}"${active === k ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
</div></header>
<main id="main">
${body(L)}
</main>
<footer class="foot"><div class="wrap">
  <nav aria-label="Footer">
    ${C.games.map(g => `<a href="${L(g.slug + '/')}">${esc(g.name)}</a>`).join('\n    ')}
    <a href="${L('support/')}">Support</a>
    <a href="${L('privacy/')}">Privacy</a>
    <a href="${L('terms/')}">Terms</a>
  </nav>
  <small>© ${YEAR} ${esc(C.studio)} · Made in ${esc(C.country)} · ${esc(C.email)}</small>
</div></footer>
${html_hasVideo(body(L)) ? VIDEO_JS : ''}</body>
</html>
`;
  const out = path.join(OUT, file); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, versioned(html));
}

const crypto = require('crypto');
const hashCache = {};
function assetHash(rel) { // rel like 'assets/img/x.webp'
  if (!(rel in hashCache)) { const f = path.join(ROOT, 'src', rel); hashCache[rel] = fs.existsSync(f) ? crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : ''; }
  return hashCache[rel];
}
const versioned = html => html.replace(/((?:src|href|poster)=")([^"]*?)(assets\/[^"?#]+)"/g, (m, a, pre, rel) => { if (rel.startsWith('assets/fonts/')) return m; const h = assetHash(rel); return h ? `${a}${pre}${rel}?v=${h}"` : m; });
// background candy for the home hero: fixed positions so every build looks the same
const FX_COLORS = ['#FF4B3E', '#FFB020', '#3FA7FF', '#1FB985', '#A66BFF', '#FF8A2B'];
const FX = Array.from({ length: 14 }, (_, i) => {
  const x = (i * 37 + 11) % 100, y = (i * 53 + 7) % 90, s = 10 + (i * 7) % 16, r = (i * 47) % 360, d = (i * 0.83) % 9, dur = 9 + (i * 1.7) % 7;
  return `<span style="left:${x}%;top:${y}%;width:${s}px;height:${Math.round(s * 1.7)}px;background:${FX_COLORS[i % FX_COLORS.length]};--r:${r}deg;animation-delay:-${d.toFixed(1)}s;animation-duration:${dur.toFixed(1)}s"></span>`;
}).join('');
const TICKER = ['Tiny games', 'Big tantrums', ...C.games.map(g => g.name), 'Free to play', 'No accounts needed', 'One more try'].map(t => `<span>${esc(t)}</span><i></i>`).join('');
const playBtn = (g, cls) => g.playUrl
  ? `<a class="btn ${cls || 'primary'}" href="${esc(g.playUrl)}" rel="noopener">Get it on Google Play</a>`
  : `<span class="btn ${cls || 'primary'}" aria-disabled="true">${g.status === 'live' ? 'Google Play link coming' : 'Coming soon to Google Play'}</span>`;
const statusPill = g => g.status === 'live' ? '<span class="pill live">On Google Play</span>' : '<span class="pill soon">Coming soon</span>';
const html_hasVideo = h => h.includes('data-autoplay');
// play trailers only while they are on screen (saves data), never for people who prefer reduced motion
const VIDEO_JS = `<script>(()=>{const v=[...document.querySelectorAll('video[data-autoplay]')];if(!v.length||!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const io=new IntersectionObserver(es=>es.forEach(e=>{e.isIntersecting?e.target.play().catch(()=>{}):e.target.pause()}),{threshold:.35});v.forEach(x=>io.observe(x))})()</script>\n`;
const phoneVideo = (L, g, preload) => `<div class="phone"><video src="${L(g.video)}"${g.videoPoster ? ` poster="${L(g.videoPoster)}"` : ''} muted loop playsinline controls preload="${preload || 'metadata'}" data-autoplay width="540" height="960" aria-label="${esc(g.name)} trailer"></video></div>`;
const ORG = { '@type': 'Organization', name: C.studio, url: SITE + '/', email: C.email, logo: SITE + '/apple-touch-icon.png' };
const emailSpan = () => `<a class="email" href="mailto:${esc(C.email)}">${esc(C.email)}</a>`;

// ---------- clean output ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'src'), OUT, { recursive: true });

// ---------- home ----------
page({
  depth: 0, file: 'index.html', active: 'home', canonical: '',
  title: `${C.studio} · Tiny games. Big tantrums.`, description: C.intro,
  ld: Object.assign({ '@context': 'https://schema.org' }, ORG),
  body: L => `
<section class="hero home-hero">
<div class="hero-fx" aria-hidden="true">${FX}</div>
<div class="wrap hero-grid"><div>
  <p class="label enter" style="--d:0">Indie mobile games · ${esc(C.country)}</p>
  <h1 style="margin-top:14px"><span class="w" style="--d:1">Tiny</span> <span class="w" style="--d:2">games.</span><br><span class="w" style="--d:3">Big</span> <span class="w" style="--d:4"><span class="tantrum">tantrums.</span></span></h1>
  <p class="intro enter" style="--d:5">${esc(C.intro)}</p>
  <ul class="facts enter" style="--d:6">
    <li>${C.games.length} games</li><li>free to play</li><li>no sign-up needed</li><li>Android</li>
  </ul>
  </div>
  <figure class="hero-art" aria-hidden="true">
    <span class="floor"></span>
    <img class="vendy" src="${L('assets/img/snack-stuck-machine-classic.webp')}" alt="" width="360" height="520">
    <img class="guy" src="${L('assets/img/snack-stuck-office-panic.webp')}" alt="" width="200" height="380">
    <span class="bubble">MY SNACK!</span>
    <span class="snack s1"></span><span class="snack s2"></span><span class="snack s3"></span>
  </figure>
</div></section>
<div class="ticker-wrap" aria-hidden="true"><div class="ticker"><div class="ticker-track">${TICKER}${TICKER}</div></div></div>
<section class="games" id="games"><div class="wrap">
  <h2>Our games</h2>
  <div class="grid">
  ${C.games.map(g => `<article class="card">
    <a class="card-art" href="${L(g.slug + '/')}" tabindex="-1" aria-hidden="true"><img src="${L(g.banner || g.hero || g.icon)}" alt="" width="1024" height="500" loading="lazy"></a>
    <div class="card-body">
      <div class="card-head"><img src="${L(g.icon)}" alt="" width="64" height="64" loading="lazy"><div><h3><a href="${L(g.slug + '/')}">${esc(g.name)}</a></h3>${statusPill(g)}</div></div>
      <p>${esc(g.tagline)}</p>
      <ul class="chips">${g.features.slice(0, 3).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <div class="card-links"><a class="btn primary" href="${L(g.slug + '/')}">See the game</a>${g.video ? `<a class="btn" href="${L(g.slug + '/')}#trailer">▶ Watch trailer</a>` : ''}<a class="quiet" href="${L(g.slug + '/privacy/')}">Privacy</a></div>
    </div>
  </article>`).join('\n  ')}
  </div>
</div></section>
${C.games.some(g => g.video) ? `<section class="trailers"><div class="wrap">
  <div class="trailers-head"><p class="label">Trailers</p><h2>See them in action</h2><p>Real gameplay from each game. Use the speaker button to hear it.</p></div>
  <div class="reel">
  ${C.games.filter(g => g.video).map(g => `<figure>${phoneVideo(L, g, 'none')}<figcaption><img src="${L(g.icon)}" alt="" width="40" height="40" loading="lazy"><span><b>${esc(g.name)}</b><a href="${L(g.slug + '/')}">See the game →</a></span></figcaption></figure>`).join('\n  ')}
  </div>
</div></section>` : ''}
<section class="note"><div class="wrap">
  <div>
    <h2>Small studio, simple rules</h2>
    <p>${esc(C.studio)} is a one-person studio in ${esc(C.country)}. Every game is free, runs on almost any Android phone, and is built to be picked up for a minute and put down again.</p>
    <p>Questions, bugs or ideas? Write to ${emailSpan()}. A real person reads every message.</p>
  </div>
  <ul>
    <li><b>Money</b>Free games, paid for by ads. Some ads are optional and give you a bonus.</li>
    <li><b>Your data</b>No sign-up needed. Each game's privacy page lists exactly what it stores and why.</li>
    <li><b>Ads partner</b>Google AdMob, with Google's consent form where the law requires it.</li>
  </ul>
</div></section>`
});

// ---------- each game ----------
for (const g of C.games) {
  const facts = [
    ['Platform', esc(g.platforms)],
    ['Package', /\[/.test(g.packageId) ? 'Announced at launch' : `<code>${esc(g.packageId)}</code>`],
    g.age ? ['Age', esc(g.age)] : null,
    ['Price', 'Free, with ads'],
    ['Accounts', esc(g.accounts || 'None needed')],
    ['Progress', esc(g.progress || 'Saved on your phone')]
  ].filter(Boolean);
  page({
    depth: 1, file: g.slug + '/index.html', canonical: g.slug + '/',
    title: `${g.name} · ${C.studio}`, description: g.tagline, image: g.shareImage || g.hero,
    ld: {
      '@context': 'https://schema.org', '@type': 'VideoGame', name: g.storeName || g.name, description: g.description.join(' '),
      url: `${SITE}/${g.slug}/`, image: `${SITE}/${g.shareImage || g.hero}`, gamePlatform: g.platforms, operatingSystem: g.platforms,
      applicationCategory: 'GameApplication', author: ORG, publisher: ORG,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      ...(g.video ? { trailer: { '@type': 'VideoObject', name: `${g.name} trailer`, description: g.videoCaption || g.tagline, thumbnailUrl: `${SITE}/${g.videoPoster}`, contentUrl: `${SITE}/${g.video}`, uploadDate: C.policyUpdated } } : {})
    },
    body: L => `
<div class="wrap">
<section class="game-hero">
  <div>
    <img class="icon pop" src="${L(g.icon)}" alt="${esc(g.name)} app icon" width="96" height="96">
    <span class="enter" style="--d:1">${statusPill(g)}</span>
    <h1 class="enter" style="margin-top:10px;--d:2">${esc(g.name)}</h1>
    <p class="tag enter" style="--d:3">${esc(g.tagline)}</p>
    <div class="cta enter" style="--d:4">${playBtn(g)}<a class="btn" href="${L(g.slug + '/privacy/')}">Privacy policy</a></div>
  </div>
  ${g.hero ? `<div class="shot enter-art${g.heroTall ? ' tall' : ''}"><img src="${L(g.hero)}" alt="${esc(g.name)} artwork"></div>` : `<div class="shot art"><img src="${L(g.icon)}" alt="" width="256" height="256"></div>`}
</section>
${g.video ? `<section class="demo" id="trailer">
  ${phoneVideo(L, g)}
  <div>
    <p class="label">Trailer</p>
    <h2>See it in action</h2>
    <p>${esc(g.videoCaption || 'Real gameplay, recorded straight from the game.')}</p>
    <p class="hint">The video starts muted. Use the speaker button to hear it.</p>
    <div class="cta">${playBtn(g)}</div>
  </div>
</section>` : ''}
<section class="game-body">
  <div class="prose">
    <h2>About the game</h2>
    ${g.description.map(p => `<p>${esc(p)}</p>`).join('\n    ')}
    <ul class="features">${g.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <div class="faq">
      <h2 style="margin-top:14px">Help</h2>
      ${(g.faq || []).map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n      ')}
      <p>Still stuck? Email ${emailSpan()} and mention “${esc(g.name)}”.</p>
    </div>
  </div>
  <aside class="spec">
    <p class="label">Fact sheet</p>
    <dl>${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
  </aside>
</section>
</div>`
  });

  // game privacy policy
  page({
    depth: 2, file: g.slug + '/privacy/index.html', canonical: g.slug + '/privacy/', active: 'privacy',
    title: `${g.name} Privacy Policy`, description: `How ${g.name} by ${C.studio} handles your data.`,
    body: L => `
<div class="wrap doc"><article class="paper">
  <p class="label">${esc(C.studio)}</p>
  <h1 style="margin-top:10px">${esc(g.name)} Privacy Policy</h1>
  <p class="meta label">Last updated ${niceDate(C.policyUpdated)}${/\[/.test(g.packageId) ? '' : ` · App ID <code>${esc(g.packageId)}</code>`}</p>
  <p class="summary">${g.dataTable
    ? `Short version: you can play ${esc(g.name)} without an account. It backs up your progress with Google Firebase, uses anonymous statistics to improve levels, and shows ads from Google AdMob. The table below lists everything it collects.`
    : `Short version: ${esc(g.name)} has no accounts and saves your progress only on your phone. It shows ads from Google AdMob, and Google may collect device data to show and measure those ads.`}</p>

  <h2>Who we are</h2>
  <p>${esc(g.name)} (“the game”) is made by ${C.owner ? `${esc(C.owner)}, trading as ${esc(C.studio)}` : esc(C.studio)}, based in ${esc(C.country)} (“we”, “us”). Contact: ${emailSpan()}.</p>

  ${g.dataTable ? `<h2>What the game collects</h2>
  <p>The game does not ask for your email address, phone number, contacts, photos or precise location.</p>
  <div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Why</th><th>Shared with</th></tr></thead><tbody>
  ${g.dataTable.map(r => `<tr>${r.map((c, i) => `<td data-label="${['Data', 'Why', 'Shared with'][i]}">${esc(c)}</td>`).join('')}</tr>`).join('\n  ')}
  </tbody></table></div>` : `<h2>Information the game stores</h2>
  <p>The game does not ask for your name, email address, phone number, contacts, photos or location. Your progress (such as coins, levels, upgrades and settings) is stored only on your device. We do not operate servers for the game and we do not receive this information. Uninstalling the game or clearing its data deletes it.</p>`}

  <h2>Advertising</h2>
  <p>The game is free and shows ads provided by Google AdMob. To deliver ads, measure how they perform, and prevent fraud, Google may collect and process information from your device, including:</p>
  <ul>
    <li>the advertising ID and other device identifiers</li>
    <li>IP address, and approximate location derived from it</li>
    <li>device and app information such as model, operating system and app version, and crash or performance data</li>
    <li>how you interact with ads</li>
  </ul>
  <p>Where the law requires it, for example in the European Economic Area, the United Kingdom and Switzerland, the game shows Google's consent form so you can choose whether ads are personalised. You can reset your advertising ID or opt out of personalised ads at any time in your device settings (for example Settings › Google › Ads, or Settings › Privacy › Ads).</p>
  <p>Google's use of this information is described at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a> and in the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>.</p>
  ${g.extraPrivacy ? `<h2>Sharing from the game</h2>\n  <p>${esc(g.extraPrivacy)}</p>` : ''}

  ${g.notifications ? `<h2>Notifications</h2>
  <p>If you allow it, the game sends one daily reminder when the new daily puzzle is ready. You can turn this off at any time in your phone's settings.</p>` : ''}

  <h2>Permissions</h2>
  <p>The game uses internet access${g.dataTable ? ' (to load ads and back up your progress)' : ' (to load ads)'}, may use vibration for feedback, ${g.notifications ? 'can ask to send notifications, ' : ''}and uses the advertising ID permission required by Google AdMob. It does not request access to your camera, microphone, contacts, photos or precise location.</p>

  <h2>Children</h2>
  <p>The game is not directed at children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided personal information through the game, contact us and we will help remove it.</p>

  ${g.deleteByEmail ? `<h2>Keeping and deleting data</h2>
  <p>Your progress is kept while you play. To delete your cloud data, email ${emailSpan()} with the words “delete my ${esc(g.name)} data” and, if you signed in, the Google account you used. We delete it within 30 days. Uninstalling the game removes the data stored on your phone.</p>

  <h2>Security</h2>
  <p>Data is sent over encrypted connections and stored by Google Firebase. Each player can only change their own saved progress.</p>` : `<h2>Your choices and rights</h2>
  <p>Because we do not hold personal information about you, there is nothing for us to access, correct or delete on our side. You can remove all game data by uninstalling the game. For data processed by Google, see Google's privacy tools at <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">myaccount.google.com</a>.</p>`}

  <h2>Changes to this policy</h2>
  <p>If we change this policy, we will update this page and the date at the top.</p>

  <h2>Contact</h2>
  <p>${emailSpan()}</p>
</article></div>`
  });
}

// ---------- studio privacy (website + index of game policies) ----------
page({
  depth: 1, file: 'privacy/index.html', canonical: 'privacy/', active: 'privacy',
  title: `Privacy · ${C.studio}`, description: `Privacy policies for ${C.studio} games and website.`,
  body: L => `
<div class="wrap doc"><article class="paper">
  <p class="label">${esc(C.studio)}</p>
  <h1 style="margin-top:10px">Privacy</h1>
  <p class="meta label">Last updated ${niceDate(C.policyUpdated)}</p>
  <h2>Game privacy policies</h2>
  <ul>${C.games.map(g => `<li><a href="${L(g.slug + '/privacy/')}">${esc(g.name)} Privacy Policy</a></li>`).join('')}</ul>
  <h2>This website</h2>
  <p>This website has no accounts, no forms, no analytics, no advertising and no cookies. Fonts and images are served from this site itself. Our hosting provider may keep standard server logs (such as IP address, browser type and the page requested) for a short time to keep the site secure and working.</p>
  <h2>Contact</h2>
  <p>${C.owner ? esc(C.owner) + ', ' : ''}${esc(C.studio)}, ${esc(C.country)} · ${emailSpan()}</p>
</article></div>`
});

// ---------- terms ----------
page({
  depth: 1, file: 'terms/index.html', canonical: 'terms/',
  title: `Terms of Use · ${C.studio}`, description: `Terms for playing ${C.studio} games.`,
  body: L => `
<div class="wrap doc"><article class="paper">
  <p class="label">${esc(C.studio)}</p>
  <h1 style="margin-top:10px">Terms of Use</h1>
  <p class="meta label">Last updated ${niceDate(C.policyUpdated)}</p>
  <p class="summary">Play fair, have fun, and don't copy or resell our games.</p>
  <h2>Using our games</h2>
  <p>Our games are provided free of charge for your personal, non-commercial entertainment. By downloading or playing them you agree to these terms and to the terms of the store you downloaded them from.</p>
  <h2>What you may not do</h2>
  <ul>
    <li>copy, modify, resell or redistribute the games or their art, music or code</li>
    <li>reverse engineer, cheat with third-party tools, or interfere with ads</li>
    <li>use the games in any way that breaks the law</li>
  </ul>
  <h2>In-game items</h2>
  <p>Coins, drops, upgrades and other in-game items have no real-world value and cannot be exchanged for money. They are stored on your device and, in games that offer it, backed up to your game account.</p>
  <h2>Ads</h2>
  <p>Our games show ads from third parties such as Google AdMob. We are not responsible for the content of those ads or the sites they link to.</p>
  <h2>No warranty</h2>
  <p>The games are provided “as is”. We work hard to keep them bug-free but cannot promise they will always work without interruption. To the extent the law allows, we are not liable for any loss arising from using them, including lost game progress.</p>
  <h2>Changes</h2>
  <p>We may update the games and these terms. The date above shows the latest version.</p>
  <h2>Contact</h2>
  <p>${emailSpan()}</p>
</article></div>`
});

// ---------- support ----------
page({
  depth: 1, file: 'support/index.html', canonical: 'support/', active: 'support',
  title: `Support · ${C.studio}`, description: `Get help with ${C.studio} games.`,
  body: L => `
<div class="wrap doc"><article class="paper">
  <p class="label">${esc(C.studio)}</p>
  <h1 style="margin-top:10px">Support</h1>
  <p class="summary">Email ${emailSpan()}. Tell us the game, your phone model and what happened. We usually reply within 2 working days.</p>
  ${C.games.map(g => `<h2>${esc(g.name)}</h2>\n  <ul>${(g.faq || []).map(([q, a]) => `<li><b>${esc(q)}</b> ${esc(a)}</li>`).join('')}</ul>\n  <p><a href="${L(g.slug + '/')}">Game page</a> · <a href="${L(g.slug + '/privacy/')}">Privacy policy</a></p>`).join('\n  ')}
  <h2>Deleting your data</h2>
  <ul>${C.games.map(g => `<li><b>${esc(g.name)}:</b> ${g.deleteByEmail ? `email ${emailSpan()} with the words “delete my ${esc(g.name)} data” (and the Google account you used, if you signed in). We delete it within 30 days. Uninstalling removes what's stored on your phone.` : 'nothing is kept on servers. Uninstall the game to delete everything it stored on your phone.'}</li>`).join('')}</ul>
  <p>To reset your advertising ID, go to your phone's settings › Google › Ads (or Privacy › Ads).</p>
</article></div>`
});

// ---------- 404 ----------
page({
  depth: 0, file: '404.html', canonical: '', rootLinks: true,
  title: `Page not found · ${C.studio}`, description: 'This page does not exist.',
  body: L => `
<section class="hero"><div class="wrap">
  <p class="label">Error 404</p>
  <h1 style="margin-top:14px">This page threw a <span class="tantrum">tantrum.</span></h1>
  <p class="intro">It isn't here. Try the <a href="${L('')}">games page</a> instead.</p>
</div></section>`
});

// ---------- machine files ----------
const pub = String(C.admobPublisherId || '');
fs.writeFileSync(path.join(OUT, 'app-ads.txt'), /^pub-\d{16}$/.test(pub)
  ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
  : `# app-ads.txt for ${C.domain}\n# Put your AdMob publisher ID (pub-1234567890123456) in site.config.json → admobPublisherId and rebuild.\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const urls = ['', 'support/', 'privacy/', 'terms/'].concat(...C.games.map(g => [g.slug + '/', g.slug + '/privacy/']));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}/${u}</loc><lastmod>${C.policyUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'favicon.svg'), LOGO.replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"').replace(/currentColor/g, '#1C1233'));
// Cloudflare Pages / Netlify headers: security + long cache for fonts/images
const scriptHash = crypto.createHash('sha256').update(VIDEO_JS.replace(/^<script>|<\/script>\n$/g, '')).digest('base64');
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-${scriptHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/app-ads.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
`);

const placeholders = JSON.stringify(C).match(/\[[A-Z][A-Z ]+\]|pub-X+/g) || [];
console.log(`Built ${urls.length} pages + 404 into ${path.relative(process.cwd(), OUT) || 'dist'}${FLAT ? ' (flat preview mode)' : ''}.`);
if (placeholders.length) console.log('Still to fill in site.config.json: ' + [...new Set(placeholders)].join(', '));
