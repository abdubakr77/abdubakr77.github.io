/* Project case study page: project.html?p=<id> */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;
  var P = window.PROJECTS || [];
  var id = (new URLSearchParams(location.search).get('p') || '').toLowerCase();
  var idx = Math.max(0, P.findIndex(function (p) { return p.id === id; }));
  var p = P[idx];
  if (!p) return;

  document.title = p.title + ' | Abdullah Bakr';
  var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', p.lead.split('. ')[0] + '.');
  $('#pdKind').textContent = p.kind;
  $('#pdTitle').innerHTML = '<span class="hl"><span class="hl__in shiny" data-h>' + esc(p.title) + '</span></span>';
  $('#pdLead').textContent = p.short;
  $('#pdStatus').textContent = p.id === 'chest' ? 'Public preprint and code' : p.id === 'deepcsv' ? 'Live on PyPI' : 'Public code';
  var img = $('#pdImg'); img.src = p.img; img.alt = p.title;
  if (p.id === 'dental' || p.id === 'skin') $('#pdHero').classList.add('is-contain');

  var tech = p.stack.split(/,\s*/);
  $('#pdMeta').innerHTML = [
    ['Key result', p.metrics[0][0] + ' ' + p.metrics[0][1]], ['Year', p.year], ['Type', p.cat], ['Tech stack', tech.length + ' technologies']
  ].map(function (m, i) {
    var ic = ['<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>', '<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>', '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>'][i];
    return '<div><dt><svg viewBox="0 0 24 24" aria-hidden="true">' + ic + '</svg>' + m[0] + '</dt><dd>' + esc(m[1]) + '</dd></div>';
  }).join('');

  // sections
  var secs = [];
  function sec(key, title, icon, html) { secs.push([key, title]); return '<section class="pd2__sec" id="' + key + '" data-rv><h2><span class="pd2__ic">' + icon + '</span>' + title + '</h2>' + html + '</section>'; }
  var I = {
    brief: '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/></svg>',
    res: '<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    pipe: '<svg viewBox="0 0 24 24"><path d="M4 6h10M4 12h16M4 18h7"/><circle cx="17" cy="6" r="2"/><circle cx="14" cy="18" r="2"/></svg>',
    trust: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    out: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>'
  };
  var h = sec('brief', 'Mission brief', I.brief, '<p class="pd2__p">' + esc(p.lead) + '</p>');
  var met = '<dl class="pd2__metrics">' + p.metrics.map(function (m) { return '<div><dd>' + esc(m[0]) + '</dd><dt>' + esc(m[1]) + '</dt></div>'; }).join('') + '</dl>';
  if (p.chart) {
    met += '<div class="pd2__chart"><p>Mean AUC on the same test split, 14 diseases</p><ul>' + p.chart.map(function (c, i) {
      var w = ((c[1] - .80) / .06 * 100).toFixed(1);
      return '<li' + (i === 0 ? ' class="is-top"' : '') + '><span>' + esc(c[0]) + '</span><span class="pd2__bar"><i style="--w:' + w + '%"></i></span><b>' + c[1].toFixed(4) + '</b></li>';
    }).join('') + '</ul><small>The axis runs from 0.80 to 0.86 so the gaps are readable.</small></div>';
  }
  h += sec('results', 'Results', I.res, met);
  if (p.steps) h += sec('pipeline', 'Pipeline', I.pipe, '<ol class="pd2__steps">' + p.steps.map(function (s, i) { return '<li style="--i:' + i + '"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>');
  h += sec('trust', 'Why the numbers hold', I.trust, '<ul class="pd2__points">' + p.points.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
  var shots = [];
  if (p.extraImg) shots.push(p.extraImg);
  if (p.gallery) shots = shots.concat(p.gallery);
  if (shots.length) h += sec('outputs', 'Model outputs', I.out, '<div class="pd2__shots">' + shots.map(function (s) { return '<figure><img src="' + s[0] + '" alt="' + esc(s[1]) + '" loading="lazy"><figcaption>' + esc(s[1]) + '</figcaption></figure>'; }).join('') + '</div>');
  if (p.code) h += sec('usage', 'Usage', I.code, '<pre class="pd__code"><span class="p">$</span> pip install deepcsv\n\n<span class="k">from</span> deepcsv <span class="k">import</span> read_any, auto_fix, process_all_files\n\ndf = read_any(<span class="s">"orders.parquet"</span>)   <span class="c"># csv, xlsx, json, parquet</span>\ndf = auto_fix(df)                  <span class="c"># fix mixed-type columns</span>\nprocess_all_files(<span class="s">"data/"</span>)         <span class="c"># a whole folder tree</span></pre>');
  $('#pdMain').innerHTML = h;

  $('#pdLinks').innerHTML = p.links.map(function (l, i) {
    var gh = /github\.com/.test(l[1]);
    return '<a class="pd2__btn' + (i === 0 ? ' is-primary' : '') + '" href="' + l[1] + '" target="_blank" rel="noopener">' + (gh ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>') + esc(l[0]) + '</a>';
  }).join('');
  $('#pdTech').innerHTML = tech.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
  $('#pdToc').innerHTML = secs.map(function (s) { return '<li><a href="#' + s[0] + '" data-toc="' + s[0] + '">' + s[1] + '</a></li>'; }).join('');

  var nx = P[(idx + 1) % P.length];
  $('#pdNext').href = 'project.html?p=' + nx.id;
  $('#pdNext').innerHTML = '<span class="pd2__next-l">Next project</span><span class="pd2__next-t">' + esc(nx.title) + ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="pd2__next-img"><img src="' + nx.img + '" alt="" loading="lazy"></span>';

  S.observeReveal($$('#pdMain [data-rv]'));

  // active section in the table of contents
  if ('IntersectionObserver' in window) {
    var links = $$('[data-toc]');
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('is-on', l.dataset.toc === e.target.id); }); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach(function (s) { io.observe(document.getElementById(s[0])); });
  }

  if (!S.hasGsap || S.reduced) return;
  gsap.fromTo('#pdHero', { clipPath: 'inset(6% 8% 6% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: '#pdHero', start: 'top 90%', end: 'center 45%', scrub: true } });
  gsap.fromTo('#pdImg', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#pdHero', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.pd2__bar i').forEach(function (b) { gsap.fromTo(b, { width: 0 }, { width: b.style.getPropertyValue('--w'), duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 90%' } }); });
})();
