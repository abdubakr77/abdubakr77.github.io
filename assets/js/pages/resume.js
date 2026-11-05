/* Resume viewer: renders the CV with pdf.js, with thumbnails, zoom, rotate and search */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$;
  var lib = window.pdfjsLib;
  var pagesEl = $('#rvPages'), sideEl = $('#rvSide'), pager = $('#rvPager'), loading = $('#rvLoading');
  var zoomSel = $('#rvZoom'), panel = $('#rvPanel');
  var URL_PDF = 'Abdullah_Bakr_CV.pdf';
  var doc = null, rotation = 0, zoom = 1, pageViews = [], current = 1, textCache = {};
  var STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (window.innerWidth < 860) { panel.classList.add('is-collapsed'); $('#rvToggle').setAttribute('aria-pressed', 'false'); zoomSel.value = 'fit'; }

  if (!lib) { fail(); return; }
  lib.GlobalWorkerOptions.workerSrc = 'assets/js/vendor/pdf.worker.min.js';

  function fail() {
    loading.innerHTML = '<p>The viewer could not load here. <a href="' + URL_PDF + '" target="_blank" rel="noopener">Open the PDF</a> instead.</p>';
  }

  function fitScale(page) {
    var vp = page.getViewport({ scale: 1, rotation: rotation });
    var avail = pagesEl.clientWidth - (window.innerWidth < 600 ? 24 : 64);
    return Math.max(.3, avail / vp.width);
  }
  function scaleFor(page) { return zoomSel.value === 'fit' ? fitScale(page) : zoom; }

  function renderPage(n) {
    var pv = pageViews[n - 1];
    return doc.getPage(n).then(function (page) {
      var scale = scaleFor(page), dpr = Math.min(2.5, window.devicePixelRatio || 1);
      var vp = page.getViewport({ scale: scale, rotation: rotation });
      var canvas = pv.canvas, ctx = canvas.getContext('2d');
      canvas.width = Math.floor(vp.width * dpr); canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = Math.floor(vp.width) + 'px'; canvas.style.height = Math.floor(vp.height) + 'px';
      pv.wrap.style.width = Math.floor(vp.width) + 'px'; pv.wrap.style.height = Math.floor(vp.height) + 'px';
      if (pv.task) { try { pv.task.cancel(); } catch (e) { /* ignore */ } }
      pv.task = page.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      return pv.task.promise.then(function () {
        return page.getTextContent().then(function (tc) {
          textCache[n] = tc;
          pv.text.innerHTML = '';
          pv.text.style.setProperty('--scale-factor', vp.scale);
          var task = lib.renderTextLayer({ textContentSource: tc, container: pv.text, viewport: vp, textDivs: [] });
          return (task.promise || Promise.resolve()).then(function () { highlight(); });
        });
      }).catch(function () { /* cancelled */ });
    });
  }
  function renderAll() { var p = Promise.resolve(); for (var i = 1; i <= doc.numPages; i++) (function (n) { p = p.then(function () { return renderPage(n); }); })(i); return p; }

  function buildThumbs() {
    sideEl.innerHTML = '';
    for (var i = 1; i <= doc.numPages; i++) (function (n) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rv__thumb' + (n === 1 ? ' is-on' : '');
      b.setAttribute('aria-label', 'Go to page ' + n);
      var c = document.createElement('canvas');
      b.appendChild(c); b.insertAdjacentHTML('beforeend', '<span>Page ' + n + '</span>');
      sideEl.appendChild(b);
      b.addEventListener('click', function () { goTo(n); });
      doc.getPage(n).then(function (page) {
        var vp = page.getViewport({ scale: 1 }); var s = 220 / vp.width;
        var v2 = page.getViewport({ scale: s }); c.width = v2.width; c.height = v2.height;
        page.render({ canvasContext: c.getContext('2d'), viewport: v2 });
      });
    })(i);
  }
  function setCurrent(n) {
    if (n === current) return; current = n;
    pager.textContent = 'Page ' + n + ' of ' + doc.numPages;
    $$('.rv__thumb', sideEl).forEach(function (t, i) { t.classList.toggle('is-on', i + 1 === n); });
  }
  function goTo(n) {
    var pv = pageViews[n - 1]; if (!pv) return;
    pagesEl.scrollTo({ top: pv.wrap.offsetTop - 24, behavior: S.reduced ? 'auto' : 'smooth' });
  }
  pagesEl.addEventListener('scroll', function () {
    var mid = pagesEl.scrollTop + pagesEl.clientHeight * .4, n = 1;
    pageViews.forEach(function (pv, i) { if (pv.wrap.offsetTop <= mid) n = i + 1; });
    setCurrent(n);
  }, { passive: true });

  /* zoom + rotate */
  function setZoom(v) {
    if (v === 'fit') zoomSel.value = 'fit';
    else {
      zoom = Math.max(.5, Math.min(2, v));
      var opt = STEPS.indexOf(zoom) >= 0 ? String(zoom) : null;
      if (!opt) { var o = document.createElement('option'); o.value = String(zoom); o.textContent = Math.round(zoom * 100) + '%'; zoomSel.appendChild(o); }
      zoomSel.value = String(zoom);
    }
    renderAll();
  }
  function curZoom() { return zoomSel.value === 'fit' ? (pageViews[0] ? pageViews[0].canvas.clientWidth / 612 : 1) : zoom; }
  $('#rvIn').addEventListener('click', function () { var z = curZoom(); var nx = STEPS.filter(function (s) { return s > z + .01; })[0]; setZoom(nx || 2); });
  $('#rvOut').addEventListener('click', function () { var z = curZoom(); var pv = STEPS.filter(function (s) { return s < z - .01; }); setZoom(pv.length ? pv[pv.length - 1] : .5); });
  zoomSel.addEventListener('change', function () { if (zoomSel.value === 'fit') setZoom('fit'); else setZoom(parseFloat(zoomSel.value)); });
  $('#rvRotL').addEventListener('click', function () { rotation = (rotation + 270) % 360; renderAll(); });
  $('#rvRotR').addEventListener('click', function () { rotation = (rotation + 90) % 360; renderAll(); });
  $('#rvToggle').addEventListener('click', function () {
    var col = panel.classList.toggle('is-collapsed');
    this.setAttribute('aria-pressed', String(!col));
    if (zoomSel.value === 'fit') setTimeout(renderAll, 420);
  });
  var rT = 0;
  window.addEventListener('resize', function () { if (!doc || zoomSel.value !== 'fit') return; clearTimeout(rT); rT = setTimeout(renderAll, 200); });

  /* search */
  var box = $('#rvSearchBox'), q = $('#rvQuery'), hits = $('#rvHits'), matchIdx = -1;
  $('#rvFind').addEventListener('click', function () {
    var open = box.hidden; box.hidden = !open; this.setAttribute('aria-pressed', String(open));
    if (open) q.focus(); else { q.value = ''; highlight(); }
  });
  function highlight() {
    var term = q.value.trim().toLowerCase();
    var marks = [];
    pageViews.forEach(function (pv) {
      $$('span', pv.text).forEach(function (s) {
        var on = term.length > 1 && s.textContent.toLowerCase().indexOf(term) >= 0;
        s.classList.toggle('rv-hit', on); s.classList.remove('rv-hit--cur');
        if (on) marks.push(s);
      });
    });
    hits.textContent = term.length > 1 ? (marks.length ? marks.length + ' found' : 'No match') : '';
    return marks;
  }
  q.addEventListener('input', function () { matchIdx = -1; highlight(); });
  function nextHit() {
    var marks = highlight(); if (!marks.length) return;
    matchIdx = (matchIdx + 1) % marks.length;
    var m = marks[matchIdx]; m.classList.add('rv-hit--cur');
    hits.textContent = (matchIdx + 1) + ' of ' + marks.length;
    var wrap = m.closest('.rv__page');
    pagesEl.scrollTo({ top: wrap.offsetTop + m.offsetTop * 1 - pagesEl.clientHeight / 3, behavior: 'smooth' });
  }
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); nextHit(); } if (e.key === 'Escape') $('#rvFind').click(); });
  $('#rvNext').addEventListener('click', nextHit);

  /* load */
  lib.getDocument(URL_PDF).promise.then(function (d) {
    doc = d;
    loading.remove();
    pager.textContent = 'Page 1 of ' + d.numPages;
    for (var i = 1; i <= d.numPages; i++) {
      var wrap = document.createElement('div'); wrap.className = 'rv__page'; wrap.style.setProperty('--d', (i * .12) + 's');
      var canvas = document.createElement('canvas');
      var text = document.createElement('div'); text.className = 'textLayer';
      wrap.appendChild(canvas); wrap.appendChild(text); pagesEl.appendChild(wrap);
      pageViews.push({ wrap: wrap, canvas: canvas, text: text });
    }
    buildThumbs();
    if (zoomSel.value !== 'fit') {
      // start at 100%, but never wider than the area on smaller screens
      d.getPage(1).then(function (p) { if (fitScale(p) < 1) zoomSel.value = 'fit'; renderAll().then(function () { panel.classList.add('is-loaded'); }); });
    } else renderAll().then(function () { panel.classList.add('is-loaded'); });
  }).catch(fail);
})();
