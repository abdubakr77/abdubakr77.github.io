/* Experience page */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;
  var EXP = window.EXP || [], CERTS = window.CERTS || [], IC = window.ICONS || {};
  var certById = {}; CERTS.forEach(function (c) { certById[c.id] = c; });

  /* organisation marquee */
  function org(name, icon) {
    var i = icon && IC[icon];
    return '<span class="org">' + (i ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + i[1] + '"/></svg>' : '<i class="org__mono">' + esc(name.charAt(0)) + '</i>') + esc(name) + '</span>';
  }
  var A = [['FlyRank AI'], ['Shipd'], ['Kaggle', 'Kaggle'], ['PyPI', 'PyPI'], ['GitHub', 'GitHub'], ['Research Square', 'DOI'], ['Science Valley Academy'], ['LinkedIn', 'LinkedIn']];
  var Bl = [['Udacity', 'Udacity'], ['Cisco Networking Academy', 'Cisco'], ['Google for Developers', 'Google'], ['Huawei', 'Huawei'], ['Anthropic', 'Anthropic'], ['ITI MaharaTech'], ['Edraak'], ['ORCID', 'ORCID']];
  function row(list) { var one = list.map(function (x) { return org(x[0], x[1]); }).join(''); return one + one + one; }
  $('#xpOrgsA').innerHTML = row(A); $('#xpOrgsB').innerHTML = row(Bl);

  /* timeline */
  var log = $('#xpLog'), kind = 'all';
  function att(a) {
    if (a[0] === 'cert') {
      var c = certById[a[1]]; if (!c) return '';
      if (!c.img) return '<span class="xatt xatt--txt"><b>' + esc(c.t) + '</b><small>' + esc(c.o) + '</small></span>';
      return '<button type="button" class="xatt xatt--img" data-cert="' + c.img + '" data-title="' + esc(c.t + ', ' + c.o) + '"' + (c.v ? ' data-verify="' + c.v + '"' : '') + '><img src="' + c.img + '" alt="' + esc(c.t) + ' certificate" loading="lazy"><span>' + esc(c.t) + '</span></button>';
    }
    var i = a[4] && IC[a[4]];
    return '<a class="xatt" href="' + a[3] + '" target="_blank" rel="noopener"><span class="xatt__top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.5.5M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.5-.5"/></svg>' + esc(a[1]) + '</span><b>' + esc(a[2]) + '</b><small>Open on ' + esc(a[1]) + '</small>' +
      (i ? '<span class="xatt__logo" style="--c:' + i[0] + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + i[1] + '"/></svg></span>' : '') + '</a>';
  }
  function render() {
    var items = EXP.filter(function (e) { return kind === 'all' || e.kind === kind; });
    var years = [];
    items.forEach(function (e) { if (years.indexOf(e.y) < 0) years.push(e.y); });
    log.innerHTML = years.map(function (y) {
      var es = items.filter(function (e) { return e.y === y; });
      return '<div class="xy"><div class="xy__year"><span class="xy__dot"></span><b>' + y + '</b><span class="xy__line"><i></i></span></div><div class="xy__items">' + es.map(function (e) {
        var pts = e.pts.length ? '<ul class="xe__pts">' + e.pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '';
        var atts = e.att.map(att).join('');
        var many = e.att.length > 2;
        return '<article class="xe" data-rv><span class="xe__node" aria-hidden="true"></span>' +
          '<header class="xe__head"><div><h3>' + esc(e.role) + '</h3><p class="xe__org">' + esc(e.org) + ' <span>&middot; ' + esc(e.where) + '</span></p></div><span class="xe__when">' + esc(e.when) + '</span></header>' +
          '<p class="xe__lead">' + esc(e.lead) + '</p>' + pts +
          '<div class="xe__tags">' + e.tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
          (atts ? '<div class="xe__att' + (many ? ' is-clip' : '') + '">' + atts + '</div>' + (many ? '<button type="button" class="xe__more" aria-expanded="false">+' + (e.att.length - 2) + ' more attachments <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' : '') : '') +
          '</article>';
      }).join('') + '</div></div>';
    }).join('');
    S.observeReveal($$('[data-rv]', log));
    bindLines();
    if (S.hasGsap) ScrollTrigger.refresh();
  }
  log.addEventListener('click', function (e) {
    var m = e.target.closest('.xe__more'); if (!m) return;
    var box = m.previousElementSibling, open = box.classList.toggle('is-open');
    m.setAttribute('aria-expanded', String(open));
    m.firstChild.textContent = open ? 'Show fewer ' : '+' + ($$('.xatt', box).length - 2) + ' more attachments ';
    if (S.hasGsap) ScrollTrigger.refresh();
  });
  $('#xpTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'); if (!b) return;
    kind = b.dataset.k;
    $$('#xpTabs button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    log.classList.add('is-swap');
    setTimeout(function () { render(); log.classList.remove('is-swap'); }, 220);
  });

  var lineST = [];
  function bindLines() {
    lineST.forEach(function (s) { s.kill(); }); lineST = [];
    if (!S.hasGsap || S.reduced) { $$('.xy__line i', log).forEach(function (i) { i.style.transform = 'scaleY(1)'; }); return; }
    $$('.xy', log).forEach(function (y) {
      var i = $('.xy__line i', y);
      lineST.push(ScrollTrigger.create({ trigger: y, start: 'top 60%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { i.style.transform = 'scaleY(' + s.progress + ')'; } }));
      $$('.xe', y).forEach(function (e) {
        lineST.push(ScrollTrigger.create({ trigger: e, start: 'top 62%', end: 'bottom 62%', onToggle: function (s) { e.classList.toggle('is-active', s.isActive); } }));
      });
    });
  }
  render();

  if (!S.hasGsap || S.reduced) return;
  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.xp-hero', start: 'top top', end: '+=120%', scrub: 1, pin: true, anticipatePin: 1 } });
    tl.fromTo('#xpFrame', { width: '78%', height: '68vh', borderRadius: 30 }, { width: '100%', height: '100vh', borderRadius: 0, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.xp-hero__bg', { filter: 'blur(40px) brightness(.45) saturate(1.3)', scale: 1.2 }, { filter: 'blur(4px) brightness(.32) saturate(1.1)', scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.xf--1', { x: -60, y: 120, opacity: 0, rotate: -8 }, { x: 0, y: -60, opacity: 1, rotate: -4, duration: 1 }, 0)
      .fromTo('.xf--2', { x: 60, y: 160, opacity: 0, rotate: 8 }, { x: 0, y: -90, opacity: 1, rotate: 5, duration: 1 }, .05)
      .fromTo('.xf--3', { x: -40, y: 200, opacity: 0, rotate: 6 }, { x: 0, y: -40, opacity: 1, rotate: 3, duration: 1 }, .1)
      .fromTo('.xf--4', { x: 40, y: 220, opacity: 0, rotate: -6 }, { x: 0, y: -70, opacity: 1, rotate: -3, duration: 1 }, .15)
      .to('.xp-hero__in', { scale: 1.12, ease: 'none', duration: 1 }, 0);
  });
  gsap.fromTo('.xp-log__h', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: '.xp-log__h', start: 'top 85%', end: 'top 40%', scrub: true } });
})();
