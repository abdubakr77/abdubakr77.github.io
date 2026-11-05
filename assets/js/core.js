/* Abdullah Bakr portfolio: shared shell (every page) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };

  /* ---------------- smooth scroll ---------------- */
  var lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduced && typeof window.Lenis === 'function') {
    lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else {
      var y = target === 0 ? 0 : (typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY);
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeMenus();
    scrollTo(id === '#top' ? 0 : el);
  });

  /* ---------------- loader ---------------- */
  function ready() {
    if (root.classList.contains('is-ready')) return;
    root.classList.add('is-ready');
    if (root.classList.contains('pt-in')) setTimeout(function () { root.classList.add('pt-out'); }, 60);
    if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  }
  Promise.race([
    (document.fonts && document.fonts.ready) || Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]).then(function () { setTimeout(ready, reduced || root.classList.contains('pt-in') ? 0 : 350); });

  /* ---------------- page transition (curtain) ---------------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!/^[\w-]+\.html(\?[^#]*)?(#.*)?$/.test(href)) return;
    if (reduced) return;
    e.preventDefault();
    closeMenus();
    try { sessionStorage.setItem('pt', '1'); } catch (err) { /* private mode */ }
    // a page reached through the curtain still carries pt-in/pt-out, which park the curtain above
    // the screen. Reset it to below the screen first, so every exit rises from the bottom.
    var cur = document.querySelector('.curtain');
    root.classList.remove('pt-in', 'pt-out', 'pt-leave');
    if (cur) void cur.offsetHeight;
    root.classList.add('pt-leave');
    setTimeout(function () { window.location.href = href; }, 650);
  });
  // back/forward cache: the page comes back still covered, so play the exit upwards again
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !root.classList.contains('pt-leave')) return;
    root.classList.remove('pt-leave', 'pt-out');
    root.classList.add('pt-in');
    var cur = document.querySelector('.curtain'); if (cur) void cur.offsetHeight;
    requestAnimationFrame(function () { root.classList.add('pt-out'); });
  });

  /* ---------------- clock ---------------- */
  var clock = $('#clock');
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (e) { fmt = null; }
  function tickClock() { var d = new Date(); clock.textContent = fmt ? fmt.format(d) : d.toTimeString().slice(0, 8); }
  if (clock) { tickClock(); setInterval(tickClock, 1000); }

  /* ---------------- menus ---------------- */
  var dd = $('.dd'), ddBtn = $('.dd__btn'), ddMenu = $('#ddMenu');
  var menuBtn = $('#menuBtn'), mmenu = $('#mobileMenu');
  var ddTimer = 0;
  function setDD(open) {
    if (!ddMenu) return;
    clearTimeout(ddTimer);
    if (open) { ddMenu.hidden = false; requestAnimationFrame(function () { ddMenu.classList.add('is-open'); }); }
    else { ddMenu.classList.remove('is-open'); ddTimer = setTimeout(function () { ddMenu.hidden = true; }, 260); }
    ddBtn.setAttribute('aria-expanded', String(open));
  }
  function closeMenus() {
    setDD(false);
    if (mmenu && !mmenu.hidden) { mmenu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); if (lenis) lenis.start(); }
  }
  if (ddBtn) {
    ddBtn.addEventListener('click', function (e) { e.stopPropagation(); setDD(ddBtn.getAttribute('aria-expanded') !== 'true'); });
    if (finePointer) {
      var leaveT = 0;
      dd.addEventListener('mouseenter', function () { clearTimeout(leaveT); setDD(true); });
      dd.addEventListener('mouseleave', function () { leaveT = setTimeout(function () { setDD(false); }, 220); });
    }
    document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) setDD(false); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = mmenu.hidden; mmenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  });
  // pixels that hop around the grid on the big mega menu cards
  $$('.mega__px').forEach(function (box) {
    var px = $$('i', box);
    function hop() {
      var w = box.clientWidth, h = box.clientHeight;
      if (!w) return;
      px.forEach(function (p) {
        var cx = Math.floor(Math.random() * Math.max(1, Math.floor(w / 24))), cy = Math.floor(Math.random() * Math.max(1, Math.floor(h / 24)));
        p.style.transform = 'translate(' + cx * 24 + 'px,' + cy * 24 + 'px)';
        p.style.opacity = (Math.random() * .7 + .3).toFixed(2);
      });
    }
    if (!reduced) setInterval(function () { if (ddMenu && !ddMenu.hidden) hop(); }, 900);
    hop();
  });

  /* ---------------- bar hide + to top ---------------- */
  var bar = $('#bar'), toTop = $('#toTop');
  var lastY = 0;
  function onScroll(y) {
    if (y > window.innerHeight * .6 && y > lastY + 4) { bar.classList.add('is-hidden'); if (ddMenu && !ddMenu.hidden) setDD(false); }
    else if (y < lastY - 4 || y < 100) bar.classList.remove('is-hidden');
    bar.classList.toggle('is-solid', y > 40);
    if (toTop) toTop.classList.toggle('is-on', y > window.innerHeight * 1.2);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (l) { onScroll(l.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
  if (toTop) toTop.addEventListener('click', function () { scrollTo(0); });

  /* ---------------- generic reveal ---------------- */
  function observeReveal(list) {
    if (reduced || !('IntersectionObserver' in window)) { list.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); obs.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    list.forEach(function (el) { obs.observe(el); });
  }
  observeReveal($$('[data-rv]'));

  /* ---------------- typewriter ---------------- */
  $$('[data-type]').forEach(function (el) {
    var full = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', full);
    var html = full.split(' ').map(function (w) {
      return '<span class="tw-w">' + w.split('').map(function (ch) { return '<span class="tw-c">' + esc(ch) + '</span>'; }).join('') + '</span>';
    }).join(' ');
    el.innerHTML = '<span aria-hidden="true">' + html + '</span>';
    var chars = $$('.tw-c', el);
    var caret = document.createElement('span'); caret.className = 'tw-caret'; caret.setAttribute('aria-hidden', 'true');
    if (reduced || !chars.length) { el.classList.add('is-typed'); return; }
    el.classList.add('is-typing');
    chars[0].parentNode.insertBefore(caret, chars[0]);
    var started = false;
    var go = function () {
      if (started) return; started = true;
      var i = 0;
      var step = function () {
        if (i >= chars.length) { setTimeout(function () { caret.classList.add('is-out'); }, 1400); return; }
        chars[i].classList.add('on');
        chars[i].parentNode.insertBefore(caret, chars[i].nextSibling);
        i++;
        setTimeout(step, chars[i - 1].textContent === '.' ? 160 : 24);
      };
      setTimeout(step, 250);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: .6 });
      io.observe(el);
    } else { go(); }
  });

  /* ---------------- split words ---------------- */
  $$('.words').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
  });

  /* ---------------- dialogs ---------------- */
  function openDlg(d) {
    if (!d) return;
    closeMenus();
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    if (lenis) lenis.stop();
  }
  $$('.dlg').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', function () { if (lenis) lenis.start(); });
  });
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-open-form]');
    if (f) { e.preventDefault(); openDlg($('#formDlg')); return; }
    var c = e.target.closest('[data-cert]');
    if (c && $('#certDlg')) {
      var certImg = $('#certImg'), certTitle = $('#certTitle'), certVerify = $('#certVerify');
      certImg.src = c.dataset.cert; certImg.alt = c.dataset.title + ' certificate'; certTitle.textContent = c.dataset.title;
      if (c.dataset.verify) { certVerify.href = c.dataset.verify; certVerify.hidden = false; } else certVerify.hidden = true;
      openDlg($('#certDlg'));
    }
  });

  /* ---------------- CTA word, copy, footer, form ---------------- */
  var ctaWords = ['Reliable', 'Useful', 'Explainable', 'Remarkable'], wi = 0, cw = $('#ctaWord');
  if (cw && !reduced) setInterval(function () {
    cw.classList.add('is-swap');
    setTimeout(function () { wi = (wi + 1) % ctaWords.length; cw.textContent = ctaWords[wi]; cw.classList.remove('is-swap'); }, 380);
  }, 2400);
  var copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var email = 'abdullah.bakr.official@gmail.com', out = $('#copied');
    var done = function () { out.textContent = 'Copied'; setTimeout(function () { out.textContent = ''; }, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, function () { out.textContent = email; });
    else out.textContent = email;
  });
  var footMore = $('#footMore'), footLinks = $('#footLinks');
  if (footMore) footMore.addEventListener('click', function () {
    var open = footLinks.hidden; footLinks.hidden = !open; footMore.setAttribute('aria-expanded', String(open));
    if (hasGsap) ScrollTrigger.refresh();
  });
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  var form = $('#contactForm'), status = $('#formStatus'), sendBtn = $('#sendBtn');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['f-name', 'f-email', 'f-msg'].forEach(function (id) {
      var el = document.getElementById(id);
      var valid = el.value.trim() !== '' && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest('.field').classList.toggle('is-invalid', !valid);
      el.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) { el.focus(); ok = false; }
    });
    status.className = 'form__status';
    if (!ok) { status.textContent = 'Add your name, a valid email and a message, then send again.'; status.classList.add('is-err'); return; }
    if (form.querySelector('[name="_honey"]').value) return;
    sendBtn.disabled = true; sendBtn.textContent = 'Sending';
    var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
    fetch('https://formsubmit.co/ajax/abdullah.bakr.official@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && String(res.j.success) !== 'false') {
          form.reset(); status.textContent = 'Message sent. Thanks, I will get back to you by email.'; status.classList.add('is-ok'); sendBtn.textContent = 'Sent';
          setTimeout(function () { sendBtn.disabled = false; sendBtn.textContent = 'Send message'; }, 3000);
        } else throw new Error('fail');
      })
      .catch(function () {
        status.innerHTML = 'The message did not go through. Email me directly at <a href="mailto:abdullah.bakr.official@gmail.com">abdullah.bakr.official@gmail.com</a>.';
        status.classList.add('is-err'); sendBtn.disabled = false; sendBtn.textContent = 'Send message';
      });
  });

  /* ---------------- click spark ---------------- */
  if (!reduced) (function () {
    var cv = document.createElement('canvas'); cv.className = 'spark-fx'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), sparks = [], running = false;
    function size() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    size(); window.addEventListener('resize', size);
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(function (s) {
        var t = (now - s.t0) / 420; if (t >= 1) return false;
        var e = 1 - Math.pow(1 - t, 3), d = 4 + e * 22, len = 12 * (1 - e);
        ctx.strokeStyle = s.col; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x + d * Math.cos(s.a), s.y + d * Math.sin(s.a));
        ctx.lineTo(s.x + (d + len) * Math.cos(s.a), s.y + (d + len) * Math.sin(s.a));
        ctx.stroke();
        return true;
      });
      if (sparks.length) requestAnimationFrame(draw); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var light = !!e.target.closest('.wrow, .pd, .resume__page, .is-light');
      var col = light ? 'rgba(0,0,0,.75)' : 'rgba(255,255,255,.9)';
      for (var i = 0; i < 8; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 / 8) * i, t0: performance.now(), col: col });
      if (!running) { running = true; requestAnimationFrame(draw); }
    }, { passive: true });
  })();

  /* ---------------- counters ---------------- */
  function counters(scope) {
    if (!hasGsap || reduced) return;
    $$('.count', scope).forEach(function (el) {
      var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, o = { v: 0 };
      el.textContent = dec ? (0).toFixed(dec) : '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: function () {
            el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-US');
          } });
        }
      });
    });
  }

  /* ---------------- word reveal on scroll ---------------- */
  function wordScrub(scope) {
    if (!hasGsap || reduced) { $$('.words .w', scope).forEach(function (w) { w.style.opacity = 1; w.style.filter = 'none'; }); return; }
    $$('.words', scope).forEach(function (el) {
      var ws = $$('.w', el), blur = el.classList.contains('words--blur');
      gsap.to(ws, { opacity: 1, filter: 'blur(0px)', stagger: .06, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: blur ? 'bottom 55%' : 'bottom 45%', scrub: .6 } });
    });
  }

  // keep trigger positions right when late content (images, fonts) changes the page height
  if (hasGsap && 'ResizeObserver' in window) {
    var lastH = document.body.scrollHeight, rT = 0;
    new ResizeObserver(function () {
      var hNow = document.body.scrollHeight;
      if (Math.abs(hNow - lastH) < 2) return;
      lastH = hNow; clearTimeout(rT); rT = setTimeout(function () { ScrollTrigger.refresh(); }, 180);
    }).observe(document.body);
  }

  window.SITE = { $: $, $$: $$, esc: esc, reduced: reduced, hasGsap: hasGsap, finePointer: finePointer, lenis: lenis, scrollTo: scrollTo, openDlg: openDlg, closeMenus: closeMenus, observeReveal: observeReveal, counters: counters, wordScrub: wordScrub };
})();
