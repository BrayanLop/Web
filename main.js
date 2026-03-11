/* ═══════════════════════════════════════════
   NEXCORE — main.js
═══════════════════════════════════════════ */

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── MOBILE MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── HERO CANVAS PARTICLES ── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const COLORS = ['#6366f1', '#818cf8', '#06b6d4', '#a5b4fc'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, createParticle);
    cancelAnimationFrame(animId);
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#080c14');
    grad.addColorStop(1, '#0d1322');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // draw & update particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', init, { passive: true });
  init();
})();

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

const counters = document.querySelectorAll('.stat-num');
let countersStarted = false;

function tryStartCounters() {
  if (countersStarted) return;
  const heroBottom = document.querySelector('.hero').getBoundingClientRect().bottom;
  if (heroBottom < window.innerHeight * 1.2) {
    countersStarted = true;
    counters.forEach(animateCounter);
  }
}

/* ── SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach(el => io.observe(el));

// also check counters on scroll
window.addEventListener('scroll', tryStartCounters, { passive: true });
tryStartCounters();

/* ── PORTFOLIO FILTER ── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portfolioCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeSlideUp .4s ease both';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ── CONTACT FORM ── */
const form       = document.getElementById('contactForm');
const btnText    = form.querySelector('.btn-text');
const btnLoader  = form.querySelector('.btn-loader');
const formSuccess = document.getElementById('formSuccess');

function validateField(input) {
  const group = input.closest('.form-group');
  const error = group.querySelector('.form-error');
  let msg = '';

  if (input.required && !input.value.trim()) {
    msg = 'Este campo es obligatorio.';
  } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    msg = 'Por favor ingresa un correo electrónico válido.';
  }

  if (msg) {
    input.classList.add('error');
    if (error) error.textContent = msg;
    return false;
  } else {
    input.classList.remove('error');
    if (error) error.textContent = '';
    return true;
  }
}

// live validation
form.querySelectorAll('input[required], textarea[required], input[type=email]').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('error')) validateField(input);
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const requiredFields = form.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(f => { if (!validateField(f)) valid = false; });
  if (!valid) return;

  btnText.hidden = true;
  btnLoader.hidden = false;
  form.querySelector('button[type=submit]').disabled = true;

  const data = new FormData(form);

  try {
    const res = await fetch('https://formspree.io/f/xojkeowo', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      formSuccess.hidden = false;
      form.reset();
      setTimeout(() => { formSuccess.hidden = true; }, 6000);
    } else {
      const json = await res.json();
      alert('Hubo un error al enviar el mensaje. Intenta de nuevo.');
      console.error(json);
    }
  } catch (err) {
    alert('Error de conexión. Verifica tu internet e intenta de nuevo.');
    console.error(err);
  } finally {
    btnText.hidden = false;
    btnLoader.hidden = true;
    form.querySelector('button[type=submit]').disabled = false;
  }
});

/* ── SMOOTH ACTIVE NAV ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');

const activeIo = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active-nav'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active-nav');
      }
    });
  },
  { rootMargin: '-40% 0px -40% 0px' }
);
sections.forEach(s => activeIo.observe(s));

// inject active nav style
const style = document.createElement('style');
style.textContent = `.nav-links a.active-nav:not(.btn-nav) { color: #e2e8f0 !important; }`;
document.head.appendChild(style);
