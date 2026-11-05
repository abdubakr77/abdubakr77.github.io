/* Gallery page: wave hero, filterable outputs, lightbox with zoom */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;

  /* ---------- wave terrain ---------- */
  var cv = $('#glWave'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), t0 = performance.now(), run = true;
  function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
  size(); window.addEventListener('resize', size);
  var mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  function draw(now) {
    var t = (now - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var R = 46, N = 90;
    for (var r = 0; r < R; r++) {
      var d = r / (R - 1), p = .35 + d * 1.25, base = H * (.42 + d * .62);
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var x = i / N * 2 - 1;
        var valley = Math.pow(Math.abs(x), 1.6) * 1.1;
        var n = Math.sin(x * 7 + t * .6 + r * .35) * Math.cos(x * 3.1 - t * .45 + r * .22) * .28 + Math.sin(x * 15 + r * .9 - t * .8) * .06;
        var y = base - (valley + n * (.4 + valley)) * H * .2 * p - my * 30 * d;
        var X = W / 2 + x * W * .62 * p + mx * 40 * d;
        if (i) ctx.lineTo(X, y); else ctx.moveTo(X, y);
      }
      ctx.strokeStyle = 'rgba(205,205,215,' + (.07 + d * .3).toFixed(3) + ')';
      ctx.lineWidth = .6 + d * .7;
      ctx.stroke();
    }
    if (run) requestAnimationFrame(draw);
  }
  if (S.reduced) { run = false; draw(t0 + 2000); } else requestAnimationFrame(draw);
  if ('IntersectionObserver' in window && !S.reduced) new IntersectionObserver(function (e) { var vis = e[0].isIntersecting; if (vis && !run) { run = true; requestAnimationFrame(draw); } else if (!vis) run = false; }).observe(cv);

  /* ---------- items ---------- */
  var G = [
    { img: 'assets/img/dental-hires.webp', sm: 'assets/img/dental-1600.webp', k: 'detection', t: 'Four quadrants, all at 0.99', d: 'Stage one of my dental pipeline: a YOLO detector finds the four quadrants of a panoramic X-ray before teeth are numbered.', m: 'YOLO, DENTEX 2023', w: 2950, h: 1316 },
    { img: 'assets/img/cxr-cam-effusion.webp', k: 'attention', t: 'Effusion, Grad-CAM++', d: 'Where my Swin V2-B chest X-ray model looks when it predicts effusion on a test image.', m: 'Swin V2-B, NIH ChestX-ray14', w: 1000, h: 1000 },
    { img: 'assets/img/skin-segmentation.webp', k: 'segmentation', t: 'Lesion outline, then a label', d: 'Stage one masks the lesion; the boundary is kept for the classifier in stage two.', m: 'Ultralytics segmentation + Swin V2-S', w: 1172, h: 878 },
    { img: 'assets/img/dental-out-344.webp', sm: 'assets/img/dental-out-344-sm.webp', k: 'detection', t: 'A lower confidence, shown as is', d: 'The upper right quadrant comes out at 0.66 here. I keep cases like this visible instead of hiding them.', m: 'YOLO, DENTEX 2023', w: 2957, h: 1316 },
    { img: 'assets/img/cxr-cam-atelectasis.webp', k: 'attention', t: 'Atelectasis, Grad-CAM++', d: 'Attention map for atelectasis from the same chest X-ray model.', m: 'Swin V2-B, NIH ChestX-ray14', w: 1000, h: 1000 },
    { img: 'assets/img/drone-val.webp', k: 'detection', t: 'Drones on validation images', d: 'Predicted boxes on a validation batch from my drone detector.', m: 'YOLO26m', w: 1920, h: 557 },
    { img: 'assets/img/dental-out-80.webp', sm: 'assets/img/dental-out-80-sm.webp', k: 'detection', t: 'Quadrants with fillings in view', d: 'Bright restorations do not throw off the quadrant boxes on this panoramic.', m: 'YOLO, DENTEX 2023', w: 2883, h: 1316 },
    { img: 'assets/img/cxr-cam-consolidation.webp', k: 'attention', t: 'Consolidation, Grad-CAM++', d: 'Attention map for consolidation from the chest X-ray model.', m: 'Swin V2-B, NIH ChestX-ray14', w: 1000, h: 1000 },
    { img: 'assets/img/proj-chest.webp', k: 'attention', t: 'Raw X-ray next to its heat map', d: 'Left the test image, right the Grad-CAM++ overlay for the predicted finding.', m: 'Swin V2-B', w: 1600, h: 800 },
    { img: 'assets/img/thumbs/resnet-test-set-predictions.webp', k: 'classification', t: 'Awake or sleepy, test set', d: 'Predictions on held-out infrared eye images from my drowsiness classifier.', m: 'ResNet50', w: 900, h: 785 },
    { img: 'assets/img/proj-drone.webp', k: 'detection', t: 'A drone in the wild', d: 'A single detection in an outdoor scene with trees and buildings behind it.', m: 'YOLO26m', w: 476, h: 356 },
    { img: 'assets/img/dental-out-284.webp', sm: 'assets/img/dental-out-284-sm.webp', k: 'detection', t: 'Another panoramic, same pipeline', d: 'Quadrant detection on a different patient, with a different jaw shape.', m: 'YOLO, DENTEX 2023', w: 2955, h: 1316 }
  ];
  var CATS = [['all', 'All'], ['attention', 'Attention maps'], ['detection', 'Detection'], ['segmentation', 'Segmentation'], ['classification', 'Classification']];
  var LBL = { attention: 'Attention map', detection: 'Detection', segmentation: 'Segmentation', classification: 'Classification' };
  var cat = 'all', view = 'grid', shown = [];
  $('#glCats').innerHTML = CATS.map(function (c) { return '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === 'all') + '">' + c[1] + '</button>'; }).join('');
  var grid = $('#glGrid');
  function render() {
    shown = G.filter(function (g) { return cat === 'all' || g.k === cat; });
    grid.className = 'gl-grid gl-grid--' + view;
    grid.innerHTML = shown.map(function (g, i) {
      return '<button type="button" class="gw" data-i="' + i + '" style="--d:' + (i * .05) + 's;--ar:' + (g.w / g.h).toFixed(3) + '"><span class="gw__img"><img src="' + (g.sm || g.img) + '" alt="' + esc(g.t) + '" loading="lazy"></span>' +
        '<span class="gw__cap"><span class="gw__k">' + LBL[g.k] + '</span><b>' + esc(g.t) + '</b><small>' + esc(g.m) + '</small></span><span class="gw__plus" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></button>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () { grid.classList.add('is-in'); }); });
    if (S.hasGsap) ScrollTrigger.refresh();
  }
  $('#glCats').addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('#glCats button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); });
  $$('.viewtg [data-view]').forEach(function (b) { b.addEventListener('click', function () { view = b.dataset.view; $$('.viewtg [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
  render();

  /* ---------- lightbox ---------- */
  var lb = $('#lb'), img = $('#lbImg'), stage = $('#lbStage'), cur = 0, zoomed = false, last = null;
  function show(i) {
    cur = (i + shown.length) % shown.length;
    var g = shown[cur];
    lb.classList.add('is-swap');
    setTimeout(function () {
      img.src = g.img; img.alt = g.t;
      $('#lbK').textContent = LBL[g.k] + ' · ' + g.m; $('#lbT').textContent = g.t; $('#lbD').textContent = g.d;
      $('#lbN').textContent = (cur + 1) + ' / ' + shown.length;
      setZoom(false);
      img.onload = function () { lb.classList.remove('is-swap'); };
      if (img.complete) lb.classList.remove('is-swap');
    }, 160);
  }
  function open(i) {
    last = document.activeElement;
    lb.hidden = false; requestAnimationFrame(function () { lb.classList.add('is-open'); });
    if (S.lenis) S.lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    show(i); $('#lbClose').focus();
  }
  function close() {
    lb.classList.remove('is-open');
    setTimeout(function () { lb.hidden = true; }, 350);
    if (S.lenis) S.lenis.start();
    document.documentElement.style.overflow = '';
    if (last) last.focus();
  }
  function setZoom(z, e) {
    zoomed = z; lb.classList.toggle('is-zoom', z);
    if (!z) { img.style.transform = ''; return; }
    pan(e);
  }
  function pan(e) {
    if (!zoomed) return;
    var r = stage.getBoundingClientRect();
    var x = e ? (e.clientX - r.left) / r.width : .5, y = e ? (e.clientY - r.top) / r.height : .5;
    img.style.transform = 'translate(' + ((.5 - x) * 100).toFixed(1) + '%,' + ((.5 - y) * 100).toFixed(1) + '%) scale(2.2)';
  }
  grid.addEventListener('click', function (e) { var b = e.target.closest('.gw'); if (b) open(+b.dataset.i); });
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', function () { show(cur - 1); });
  $('#lbNext').addEventListener('click', function () { show(cur + 1); });
  $('#lbZoom').addEventListener('click', function () { setZoom(!zoomed); });
  stage.addEventListener('click', function (e) { if (e.target === img) setZoom(!zoomed, e); else if (!zoomed) close(); });
  stage.addEventListener('pointermove', pan);
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  (function () { var x0 = null; stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true }); stage.addEventListener('touchend', function (e) { if (x0 === null || zoomed) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); x0 = null; }); })();

  if (!S.hasGsap || S.reduced) return;
  gsap.to('.gl-hero__in', { y: -100, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.gl-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.gl-wave', { scale: 1 }, { scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.gl-hero', start: 'top top', end: 'bottom top', scrub: true } });
})();
