/* Skills page */
(function () {
  'use strict';
  var S = window.SITE, $ = S.$, $$ = S.$$, esc = S.esc;
  var IC = window.ICONS || {};

  /* hero cube with tool logos */
  var faces = [['PyTorch', 'f1'], ['OpenCV', 'f2'], ['TensorFlow', 'f3'], ['Python', 'f4'], ['Keras', 'f5'], ['scikit-learn', 'f6']];
  $('#skCube').innerHTML = faces.map(function (f) {
    var i = IC[f[0]];
    return '<div class="cube__f ' + f[1] + ' sk-face" style="--c:' + (i ? i[0] : '#fff') + '">' + (i ? '<svg viewBox="0 0 24 24"><path d="' + i[1] + '"/></svg>' : '') + '<b>' + esc(f[0].toUpperCase()) + '</b></div>';
  }).join('');
  var orbit = ['PyTorch', 'TensorFlow', 'OpenCV', 'Python', 'Keras', 'scikit-learn', 'pandas', 'NumPy', 'Streamlit', 'Jupyter', 'Git', 'Kaggle', 'Hugging Face', 'Google Colab'];
  var SLOTS = [[17, 17, 0], [83, 17, 0], [9, 36, 1], [91, 36, 1], [29, 28, 2], [71, 28, 2], [20, 52, 0], [80, 52, 0],
    [37, 13, 1], [63, 13, 1], [8, 62, 2], [92, 62, 2], [32, 60, 1], [68, 60, 1]];
  $('#skOrbit').innerHTML = orbit.map(function (k, n) {
    var i = IC[k]; if (!i) return '';
    // fixed slots around the cube: clear of the nav bar, the screen edges and the title below
    var at = SLOTS[n % SLOTS.length];
    var col = { NumPy: '#4dabcf', pandas: '#e70488', GitHub: '#e5e5e5' }[k] || i[0];
    return '<span class="sk-ico" style="left:' + at[0] + '%;top:' + at[1] + '%;--c:' + col + ';--d:' + (n * -0.7) + 's;--z:' + at[2] + '" title="' + esc(k) + '"><svg viewBox="0 0 24 24"><path d="' + i[1] + '"/></svg></span>';
  }).join('');

  /* skills with evidence */
  var SK = {
    cv: [
      ['Image classification', 'Single and multi-label, from X-rays to everyday scenes.', ['Chest X-ray Classifier', 'Synthetic Image Attribution', 'Breast Cancer Ultrasound (x2)', 'Drowsiness Detection', 'Garbage Classification', 'Intel Scenes', 'Face Age-Group', 'Cats vs Dogs'], 9],
      ['Medical imaging', 'Chest and dental X-rays, ultrasound and skin images.', ['Chest X-ray Classifier', 'Dental X-ray AI', 'Skin Lesion Pipeline', 'Breast Cancer Ultrasound (x2)'], 5],
      ['Object detection', 'YOLO detectors that find regions for the next stage.', ['Dental X-ray AI', 'Drone Detection'], 2],
      ['Segmentation', 'Lesion outlines turned into validated polygons.', ['Skin Lesion Pipeline'], 1],
      ['Augmentation', 'Albumentations and custom hair-overlay augmentation.', ['Skin Lesion Pipeline', 'Drone Detection', 'Cats vs Dogs'], 3],
      ['Explainability', 'Grad-CAM++ to check where a model looks.', ['Chest X-ray Classifier'], 1]
    ],
    dl: [
      ['CNN backbones', 'ResNet, EfficientNet, DenseNet, Inception and VGG.', ['Chest X-ray Classifier', 'Drone Detection', 'Synthetic Image Attribution', 'Breast Cancer Ultrasound (x2)', 'Drowsiness Detection', 'Garbage Classification', 'Intel Scenes', 'Face Age-Group'], 9],
      ['PyTorch', 'My default for research and pipelines.', ['Chest X-ray Classifier', 'Dental X-ray AI', 'Skin Lesion Pipeline', 'Synthetic Image Attribution', 'Breast Cancer VGG19-BN', 'Garbage Classification'], 6],
      ['TensorFlow and Keras', 'Transfer learning and quick baselines.', ['Drone Detection', 'Breast Cancer Transfer Learning', 'Cats vs Dogs', 'IBM Stock Forecasting'], 4],
      ['Vision transformers', 'Swin V2 and ViT, benchmarked against CNNs.', ['Chest X-ray Classifier', 'Dental X-ray AI', 'Skin Lesion Pipeline'], 3],
      ['Mixed precision', 'Faster training on large image sets.', ['Chest X-ray Classifier', 'Synthetic Image Attribution', 'Drowsiness Detection'], 3],
      ['Recurrent models', 'RNN, LSTM and GRU compared on a price series.', ['IBM Stock Forecasting'], 1]
    ],
    data: [
      ['pandas and NumPy', 'Cleaning, feature engineering and EDA.', ['deepcsv', 'Stellar Classification', 'Weather Prediction', 'Iris Comparison', 'IBM Stock Forecasting'], 5],
      ['scikit-learn and boosting', 'Classical models, stacking and tuning.', ['deepcsv', 'Stellar Classification', 'Weather Prediction', 'Iris Comparison'], 4],
      ['OpenCV', 'Image I/O, drawing and preprocessing.', ['Dental X-ray AI', 'Skin Lesion Pipeline'], 2],
      ['Python packaging', 'Versioned releases on PyPI.', ['deepcsv'], 1],
      ['Streamlit', 'Turning a pipeline into an app people can use.', ['Dental X-ray AI'], 1],
      ['Kaggle notebooks', 'Runnable end to end, written for other people.', ['Kaggle Notebooks Expert profile'], 1]
    ]
  };
  var grid = $('#skGrid'), ink = $('#skInk');
  function render(k) {
    var list = SK[k], max = Math.max.apply(null, list.map(function (s) { return s[3]; }));
    grid.classList.remove('is-in');
    grid.innerHTML = list.map(function (s, i) {
      return '<article class="skc" style="--d:' + (i * .06) + 's"><header><h3>' + esc(s[0]) + '</h3><span class="badge">' + s[3] + (s[3] === 1 ? ' project' : ' projects') + '</span></header>' +
        '<span class="skc__bar"><i style="--w:' + (s[3] / max * 100).toFixed(0) + '%"></i></span>' +
        '<p>' + esc(s[1]) + '</p><p class="skc__used"><b>Used in</b> ' + s[2].map(esc).join(' &middot; ') + '</p></article>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () { grid.classList.add('is-in'); }); });
  }
  function moveInk(b) { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
  $$('#skTabs [data-k]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#skTabs [data-k]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      moveInk(b); render(b.dataset.k);
    });
  });
  render('cv');
  window.addEventListener('load', function () { moveInk($('#skTabs [aria-selected="true"]')); });
  window.addEventListener('resize', function () { moveInk($('#skTabs [aria-selected="true"]')); });
  setTimeout(function () { moveInk($('#skTabs [aria-selected="true"]')); }, 400);

  /* working habits */
  var HOW = [
    ['Leakage-free evaluation', 'Patient-level and lesion-level splits, so a test score is not inflated by near duplicates.', 'assets/img/cxr-overlay.webp', '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'],
    ['Outputs a person can check', 'Grad-CAM++ maps and every class probability, so close calls stay visible.', 'assets/img/proj-chest.webp', '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
    ['Fair benchmarks', 'Six architectures under one protocol before I pick a winner.', 'assets/img/sia-cover.webp', '<path d="M5 20V10M12 20V4M19 20v-7"/>'],
    ['Staged pipelines', 'Each model hands off to the next, and a tooth stops early when the next stage is not needed.', 'assets/img/dental-1600.webp', '<path d="M4 6h10M4 12h16M4 18h7"/><circle cx="17" cy="6" r="2"/><circle cx="14" cy="18" r="2"/>'],
    ['Reproducible data', 'Deterministic dataset pipelines and fixed public and private splits.', 'assets/img/proj-deepcsv.webp', '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'],
    ['Rare classes on purpose', 'Focal Loss, per-class thresholds and class-aware augmentation.', 'assets/img/skin-segmentation.webp', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'],
    ['Shipping it', 'From notebook to a Streamlit app, a PyPI package or a preprint.', 'assets/img/proj-drone.webp', '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'],
    ['Writing it up', 'Notebooks people can run end to end, and posts for 14K+ followers.', 'assets/img/thumbs/resnet-test-set-predictions.webp', '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>']
  ];
  $('#skHow').innerHTML = HOW.map(function (h, i) {
    return '<article class="skh"><span class="skh__img"><img src="' + h[2] + '" alt="" loading="lazy"></span><span class="skh__ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + h[3] + '</svg></span><span class="skh__n">#' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(h[0]) + '</h3><p>' + esc(h[1]) + '</p></article>';
  }).join('');

  /* toolbox marquee (reuses the home logo list) */
  if (window.LOGOS) {
    var one = function (list) { var o = list.map(function (l) { return '<span class="logo"><svg viewBox="0 0 24 24" aria-hidden="true" style="color:' + l[1] + '"><path d="' + l[2] + '"/></svg>' + l[0] + '</span>'; }).join(''); return o + o; };
    $('#logosA').innerHTML = one(window.LOGOS.a); $('#logosB').innerHTML = one(window.LOGOS.b);
  }

  /* pointer: cube leans to the cursor, icons drift */
  if (S.finePointer && !S.reduced) {
    var tilt = $('#skTilt'), orb = $('#skOrbit');
    $('.sk-hero').addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      tilt.style.setProperty('--tx', (x * 50).toFixed(1) + 'deg'); tilt.style.setProperty('--ty', (-y * 36).toFixed(1) + 'deg');
      orb.style.transform = 'translate(' + (x * -30).toFixed(1) + 'px,' + (y * -24).toFixed(1) + 'px)';
    });
  }

  if (!S.hasGsap || S.reduced) return;
  gsap.fromTo('#skCube', { rotateX: -20, rotateY: 30 }, { rotateX: 340, rotateY: 390, ease: 'none', scrollTrigger: { trigger: '.sk-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.sk-cube-wrap', { scale: .6, y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.sk-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.sk-hero__in', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.sk-hero', start: '20% top', end: 'bottom top', scrub: true } });
  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    var tr = $('#skHow');
    var dist = function () { return tr.scrollWidth - innerWidth + Math.max(40, (innerWidth - 1180) / 2); };
    gsap.to(tr, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '.sk-how__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: .8, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
  });
})();
