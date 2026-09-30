/* Tiny Tantrum Games: small motion helpers. Everything here is optional polish; the site works without it. */
(() => {
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // reveal sections as they scroll into view, cards one after another
  const groups = [
    ['.games h2, .trailers-head, .note h2, .game-body h2', ''],
    ['.grid .card', 'stagger'],
    ['.reel figure', 'stagger'],
    ['.note ul li', 'stagger'],
    ['.note .wrap > div > p', ''],
    ['.demo .phone', 'from-left'],
    ['.demo > div:not(.phone)', 'from-right'],
    ['.features li', 'stagger'],
    ['.spec, .faq details, .doc .paper', 'stagger'],
  ];
  const items = [];
  groups.forEach(([sel, mode]) => document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('rv'); if (mode.startsWith('from')) el.classList.add(mode);
    if (mode === 'stagger') el.style.setProperty('--rd', Math.min(i, 6) * 90 + 'ms');
    items.push(el);
  }));
  if (calm || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; el.classList.add('in'); io.unobserve(el); setTimeout(() => el.classList.remove('rv', 'in', 'from-left', 'from-right'), 1400); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;

  // hero illustration leans towards the mouse
  const hero = document.querySelector('.home-hero'), art = hero && hero.querySelector('.hero-art');
  if (hero && art) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { art.style.setProperty('--px', x.toFixed(3)); art.style.setProperty('--py', y.toFixed(3)); });
    });
    hero.addEventListener('pointerleave', () => { art.style.setProperty('--px', 0); art.style.setProperty('--py', 0); });
  }

  // game cards tilt a little towards the pointer
  document.querySelectorAll('.grid .card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.classList.add('tilt'); card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); card.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => { card.classList.remove('tilt'); card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
  });
})();
