/* Abdullah Bakr portfolio: home page */
(function () {
  'use strict';
  var S = window.SITE;
  var $ = S.$, $$ = S.$$, esc = S.esc, reduced = S.reduced, hasGsap = S.hasGsap;

  /* ---------------- logos ---------------- */
  function logoHTML(list) {
    var one = list.map(function (l) {
      return '<span class="logo" style="--c:' + l[1] + '"><svg viewBox="0 0 24 24" aria-hidden="true" style="color:' + l[1] + '"><path d="' + l[2] + '"/></svg>' + l[0] + '</span>';
    }).join('');
    return one + one;
  }
  if (window.LOGOS) {
    $('#logosA').innerHTML = logoHTML(window.LOGOS.a);
    $('#logosB').innerHTML = logoHTML(window.LOGOS.b);
    $$('#logosA .logo, #logosB .logo').forEach(function (l, i, arr) { if (i >= arr.length / 2) l.setAttribute('aria-hidden', 'true'); });
  }

  /* ---------------- projects ---------------- */
  var P = window.PROJECTS || [];
  var rowsEl = $('#workRows'), bgsEl = $('#workBgs');
  rowsEl.innerHTML = P.map(function (p, i) {
    var n = String(i + 1).padStart(2, '0');
    return '<li class="wrow" data-i="' + i + '">' +
      '<div class="wrow__l"><p class="wrow__n">' + n + '</p><p class="wrow__c">' + p.cat + '</p><p class="wrow__d">' + p.short + '</p></div>' +
      '<div class="wrow__img"><img src="' + p.img + '" alt="' + p.title + ' preview" loading="lazy"></div>' +
      '<div class="wrow__r"><h3 class="wrow__t">' + p.title + '</h3><p class="wrow__y">' + p.year + '</p><button type="button" class="wrow__more" data-proj="' + i + '">View more</button></div>' +
      '</li>';
  }).join('');
  bgsEl.innerHTML = P.map(function (p, i) { return '<div class="work__bg' + (i === 0 ? ' is-on' : '') + '" style="background-image:url(' + p.bg + ')"></div>'; }).join('');
  var bgs = $$('.work__bg'), workBar = $('#workBar'), workNum = $('#workNum');
  var curProj = -1;
  function setProj(i) {
    if (i === curProj) return; curProj = i;
    bgs.forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
    workNum.textContent = (i + 1) + ' / ' + P.length;
    workBar.style.width = ((i + 1) / P.length * 100) + '%';
  }
  setProj(0);

  var projBody = $('#projBody');
  function openProject(i) {
    var p = P[i]; if (!p) return;
    var h = '<div class="pd__hero' + (p.id === 'dental' || p.id === 'skin' ? ' pd__hero--contain' : '') + '"><img src="' + p.img + '" alt="' + esc(p.title) + '"></div><div class="pd__in">';
    h += '<p class="pd__kind">' + esc(p.kind) + '</p><h2 id="projTitle">' + esc(p.title) + '</h2><p class="pd__lead">' + esc(p.lead) + '</p>';
    h += '<dl class="pd__metrics">' + p.metrics.map(function (m) { return '<div><dd>' + esc(m[0]) + '</dd><dt>' + esc(m[1]) + '</dt></div>'; }).join('') + '</dl>';
    if (p.chart) {
      h += '<div class="pd__chart"><p>Mean AUC on the same test split, 14 diseases</p><ul>' + p.chart.map(function (c) {
        var w = ((c[1] - .80) / .06 * 100).toFixed(1);
        return '<li><span>' + esc(c[0]) + '</span><span class="bar"><i style="width:' + w + '%"></i><b style="right:auto;left:' + w + '%;translate:0 -50%">' + c[1].toFixed(4) + '</b></span></li>';
      }).join('') + '</ul><small>Axis runs from 0.80 to 0.86 so the gaps are readable.</small></div>';
    }
    if (p.steps) h += '<ol class="pd__steps">' + p.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
    if (p.code) h += '<pre class="pd__code"><span class="p">$</span> pip install deepcsv\n\n<span class="k">from</span> deepcsv <span class="k">import</span> read_any, auto_fix, process_all_files\n\ndf = read_any(<span class="s">"orders.parquet"</span>)   <span class="c"># csv, xlsx, json, parquet</span>\ndf = auto_fix(df)                  <span class="c"># fix mixed-type columns</span>\nprocess_all_files(<span class="s">"data/"</span>)         <span class="c"># a whole folder tree</span></pre>';
    h += '<ul class="pd__points">' + p.points.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (p.extraImg) h += '<figure class="pd__extra"><img src="' + p.extraImg[0] + '" alt="' + esc(p.extraImg[1]) + '" loading="lazy"><figcaption>' + esc(p.extraImg[1]) + '</figcaption></figure>';
    h += '<p class="pd__stack">' + esc(p.stack) + '</p>';
    h += '<div class="pd__links"><a href="project.html?p=' + p.id + '">Full case study</a>' + p.links.map(function (l) { return '<a href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join('') + '</div></div>';
    projBody.innerHTML = h;
    projBody.scrollTop = 0;
    S.openDlg($('#projDlg'));
  }
  rowsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-proj]');
    if (b) openProject(+b.dataset.proj);
    else { var r = e.target.closest('.wrow'); if (r && window.innerWidth <= 860) openProject(+r.dataset.i); }
  });
  $('#allCerts').addEventListener('click', function () { S.openDlg($('#listDlg')); });

  /* ---------------- books ---------------- */
  var B = window.BOOKS || [];
  var booksEl = $('#books');
  booksEl.innerHTML = B.map(function (b, i) {
    var links = '<a href="' + b.gh + '" target="_blank" rel="noopener">Code</a>' + (b.kg ? '<a href="' + b.kg + '" target="_blank" rel="noopener">Notebook</a>' : '');
    var cover = b.img ? '<img src="' + b.img + '" alt="" loading="lazy">' : '<span class="book__dots"><i></i><i></i></span>';
    return '<li class="book" data-i="' + i + '"><article class="book__in" style="--bc:' + b.c + '" title="' + esc(b.d) + '"><div class="book__cover">' + cover + '</div><div class="book__body"><h3>' + esc(b.t) + '</h3><p>' + esc(b.m) + '</p><div class="book__links">' + links + '</div></div></article></li>';
  }).join('');
  var bookIdx = 0, bookEls = $$('.book');
  function perView() { return window.innerWidth <= 560 ? 1 : window.innerWidth <= 860 ? 2 : 3; }
  function renderBooks() {
    var pv = perView(); var max = Math.max(0, B.length - pv);
    bookIdx = Math.max(0, Math.min(bookIdx, max));
    booksEl.style.transform = 'translateX(' + (-bookIdx * (100 / pv)) + '%)';
    var center = bookIdx + Math.floor(pv / 2);
    bookEls.forEach(function (el, i) { el.classList.toggle('is-center', pv === 3 && i === center); });
    $('#bookPrev').disabled = bookIdx === 0; $('#bookNext').disabled = bookIdx >= max;
  }
  $('#bookPrev').addEventListener('click', function () { bookIdx -= 1; renderBooks(); });
  $('#bookNext').addEventListener('click', function () { bookIdx += 1; renderBooks(); });
  window.addEventListener('resize', renderBooks);
  renderBooks();
  (function () {
    var x0 = null;
    booksEl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    booksEl.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { bookIdx += dx < 0 ? 1 : -1; renderBooks(); } x0 = null;
    });
  })();

  /* ---------------- role pill ---------------- */
  var roles = [
    ['Computer Vision Engineer', 'Detection, segmentation, classification'],
    ['Medical Imaging', 'Chest and dental X-rays, ultrasound, skin'],
    ['Kaggle Notebooks Expert', 'Public notebooks, runnable end to end'],
    ['Open Source', 'deepcsv, 17,500+ downloads on PyPI'],
    ['Researcher', 'First-author chest X-ray preprint']
  ];
  var rp = $('#rolePill'), rt = $('#roleT'), rs = $('#roleS'), ri = 0;
  if (!reduced) setInterval(function () {
    rp.classList.add('is-out');
    setTimeout(function () { ri = (ri + 1) % roles.length; rt.textContent = roles[ri][0]; rs.textContent = roles[ri][1]; rp.classList.remove('is-out'); }, 650);
  }, 2800);

  /* ---------------- live numbers ---------------- */
  fetch('https://api.github.com/users/abdubakr77').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j) return;
    if (j.public_repos) $('#ghRepos').textContent = j.public_repos;
    if (typeof j.followers === 'number') $('#ghFollowers').textContent = j.followers;
    if (j.created_at) $('#ghSince').textContent = j.created_at.slice(0, 4);
  }).catch(function () {});
  fetch('https://pypi.org/pypi/deepcsv/json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j) return;
    if (j.info && j.info.version) $('#pypiVer').textContent = j.info.version;
    if (j.releases) { var n = Object.keys(j.releases).length; $('#pypiRel').textContent = n; $('#pypiRel2').textContent = n; }
  }).catch(function () {});

  /* ---------------- pointer toys (desktop) ---------------- */
  if (S.finePointer && !reduced) {
    // certificate cards tilt toward the cursor
    $$('.ccard').forEach(function (c) {
      var inner = $('.ccard__in', c);
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        inner.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
        inner.style.setProperty('--rx', ((.5 - y) * 12).toFixed(2) + 'deg');
        inner.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
        inner.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg'); });
    });
    // cubes lean toward the cursor
    $$('.feat').forEach(function (f) {
      var t = $('.cube-tilt', f);
      f.addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
        t.style.setProperty('--tx', (x * 40).toFixed(1) + 'deg');
        t.style.setProperty('--ty', (-y * 30).toFixed(1) + 'deg');
      });
      f.addEventListener('pointerleave', function () { t.style.setProperty('--tx', '0deg'); t.style.setProperty('--ty', '0deg'); });
    });
    // loupe on the zoomed dental X-ray
    var gz = $('#gz'), lens = $('.gz__lens', gz), gzImg = $('.gz__img', gz);
    gz.addEventListener('pointermove', function (e) {
      if (!gz.classList.contains('is-full') || e.target.closest('.gz__btn')) { lens.classList.remove('is-on'); return; }
      var r = gz.getBoundingClientRect(), iw = gzImg.naturalWidth || 2950, ih = gzImg.naturalHeight || 1316;
      var sc = Math.max(r.width / iw, r.height / ih), dw = iw * sc, dh = ih * sc, ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
      var x = e.clientX - r.left, y = e.clientY - r.top, z = 2.2, L = lens.offsetWidth / 2;
      lens.style.transform = 'translate(' + (x - L) + 'px,' + (y - L) + 'px)';
      lens.style.backgroundSize = (dw * z) + 'px ' + (dh * z) + 'px';
      lens.style.backgroundPosition = (-(x - ox) * z + L) + 'px ' + (-(y - oy) * z + L) + 'px';
      lens.classList.add('is-on');
    });
    gz.addEventListener('pointerleave', function () { lens.classList.remove('is-on'); });
  }

  /* ============== scroll scenes (GSAP) ============== */
  S.wordScrub(document);
  if (!hasGsap || reduced) {
    var cam0 = $('.xray__cam'); if (cam0) cam0.style.opacity = .9;
    $('#gz').classList.add('is-full'); $('#gzFound').textContent = '4'; $('#gzConf').textContent = '0.99';
    return;
  }
  S.counters(document);

  // hero scroll-out
  gsap.to('.hero__stage', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__bg', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true } });

  // focus box
  gsap.fromTo('.focus__box', { scale: .94, opacity: .25 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.focus', start: 'top bottom', end: 'center center', scrub: true } });

  // ecosystem cards: a card dims only once the next one actually slides over it
  var ecoCards = $$('.eco__card');
  ecoCards.forEach(function (c, i) {
    if (i === ecoCards.length - 1) return;
    var next = ecoCards[i + 1];
    gsap.fromTo(c, { scale: 1, filter: 'brightness(1)' }, {
      scale: .95, filter: 'brightness(0.5)', ease: 'none',
      scrollTrigger: {
        trigger: next, scrub: true, invalidateOnRefresh: true,
        start: function () { return 'top ' + (parseFloat(getComputedStyle(c).top) + c.offsetHeight) + 'px'; },
        end: function () { return 'top ' + (parseFloat(getComputedStyle(next).top) + 8) + 'px'; }
      }
    });
  });
  gsap.fromTo('.eco__card', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .15, ease: 'power2.out', scrollTrigger: { trigger: '.eco', start: 'top 85%', end: 'top 45%', scrub: 1 } });

  // expertise: cubes spin with the scroll, float, glow and the copy builds up
  $$('.feat').forEach(function (f, i) {
    var dir = i % 2 ? -1 : 1;
    var cube = $('.cube', f), flt = $('.cube-float', f), glow = $('.feat__glow', f);
    gsap.fromTo(cube, { rotateX: -24, rotateY: 34 * dir, rotateZ: 0 }, {
      rotateX: 336, rotateY: 34 * dir + 360 * dir, rotateZ: 24 * dir, ease: 'none',
      scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
    gsap.fromTo(flt, { y: 120, scale: .78 }, { y: -120, scale: 1.08, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    var cols = (f.dataset.glow || '#6d3fc0').split(',');
    glow.style.setProperty('--g', cols[0]);
    var gtl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 60%', end: 'bottom 40%', scrub: 1 } });
    cols.slice(1).forEach(function (c) { gtl.to(glow, { '--g': c, ease: 'none', duration: 1 }); });
    gsap.fromTo(glow, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1.15, ease: 'none', scrollTrigger: { trigger: f, start: 'top 80%', end: 'center center', scrub: true } });

    var txt = $('.feat__text', f), h2 = $('h2', txt), p = $('p:not(.feat__num)', txt), chips = $$('.chips li', txt);
    p.classList.add('words'); p.setAttribute('aria-label', p.textContent.trim());
    p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w" aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
    var tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 75%', end: 'top -15%', scrub: 1 } });
    tl.fromTo($('.feat__num', txt), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: .3 })
      .fromTo(h2, { opacity: 0, y: 70, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: .5 }, .05)
      .to($$('.w', p), { opacity: 1, filter: 'blur(0px)', stagger: .02, duration: .3 }, .3)
      .fromTo(chips, { opacity: 0, y: 24, scale: .8 }, { opacity: 1, y: 0, scale: 1, stagger: .06, duration: .25, ease: 'back.out(2)' }, .6);
    gsap.fromTo($('.feat__bar i', f), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top top', end: 'bottom bottom', scrub: true } });
  });

  // certificates: the cards fly in from a loose pile and settle into the grid
  var cc = $$('.ccard');
  var scatter = [[-140, 120, -14], [0, 180, 9], [150, 110, 16], [-120, 160, 11], [40, 220, -8], [160, 170, -13]];
  cc.forEach(function (c, i) {
    var s = scatter[i % scatter.length];
    gsap.fromTo(c, { x: s[0], y: s[1], rotate: s[2], scale: .82, opacity: 0 }, {
      x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '#cgrid', start: 'top 98%', end: 'top 40%', scrub: 1 }
    });
  });

  // x-ray attention fade
  var cam = $('.xray__cam'), pct = $('#xrayPct');
  ScrollTrigger.create({
    trigger: '#xray', start: 'top 75%', end: 'bottom 45%', scrub: true,
    onUpdate: function (s) { var v = s.progress; cam.style.opacity = (v * .95).toFixed(3); pct.textContent = 'attention ' + Math.round(v * 100) + '%'; }
  });
  gsap.fromTo('.xray__frame', { scale: .9, borderRadius: 24 }, { scale: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: '#xray', start: 'top bottom', end: 'top 30%', scrub: true } });

  var mm = gsap.matchMedia();

  mm.add('(min-width: 861px)', function () {
    // story: one continuous expansion from the corner to full screen
    var stl = gsap.timeline({ scrollTrigger: { trigger: '.story__pin', start: 'top top', end: '+=190%', scrub: 1.2, pin: true, anticipatePin: 1 } });
    stl.to('.story__intro', { opacity: 0, scale: .92, duration: .3, ease: 'power1.in' }, 0)
       .fromTo('.story__card', { clipPath: 'inset(80% 0% 0% 84% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'power1.inOut' }, 0)
       .fromTo('.marquee--big', { scale: .86 }, { scale: 1, duration: 1, ease: 'power1.out' }, 0)
       .fromTo('.marquee--big span', { color: '#3f3f46' }, { color: '#ffffff', duration: .8, ease: 'none' }, .2);
    gsap.to('.stats__inner', { x: function () { return -Math.min(window.innerWidth * .26, 420); }, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'bottom 95%', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });

    // work showcase
    var N = P.length, rowH = function () { return $('.work__band').offsetHeight; };
    gsap.to('#workRows', {
      y: function () { return -(N - 1) * rowH(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.work__pin', start: 'top top', end: function () { return '+=' + (N * 70) + '%'; }, scrub: .8, pin: true, anticipatePin: 1,
        snap: { snapTo: 1 / (N - 1), duration: { min: .2, max: .5 }, ease: 'power2.inOut' },
        invalidateOnRefresh: true,
        onUpdate: function (s) { setProj(Math.round(s.progress * (N - 1))); }
      }
    });
    gsap.fromTo('.work__band', { scaleX: .7, opacity: 0 }, { scaleX: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.work', start: 'top 80%', end: 'top 20%', scrub: true } });

    // journey horizontal
    var track = $('#journeyTrack'), prog = $('#journeyProgress'), items = $$('.jn', track);
    var dist = function () { return track.scrollWidth - window.innerWidth + 40; };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.journey__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: .8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function () {
          var mid = window.innerWidth * .5;
          var lineBox = track.querySelector('.journey__line').getBoundingClientRect();
          prog.style.width = Math.max(0, Math.min(lineBox.width, mid - lineBox.left)) + 'px';
          items.forEach(function (it) { var x = $('.jn__dot', it).getBoundingClientRect().left; it.classList.toggle('is-on', x < mid + 4); });
        }
      }
    });
    items[0].classList.add('is-on');

    // gallery: a window over the full-resolution X-ray opens to full screen, then the model "runs"
    var gz = $('#gz'), slot = $('.gi--center'), gPin = $('.gallery__pin'), gGrid = $('.gallery__grid');
    var others = $$('.gi:not(.gi--center)');
    var slotInset = function () {
      var g = gGrid.getBoundingClientRect(), p = gPin.getBoundingClientRect();
      var l = g.left - p.left + slot.offsetLeft, t = g.top - p.top + slot.offsetTop;
      return 'inset(' + t + 'px ' + (p.width - l - slot.offsetWidth) + 'px ' + (p.height - t - slot.offsetHeight) + 'px ' + l + 'px round 14px)';
    };
    var found = $('#gzFound'), conf = $('#gzConf');
    var gtl = gsap.timeline({
      scrollTrigger: {
        trigger: '.gallery__pin', start: 'top top', end: '+=170%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var v = s.progress;
          gz.classList.toggle('is-full', v > .62);
          var sc = Math.max(0, Math.min(1, (v - .5) / .45));
          found.textContent = Math.min(4, Math.floor(sc * 4.4));
          conf.textContent = (sc * .99).toFixed(2);
        }
      }
    });
    gtl.fromTo(gz, { clipPath: slotInset }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: .55, ease: 'power2.inOut' }, 0)
       .fromTo($('.gz__img', gz), { scale: 1.12 }, { scale: 1, duration: .55, ease: 'power2.inOut' }, 0)
       .fromTo(gz, { '--scan': '0%' }, { '--scan': '100%', duration: .45, ease: 'none' }, .5)
       .fromTo($('.gz__hud', gz), { opacity: 0 }, { opacity: 1, duration: .12 }, .42)
       .fromTo($('.gz__btn', gz), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .15 }, .8);
    others.forEach(function (o) {
      gtl.to(o, {
        x: function () { var r = o.getBoundingClientRect(), p = gPin.getBoundingClientRect(); return (r.left - p.left + r.width / 2 - p.width / 2) * 1.2; },
        y: function () { var r = o.getBoundingClientRect(), p = gPin.getBoundingClientRect(); return (r.top - p.top + r.height / 2 - p.height / 2) * 1.2; },
        opacity: 0, scale: .9, ease: 'power2.in', duration: .5
      }, 0);
    });

    // box
    gsap.fromTo('.openbox', { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.boxsec', start: 'top 70%', end: 'top 20%', scrub: true } });
    gsap.fromTo('.boxsec__h', { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.boxsec', start: 'top 85%', end: 'top 35%', scrub: true } });

    return function () { setProj(0); gz.classList.remove('is-full'); };
  });

  mm.add('(max-width: 860px)', function () {
    var line = $('.journey__line');
    ScrollTrigger.create({ trigger: '#journeyTrack', start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { line.style.setProperty('--jp', (s.progress * 100) + '%'); } });
    $$('.jn').forEach(function (j) { j.classList.add('is-on'); });
    var gz = $('#gz');
    gz.classList.add('is-full');
    ScrollTrigger.create({ trigger: gz, start: 'top 80%', end: 'bottom 40%', scrub: true, onUpdate: function (s) {
      gz.style.setProperty('--scan', (s.progress * 100) + '%');
      $('#gzFound').textContent = Math.min(4, Math.floor(s.progress * 4.4)); $('#gzConf').textContent = (s.progress * .99).toFixed(2);
    } });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
