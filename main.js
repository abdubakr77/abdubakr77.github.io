/* ============================================================
   Abdullah Bakr — Portfolio JS
   main.js
   ============================================================ */

/* ── THEME SYSTEM (runs immediately, before paint) ────── */
(function initTheme() {
  const STORAGE_KEY = 'abdubakr_theme';
  const saved = localStorage.getItem(STORAGE_KEY);
  // Detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Resolve: saved preference wins, else follow system, else default dark
  const theme = saved ? saved : (prefersDark ? 'dark' : 'light');
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

/* ── INTRO SCREEN ─────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('intro-overlay').classList.add('gone');
  }, 1900);
});

/* ── PARTICLE COLOR STATE ─────────────────────────────── */
let _particleTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
function updateParticleColor(theme) { _particleTheme = theme; }

/* ── PARTICLE BACKGROUND ──────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = 55;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a:  Math.random() * 0.45 + 0.05,
    });
  }

  function getParticleColor(alpha) {
    return _particleTheme === 'light'
      ? `rgba(37,99,235,${alpha})`
      : `rgba(96,165,250,${alpha})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = getParticleColor(0.07 * (1 - dist / 130));
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = getParticleColor(p.a);
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }
  loop();
})();

/* ── SCROLL FADE-IN ───────────────────────────────────── */
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
fadeEls.forEach(el => fadeObs.observe(el));

/* ── TECH ICONS — staggered slide-up on scroll ────────── */
const tcEls = document.querySelectorAll('.tc-anim');
const tcObs = new IntersectionObserver((entries) => {
  // Find only newly intersecting ones
  const visible = entries.filter(e => e.isIntersecting);
  if (visible.length === 0) return;
  // Get all tc-anim not yet visible and stagger them
  tcEls.forEach((el, i) => {
    if (!el.classList.contains('tc-visible')) {
      setTimeout(() => el.classList.add('tc-visible'), i * 60);
    }
  });
  // Once triggered, unobserve all
  tcEls.forEach(el => tcObs.unobserve(el));
}, { threshold: 0.1 });
// Observe only the tools grid container
const toolsGrid = document.querySelector('.tools-grid');
if (toolsGrid) tcObs.observe(toolsGrid);

/* ── COUNTER ANIMATION ────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 2800; // longer total duration
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Strong ease-out: fast start, very slow finish near target
    // Use power 5 for very pronounced deceleration near end
    const eased = 1 - Math.pow(1 - progress, 5);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

/* ── SCROLL CUE HIDE ON SCROLL ────────────────────────── */
(function() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;
  const hideCue = () => {
    if (window.scrollY > 40) {
      cue.classList.add('hidden');
      window.removeEventListener('scroll', hideCue, { passive: true });
    }
  };
  window.addEventListener('scroll', hideCue, { passive: true });
})();

/* ── ACTIVE NAV LINK ──────────────────────────────────── */
const navSecs  = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  navSecs.forEach(s => { if (window.scrollY >= s.offsetTop - 85) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

/* ── CONTACT FORM ─────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('fsubmit');
const successMsg  = document.getElementById('fok');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.style.display = 'none';
      successMsg.style.display = 'block';
    }, 2000);
  });
}

/* ── CERTIFICATE MODAL ────────────────────────────────── */
function openCert(name, src) {
  const modal = document.getElementById('pdfModal');
  const frame = document.getElementById('pdfFrame');
  const title = document.getElementById('pdfTitle');
  const dlBtn = document.getElementById('pdfDlLink');

  title.textContent = name;

  if (src && src.startsWith('http')) {
    frame.innerHTML = `
      <div class="pdf-ext">
        <div class="big-icon">🎓</div>
        <h3>${name}</h3>
        <p>This certificate is hosted externally. Click below to view and verify it.</p>
        <a href="${src}" target="_blank" rel="noopener">View &amp; Verify Certificate ↗</a>
      </div>`;
    dlBtn.style.display = 'none';
  } else if (src) {
    frame.innerHTML = `<iframe src="${src}" title="${name}"></iframe>`;
    dlBtn.href     = src;
    dlBtn.download = name.replace(/[^a-z0-9]/gi, '_') + '.pdf';
    dlBtn.style.display = 'flex';
  } else {
    frame.innerHTML = `
      <div class="pdf-ext">
        <div class="big-icon">📄</div>
        <h3>${name}</h3>
        <p>Certificate file not linked yet.</p>
      </div>`;
    dlBtn.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePdf() {
  document.getElementById('pdfModal').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { document.getElementById('pdfFrame').innerHTML = ''; }, 400);
}

document.getElementById('pdfModal').addEventListener('click', function(e) {
  if (e.target === this) closePdf();
});

/* ── CV MODAL ─────────────────────────────────────────── */
function openCV() {
  document.getElementById('cvModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCV() {
  document.getElementById('cvModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cvModal').addEventListener('click', function(e) {
  if (e.target === this) closeCV();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePdf(); closeCV(); }
});

/* ── VISITOR COUNTER ──────────────────────────────────── */
(function() {
  try {
    const KEY  = 'abdubakr_vc';
    const BASE = 312;
    const sessionKey = 'abdubakr_counted';
    let total = parseInt(localStorage.getItem(KEY) || '0');
    if (!sessionStorage.getItem(sessionKey)) {
      total += 1;
      localStorage.setItem(KEY, total);
      sessionStorage.setItem(sessionKey, '1');
    }
    document.getElementById('visitorCount').textContent = (BASE + total).toLocaleString();
  } catch(e) {
    document.getElementById('visitorCount').textContent = '—';
  }
})();

/* ── PYPI LIVE BADGES ─────────────────────────────────── */
(function fetchPyPI() {
  fetch('https://pypi.org/pypi/deepcsv/json')
    .then(r => r.json())
    .then(d => {
      const el = document.getElementById('pypiVerText');
      if (el && d.info && d.info.version) el.textContent = 'v' + d.info.version;
    })
    .catch(() => {});
})();

/* ── CODE CARD SCROLL HINT — hide neon on scroll ─────── */
(function() {
  const scrollBody = document.getElementById('ccScrollBody');
  const hint = document.querySelector('.cc-scroll-hint');
  if (!scrollBody || !hint) return;
  let hidden = false;
  scrollBody.addEventListener('scroll', () => {
    if (!hidden && scrollBody.scrollTop > 10) {
      hidden = true;
      hint.classList.add('hint-hidden');
    }
  }, { passive: true });
})();

/* ── THEME TOGGLE WITH RIPPLE ─────────────────────────── */
(function setupThemeToggle() {
  const STORAGE_KEY = 'abdubakr_theme';
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  let isAnimating = false;

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function triggerRipple(fromBtn, targetTheme, onMidpoint) {
    // Get button position for ripple origin
    const rect = fromBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Calculate ripple size — must cover the whole viewport
    const maxDist = Math.sqrt(
      Math.max(cx, window.innerWidth - cx) ** 2 +
      Math.max(cy, window.innerHeight - cy) ** 2
    );
    const size = maxDist * 2 + 20;

    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple' + (targetTheme === 'dark' ? ' to-dark' : '');
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${cy - size / 2}px;
      left: ${cx - size / 2}px;
    `;
    document.body.appendChild(ripple);

    // Force reflow before adding expanding class
    ripple.getBoundingClientRect();
    ripple.classList.add('expanding');

    // At the midpoint of the expansion (~300ms), switch the theme
    const midDelay = 320;
    setTimeout(() => {
      onMidpoint();
    }, midDelay);

    // After expansion completes, fade out and remove
    setTimeout(() => {
      ripple.classList.add('done');
      setTimeout(() => {
        ripple.remove();
      }, 250);
    }, 650);
  }

  btn.addEventListener('click', function () {
    if (isAnimating) return;
    isAnimating = true;
    btn.disabled = true;

    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';

    triggerRipple(btn, next, function () {
      // Apply new theme at midpoint of ripple
      if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem(STORAGE_KEY, next);

      // Update particle color
      updateParticleColor(next);
    });

    // Re-enable after animation
    setTimeout(() => {
      isAnimating = false;
      btn.disabled = false;
    }, 700);
  });

  // Listen to system preference changes (if user changes OS theme)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem(STORAGE_KEY)) {
      if (e.matches) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  });
})();

/* ── PARTICLE COLOR SWITCH ON THEME CHANGE ──────────── */
// updateParticleColor is defined near the top, before the particle IIFE