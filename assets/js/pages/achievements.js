/* Achievements page */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;
  var C = window.CERTS || [], M = window.MILESTONES || [];
  var withImg = C.filter(function (c) { return c.img && c.id !== 'bh' && c.id !== 'edraak'; });

  /* hero cards: scattered around the title, they gather into a grid on scroll */
  var spots = [[-38, -26, -9], [0, -32, 4], [36, -24, 8], [-34, 26, 7], [2, 30, -5], [38, 24, -8]];
  $('#acCards').innerHTML = withImg.slice(0, 6).map(function (c, i) {
    var s = spots[i];
    return '<figure class="acc" style="--x:' + s[0] + 'vw;--y:' + s[1] + 'vh;--r:' + s[2] + 'deg;--i:' + i + '"><span class="acc__in"><img src="' + c.img + '" alt="" loading="eager"></span></figure>';
  }).join('');

  /* milestones */
  $('#acMs').innerHTML = M.map(function (m, i) {
    var tag = m.href ? 'a' : 'div';
    return '<' + tag + ' class="ms" data-rv style="--d:' + (i * .07) + 's"' + (m.href ? ' href="' + m.href + '" target="_blank" rel="noopener"' : '') + '><span class="ms__n">' + esc(m.n) + '</span><span class="ms__l">' + esc(m.l) + '</span><span class="ms__s">' + esc(m.s) + '</span>' + (m.href ? '<span class="ms__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span>' : '') + '</' + tag + '>';
  }).join('');
  S.observeReveal($$('#acMs [data-rv]'));

  /* archive */
  var ENTRIES = C.map(function (c) { return { k: c.type === 'Certification' ? 'cert' : 'course', t: c.t, o: c.o, d: c.d, img: c.img, v: c.v, type: c.type, tags: c.tags }; })
    .concat(M.map(function (m) { return { k: 'ms', t: m.n + ' ' + m.l, o: m.s, d: '2026', href: m.href, type: 'Milestone', tags: [] }; }));
  var CATS = [['all', 'All entries'], ['cert', 'Certifications'], ['course', 'Courses & programs'], ['ms', 'Milestones']];
  var cat = 'all', q = '', view = 'grid';
  $('#acCats').innerHTML = CATS.map(function (c) {
    var n = c[0] === 'all' ? ENTRIES.length : ENTRIES.filter(function (e) { return e.k === c[0]; }).length;
    return '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === 'all') + '"><span>' + c[1] + '</span><small>' + n + '</small></button>';
  }).join('');
  var grid = $('#acGrid');
  function render() {
    var items = ENTRIES.filter(function (e) { return (cat === 'all' || e.k === cat) && (!q || (e.t + ' ' + e.o + ' ' + e.tags.join(' ')).toLowerCase().indexOf(q) >= 0); });
    $('#acEmpty').hidden = items.length > 0;
    grid.className = 'ac-grid ac-grid--' + view;
    grid.innerHTML = items.map(function (e, i) {
      var cover = e.img ? '<img src="' + e.img + '" alt="" loading="lazy">' : '<span class="acg__ph"><svg viewBox="0 0 24 24" aria-hidden="true">' + (e.k === 'ms' ? '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>' : '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>') + '</svg></span>';
      var act = e.img ? '<button type="button" class="acg__act" data-cert="' + e.img + '" data-title="' + esc(e.t + ', ' + e.o) + '"' + (e.v ? ' data-verify="' + e.v + '"' : '') + '>Expand <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>'
        : e.href ? '<a class="acg__act" href="' + e.href + '" target="_blank" rel="noopener">Open <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg></a>' : '<span class="acg__act is-off">No public file</span>';
      return '<article class="acg" style="--d:' + (i * .04) + 's"><div class="acg__cover">' + cover + '<span class="acg__type">' + esc(e.type) + '</span><span class="acg__date">' + esc(e.d) + '</span></div>' +
        '<div class="acg__body"><h3>' + esc(e.t) + '</h3><p>' + esc(e.o) + '</p>' + (e.v ? '<a class="acg__verify" href="' + e.v + '" target="_blank" rel="noopener">Verify</a>' : '') + act + '</div></article>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () { grid.classList.add('is-in'); }); });
    $('#arc2-h').textContent = CATS.filter(function (c) { return c[0] === cat; })[0][1];
    if (S.hasGsap) ScrollTrigger.refresh();
  }
  $('#acCats').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat;
    $$('#acCats button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    render();
  });
  var t = 0;
  $('#acSearch').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { q = e.target.value.trim().toLowerCase(); render(); }, 120); });
  $$('.viewtg [data-view]').forEach(function (b) { b.addEventListener('click', function () { view = b.dataset.view; $$('.viewtg [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
  render();

  if (!S.hasGsap || S.reduced) { document.documentElement.classList.add('ac-static'); return; }
  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    var cards = $$('.acc');
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.ac-hero__pin', start: 'top top', end: '+=150%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to('.ac-hero__in', { opacity: 0, scale: .9, duration: .35 }, 0);
    cards.forEach(function (c, i) {
      var s = spots[i], col = i % 3, row = Math.floor(i / 3);
      tl.fromTo(c, {
        x: function () { return s[0] / 100 * innerWidth; }, y: function () { return s[1] / 100 * innerHeight; }, rotate: s[2], scale: 1, filter: 'brightness(.5)'
      }, {
        x: function () { return (col - 1) * Math.min(innerWidth * .25, 360); }, y: function () { return (row - .5) * Math.min(innerHeight * .34, 280); },
        rotate: 0, scale: 1.12, filter: 'brightness(1)', duration: 1, ease: 'power2.inOut', immediateRender: true
      }, .05 + i * .03);
    });
    return function () { cards.forEach(function (c) { gsap.set(c, { clearProps: 'all' }); }); };
  });
  mm.add('(max-width: 860px)', function () { document.documentElement.classList.add('ac-static'); return function () { document.documentElement.classList.remove('ac-static'); }; });
})();
