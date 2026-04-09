/* ============================================================
   Abdullah Bakr — Portfolio JS
   main.js
   ============================================================ */

/* ── INTRO SCREEN ─────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('intro-overlay').classList.add('gone');
  }, 1900);
});

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

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(96,165,250,${0.07 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${p.a})`;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
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

/* ── ACTIVE NAV LINK ──────────────────────────────────── */
const navSecs = document.querySelectorAll('section[id]');
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
const EDRAAK_URL = 'https://programs.edraak.org/learn/verify-certificate/3ef81f4aaef747fca57199a199dc89d9/?lang=en';

/**
 * openCert(name, src)
 *  src = relative file path  → embed in iframe  (e.g. "certificates/ai4e.pdf")
 *  src = full URL starting http → show external link card
 *  src = null / '' → show fallback
 */
function openCert(name, src) {
  const modal  = document.getElementById('pdfModal');
  const frame  = document.getElementById('pdfFrame');
  const title  = document.getElementById('pdfTitle');
  const dlBtn  = document.getElementById('pdfDlLink');

  title.textContent = name;

  if (src && src.startsWith('http')) {
    // External cert — pretty card
    frame.innerHTML = `
      <div class="pdf-ext">
        <div class="big-icon">🎓</div>
        <h3>${name}</h3>
        <p>This certificate is hosted externally. Click below to view and verify it.</p>
        <a href="${src}" target="_blank" rel="noopener">View &amp; Verify Certificate ↗</a>
      </div>`;
    dlBtn.style.display = 'none';
  } else if (src) {
    // Local file — embed iframe
    frame.innerHTML = `<iframe src="${src}" title="${name}"></iframe>`;
    dlBtn.href     = src;
    dlBtn.download = name.replace(/[^a-z0-9]/gi, '_') + '.pdf';
    dlBtn.style.display = 'flex';
  } else {
    frame.innerHTML = `
      <div class="pdf-ext">
        <div class="big-icon">📄</div>
        <h3>${name}</h3>
        <p>Certificate file not linked yet. Add the file path to the data-src attribute.</p>
      </div>`;
    dlBtn.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePdf() {
  document.getElementById('pdfModal').classList.remove('open');
  document.body.style.overflow = '';
  // Clear iframe after transition to free memory
  setTimeout(() => { document.getElementById('pdfFrame').innerHTML = ''; }, 400);
}

// Close on backdrop click
document.getElementById('pdfModal').addEventListener('click', function (e) {
  if (e.target === this) closePdf();
});
// Close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePdf(); });

/* ── VISITOR COUNTER ──────────────────────────────────── */
(function () {
  try {
    const KEY  = 'abdubakr_vc';
    const BASE = 312;
    // Only count once per session
    const sessionKey = 'abdubakr_counted';
    let total = parseInt(localStorage.getItem(KEY) || '0');
    if (!sessionStorage.getItem(sessionKey)) {
      total += 1;
      localStorage.setItem(KEY, total);
      sessionStorage.setItem(sessionKey, '1');
    }
    document.getElementById('visitorCount').textContent = (BASE + total).toLocaleString();
  } catch (e) {
    document.getElementById('visitorCount').textContent = '—';
  }
})();

/* ── PYPI LIVE BADGES ─────────────────────────────────── */
(function fetchPyPI() {
  // Version from PyPI JSON API
  fetch('https://pypi.org/pypi/deepcsv/json')
    .then(r => r.json())
    .then(d => {
      const el = document.getElementById('pypiVerText');
      if (el && d.info && d.info.version) {
        el.textContent = 'v' + d.info.version;
      }
    })
    .catch(() => {});
})();