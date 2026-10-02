/* ============================================================
   Interazioni: occhi che seguono, cursore zampa, tilt, easter egg
   ============================================================ */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth <= 768;

/* ---------- Anno nel footer ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Tema ---------- */
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;
$('#themeToggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
  say(next === 'dark' ? 'Miao notturno 🌙' : 'Buongiorno! ☀️');
});

/* ---------- Typing effect ---------- */
const phrases = [
  'Graphic Designer 🎨',
  'Product Designer 🧊',
  'Amante della sostenibilità 🌱',
  'Gattara professionista 🐱',
  'Tipografa curiosa ✒️',
];
const typingEl = $('#typing');
let pi = 0, ci = 0, deleting = false;
function type() {
  const phrase = phrases[pi];
  typingEl.textContent = phrase.slice(0, ci);
  if (!deleting && ci < phrase.length) { ci++; setTimeout(type, 70); }
  else if (!deleting) { deleting = true; setTimeout(type, 1600); }
  else if (ci > 0) { ci--; setTimeout(type, 35); }
  else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 300); }
}
if (reduceMotion) typingEl.textContent = phrases[0]; else type();

/* ---------- Occhi che seguono il mouse ---------- */
const bigCat = $('.big-cat');
const pupils = $$('.pupil', bigCat);
const shines = $$('.shine', bigCat);
const MAX_MOVE = 11;

function moveEyes(clientX, clientY) {
  const r = bigCat.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.42;
  const dx = clientX - cx, dy = clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const k = Math.min(dist, 300) / 300 * MAX_MOVE;
  const tx = dx / dist * k, ty = dy / dist * k;
  pupils.forEach(p => p.style.transform = `translate(${tx}px, ${ty}px)`);
  shines.forEach(s => s.style.transform = `translate(${tx * .6}px, ${ty * .6}px)`);
}
if (!reduceMotion) {
  window.addEventListener('mousemove', e => moveEyes(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (t) moveEyes(t.clientX, t.clientY);
  }, { passive: true });
}

/* ---------- Blink casuale ---------- */
function scheduleBlink() {
  setTimeout(() => {
    bigCat.classList.add('blink');
    setTimeout(() => bigCat.classList.remove('blink'), 300);
    scheduleBlink();
  }, 2500 + Math.random() * 4000);
}
if (!reduceMotion) scheduleBlink();

/* ---------- Fumetto ---------- */
const speech = $('#speech');
let speechTimer;
function say(text, ms = 1800) {
  speech.textContent = text;
  speech.classList.add('show');
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.remove('show'), ms);
}

/* ---------- Accarezza il gatto ---------- */
const meows = ['Miao! 🐟', 'Prrr… 💛', 'Miaooo 🧶', 'Fusa fusa 😽', 'Ancora! 🐾', 'Mrrrp? 🐱', 'Che bello ✨'];
let pets = 0;
const heroCat = $('#heroCat');
heroCat.addEventListener('click', e => {
  pets++;
  say(pets >= 10 ? 'Ok, adesso basta 😹' : meows[Math.floor(Math.random() * meows.length)]);
  bigCat.classList.add('happy');
  setTimeout(() => bigCat.classList.remove('happy'), 700);
  spawnHearts(e.clientX, e.clientY);
});
function spawnHearts(x, y) {
  const r = heroCat.getBoundingClientRect();
  const emojis = ['💛', '💖', '🐾', '✨', '🧡'];
  for (let i = 0; i < 7; i++) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = (x - r.left + (Math.random() * 40 - 20)) + 'px';
    h.style.top = (y - r.top) + 'px';
    h.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    h.style.setProperty('--rot', (Math.random() * 90 - 45) + 'deg');
    heroCat.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }
}

/* ---------- Cursore zampa + scia ---------- */
if (!isTouch && !reduceMotion) {
  const cur = document.createElement('div');
  cur.className = 'paw-cursor';
  cur.textContent = '🐾';
  document.body.appendChild(cur);

  let lastTrail = 0;
  window.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
    const now = performance.now();
    if (now - lastTrail > 90) {
      lastTrail = now;
      const p = document.createElement('span');
      p.className = 'paw-trail';
      p.textContent = '🐾';
      p.style.left = e.clientX + 'px';
      p.style.top = e.clientY + 'px';
      p.style.rotate = (Math.random() * 60 - 30) + 'deg';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  });
  window.addEventListener('mousedown', () => cur.classList.add('clicking'));
  window.addEventListener('mouseup', () => cur.classList.remove('clicking'));
  document.addEventListener('mouseleave', () => cur.style.opacity = 0);
  document.addEventListener('mouseenter', () => cur.style.opacity = 1);
}

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Tilt 3D sulle card ---------- */
if (!isTouch && !reduceMotion) {
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

/* ---------- Gatto che sbuca ---------- */
const peek = $('#peekCat');
window.addEventListener('scroll', () => {
  peek.classList.toggle('up', window.scrollY > 400);
}, { passive: true });
peek.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  say('Eccomi! 🐾');
});

/* ---------- Easter egg: Konami → pioggia di gatti ---------- */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
let kIdx = 0;
window.addEventListener('keydown', e => {
  if (e.key === konami[kIdx]) {
    kIdx++;
    if (kIdx === konami.length) { kIdx = 0; catRain(); }
  } else kIdx = e.key === konami[0] ? 1 : 0;
});
function catRain() {
  const rain = $('#rain');
  const cats = ['🐱','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐈','🐈‍⬛','🧶','🐟'];
  say('PIOGGIA DI GATTI! 🙀', 3000);
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('span');
    s.textContent = cats[Math.floor(Math.random() * cats.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    s.style.animationDelay = (Math.random() * 2) + 's';
    s.style.fontSize = (1.5 + Math.random() * 2.5) + 'rem';
    rain.appendChild(s);
    setTimeout(() => s.remove(), 7500);
  }
}
/* Tocco lungo sul gatto grande = pioggia anche da mobile */
let pressTimer;
heroCat.addEventListener('touchstart', () => pressTimer = setTimeout(catRain, 900), { passive: true });
heroCat.addEventListener('touchend', () => clearTimeout(pressTimer));

/* ---------- Saluto iniziale ---------- */
setTimeout(() => say('Ciao! 👋'), 900);
