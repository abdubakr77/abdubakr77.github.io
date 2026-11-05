/* Projects page */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;
  var P = window.PROJECTS || [], B = window.BOOKS || [];
  var CATS = [['all', 'All'], ['medical', 'Medical imaging'], ['detection', 'Detection & segmentation'], ['classification', 'Classification'], ['data', 'Data & tabular ML']];
  var CAT_OF = { chest: ['medical'], dental: ['medical', 'detection'], skin: ['medical', 'detection'], drone: ['detection'], sia: ['classification'], deepcsv: ['data'] };
  function bookCats(b) {
    var g = (b.gh || '').toLowerCase();
    if (g.indexOf('cancer') >= 0) return ['medical', 'classification'];
    if (/stellar|stock|weather|iris/.test(g)) return ['data'];
    return ['classification'];
  }
  var LABEL = { medical: 'Medical', detection: 'Detection', classification: 'Classification', data: 'Data' };
  var ALL = P.map(function (p) {
    return { t: p.title, cats: CAT_OF[p.id] || ['classification'], m: p.metrics[0][0] + ' ' + p.metrics[0][1], d: p.lead.split('. ')[0].replace(/\.$/, '') + '.', img: p.img, href: 'project.html?p=' + p.id, ext: false, feat: true };
  }).concat(B.map(function (b) {
    return { t: b.t, cats: bookCats(b), m: b.m, d: b.d, img: b.img || '', href: b.gh, kg: b.kg, ext: true, color: b.c };
  }));

  /* hero image rows */
  var imgs = ALL.filter(function (x) { return x.img; }).map(function (x) { return x.img; });
  function rowHTML(list) { var one = list.map(function (s) { return '<figure><img src="' + s + '" alt="" loading="lazy"></figure>'; }).join(''); return one + one; }
  $('#pjRowA').innerHTML = rowHTML(imgs.slice(0, 8));
  $('#pjRowB').innerHTML = rowHTML(imgs.slice(6).concat(imgs.slice(0, 2)));

  /* featured cards */
  $('#pjFeat').innerHTML = P.map(function (p, i) {
    return '<a class="pf" href="project.html?p=' + p.id + '" style="--i:' + i + '">' +
      '<span class="pf__img"><img src="' + p.img + '" alt="" loading="lazy"></span>' +
      '<span class="pf__n">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="pf__body"><span class="pf__cat">' + esc(p.cat) + '</span><b class="pf__t">' + esc(p.title) + '</b>' +
      '<span class="pf__m"><b>' + esc(p.metrics[0][0]) + '</b> ' + esc(p.metrics[0][1]) + '</span>' +
      '<span class="pf__go">Case study <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></span></a>';
  }).join('');

  /* archive */
  var list = $('#pjList'), cat = 'all', q = '', view = 'list';
  $('#pjCats').innerHTML = CATS.map(function (c) {
    var n = c[0] === 'all' ? ALL.length : ALL.filter(function (x) { return x.cats.indexOf(c[0]) >= 0; }).length;
    return '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === 'all') + '">' + c[1] + '<small>' + n + '</small></button>';
  }).join('');
  function render() {
    var items = ALL.filter(function (x) {
      return (cat === 'all' || x.cats.indexOf(cat) >= 0) && (!q || (x.t + ' ' + x.d + ' ' + x.m).toLowerCase().indexOf(q) >= 0);
    });
    $('#pjCount').textContent = items.length;
    $('#pjEmpty').hidden = items.length > 0;
    list.className = 'pj-list pj-list--' + view;
    list.innerHTML = items.map(function (x, i) {
      var badges = x.cats.map(function (c) { return '<span class="badge">' + LABEL[c] + '</span>'; }).join('');
      var cover = x.img ? '<img src="' + x.img + '" alt="" loading="lazy">' : '<span class="pj-cover" style="--c:' + (x.color || '#27272a') + '"><b>' + esc(x.t.split(' ')[0]) + '</b></span>';
      var go = x.ext ? 'code <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>' : 'view <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      var extra = x.kg ? '<a class="pj-it__kg" href="' + x.kg + '" target="_blank" rel="noopener">Notebook</a>' : '';
      return '<li class="pj-it" style="--d:' + (i * 0.04) + 's" data-img="' + (x.img || '') + '">' +
        '<a class="pj-it__a" href="' + x.href + '"' + (x.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<span class="pj-it__cover">' + cover + '</span>' +
        '<span class="pj-it__n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="pj-it__main"><span class="pj-it__t">' + esc(x.t) + badges + (x.feat ? '<span class="badge badge--lime">Case study</span>' : '') + '</span>' +
        '<span class="pj-it__d">' + esc(x.d) + '</span></span>' +
        '<span class="pj-it__m">' + esc(x.m) + '</span>' +
        '<span class="pj-it__go">' + go + '</span></a>' + extra + '</li>';
    }).join('');
    requestAnimationFrame(function () { list.classList.add('is-in'); });
    if (S.hasGsap) ScrollTrigger.refresh();
  }
  $('#pjCats').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    cat = b.dataset.cat;
    $$('#pjCats button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    list.classList.remove('is-in'); render();
  });
  var sT = 0;
  $('#pjSearch').addEventListener('input', function (e) { clearTimeout(sT); sT = setTimeout(function () { q = e.target.value.trim().toLowerCase(); list.classList.remove('is-in'); render(); }, 120); });
  $$('.viewtg [data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      view = b.dataset.view;
      $$('.viewtg [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      list.classList.remove('is-in'); render();
    });
  });
  render();

  /* image preview that follows the cursor in list view */
  var prev = $('#pjPrev'), prevImg = $('img', prev);
  if (S.finePointer && !S.reduced) {
    var px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    var loop = function () { px += (tx - px) * .16; py += (ty - py) * .16; prev.style.transform = 'translate(' + px + 'px,' + py + 'px)'; raf = requestAnimationFrame(loop); };
    list.addEventListener('pointermove', function (e) { tx = e.clientX + 24; ty = e.clientY - 90; if (!raf) raf = requestAnimationFrame(loop); });
    list.addEventListener('pointerover', function (e) {
      var it = e.target.closest('.pj-it'); if (!it || view !== 'list') return;
      if (it.dataset.img) { prevImg.src = it.dataset.img; prev.classList.add('is-on'); } else prev.classList.remove('is-on');
    });
    list.addEventListener('pointerleave', function () { prev.classList.remove('is-on'); cancelAnimationFrame(raf); raf = 0; });
  }

  /* scroll scenes */
  S.counters(document);
  if (!S.hasGsap || S.reduced) return;
  gsap.to('.pj-hero__in', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.pj-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.pj-hero__rows', { scale: 1, filter: 'brightness(.42)' }, { scale: 1.18, filter: 'brightness(.7)', ease: 'none', scrollTrigger: { trigger: '.pj-hero', start: 'top top', end: 'bottom top', scrub: true } });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    var track = $('#pjFeat'), cards = $$('.pf', track), num = $('#pjFeatNum'), bar = $('#pjFeatBar');
    var dist = function () { return track.scrollWidth - window.innerWidth + Math.max(32, (window.innerWidth - 1180) / 2); };
    var hz = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.pj-feat__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: .8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) {
          bar.style.transform = 'scaleX(' + s.progress + ')';
          num.textContent = String(Math.min(cards.length, Math.floor(s.progress * cards.length) + 1)).padStart(2, '0');
        }
      }
    });
    cards.forEach(function (c) {
      gsap.fromTo($('.pf__img img', c), { xPercent: -12, scale: 1.2 }, { xPercent: 12, scale: 1.2, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: hz, start: 'left right', end: 'right left', scrub: true } });
    });
  });
})();
