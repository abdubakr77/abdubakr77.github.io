/* ============================================================
   Abdullah Bakr — Filterable Projects Grid
   projects-filter.js  (smooth transitions rewrite)
   ============================================================ */

(function initProjectsFilter() {

  const PROJECTS = [
    { id:'cats-dogs',      cat:'cv',       sub:['classification','tensorflow'],                          status:'done' },
    { id:'deepcsv',        cat:'oss',      sub:['pypi','data-tools'],                                    status:'done' },
    { id:'weather',        cat:'ml',       sub:['regression','sklearn'],                                 status:'done' },
    { id:'intel',          cat:'cv',       sub:['transfer-learning','classification','tensorflow'],       status:'done' },
    { id:'garbage',        cat:'cv',       sub:['transfer-learning','classification','pytorch'],          status:'done' },
    { id:'cancer-vgg',     cat:'medical',  sub:['classification','pytorch','imaging'],                   status:'done' },
    { id:'cancer-tl',      cat:'medical',  sub:['transfer-learning','classification','tensorflow','imaging'], status:'done' },
    { id:'nih-xray',       cat:'research', sub:['multi-label','pytorch','imaging'],                      status:'research' },
    // New projects
    { id:'sia',            cat:'cv',       sub:['classification','pytorch','transfer-learning'],          status:'done' },
    { id:'iris',           cat:'ml',       sub:['classification','sklearn'],                             status:'done' },
    { id:'faceage',        cat:'cv',       sub:['classification','pytorch','transfer-learning'],          status:'done' },
    { id:'drowsiness',     cat:'cv',       sub:['classification','pytorch','transfer-learning'],          status:'done' },
    { id:'nlp-sentiment',  cat:'nlp',      sub:[], status:'coming-soon',
      _meta:{ icon:'💬', title:'Sentiment Analysis Engine',
              desc:'Fine-tuning BERT/RoBERTa for multi-class Arabic & English sentiment analysis. Planned deployment as REST API.' }},
    { id:'nlp-ner',        cat:'nlp',      sub:[], status:'coming-soon',
      _meta:{ icon:'🏷️', title:'Named Entity Recognition (NER)',
              desc:'Token-level classification system for extracting entities from unstructured biomedical and news text using transformer models.' }},
    { id:'nlp-summarizer', cat:'nlp',      sub:[], status:'coming-soon',
      _meta:{ icon:'📝', title:'Abstractive Text Summarizer',
              desc:'Seq2Seq model (T5/PEGASUS) for generating concise summaries of long-form Arabic and English documents.' }},
  ];

  const SUB_FILTERS = {
    all:[],
    cv:[
      {key:'classification',    label:'Classification'},
      {key:'transfer-learning', label:'Transfer Learning'},
      {key:'tensorflow',        label:'TensorFlow'},
      {key:'pytorch',           label:'PyTorch'},
    ],
    ml:[
      {key:'regression',        label:'Regression'},
      {key:'classification',    label:'Classification'},
      {key:'sklearn',           label:'Scikit-learn'},
    ],
    oss:[
      {key:'pypi',              label:'PyPI Published'},
      {key:'data-tools',        label:'Data Tools'},
    ],
    medical:[
      {key:'imaging',           label:'Medical Imaging'},
      {key:'classification',    label:'Classification'},
      {key:'transfer-learning', label:'Transfer Learning'},
      {key:'pytorch',           label:'PyTorch'},
      {key:'tensorflow',        label:'TensorFlow'},
    ],
    nlp:[],
    research:[
      {key:'multi-label',       label:'Multi-Label'},
      {key:'pytorch',           label:'PyTorch'},
      {key:'imaging',           label:'Medical Imaging'},
    ],
  };

  const CATS = [
    {key:'all',      icon:'⬡',  label:'All Projects'},
    {key:'cv',       icon:'👁️',  label:'Computer Vision'},
    {key:'ml',       icon:'📊',  label:'ML / Data'},
    {key:'oss',      icon:'📦',  label:'Open Source'},
    {key:'medical',  icon:'🩺',  label:'Medical AI'},
    {key:'nlp',      icon:'💬',  label:'NLP'},
    {key:'research', icon:'🔬',  label:'Research'},
  ];

  const CARDS_PER_PAGE = 6;
  const ANIM_OUT = 200;   // ms cards fade out
  const ANIM_IN  = 320;   // ms cards fade in (stagger base)

  let state = { activeCat:'all', activeSub:null, page:1 };
  let animating = false;

  /* ── DOM ──────────────────────────────────────────── */
  const section      = document.getElementById('projects');
  if (!section) return;
  const grid         = section.querySelector('.proj-grid');
  const tabsWrap     = section.querySelector('.cat-tabs-wrap');
  const subRow       = section.querySelector('.sub-filter-row');
  const pagination   = section.querySelector('.proj-pagination');
  const resultsCount = section.querySelector('.results-count');
  const emptyState   = section.querySelector('.proj-empty');

  /* ── BUILD TABS ───────────────────────────────────── */
  function countForCat(cat) {
    return cat === 'all' ? PROJECTS.length : PROJECTS.filter(p => p.cat === cat).length;
  }

  CATS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (c.key === 'all' ? ' active' : '');
    btn.dataset.cat = c.key;
    btn.innerHTML = `<span class="ct-icon">${c.icon}</span><span class="ct-txt">${c.label}</span><span class="ct-count">${countForCat(c.key)}</span>`;
    btn.addEventListener('click', () => !animating && selectCat(c.key));
    tabsWrap.appendChild(btn);
  });

  /* ── SUB FILTERS ──────────────────────────────────── */
  function renderSubFilters(cat) {
    const filters = SUB_FILTERS[cat] || [];
    subRow.innerHTML = '';
    if (!filters.length) { subRow.classList.add('hidden'); return; }

    subRow.classList.remove('hidden');
    const label = document.createElement('span');
    label.className = 'sub-filter-label';
    label.textContent = 'Filter';
    subRow.appendChild(label);

    const allChip = document.createElement('button');
    allChip.className = 'sub-chip' + (state.activeSub === null ? ' active' : '');
    allChip.dataset.sub = '';
    allChip.textContent = 'All';
    allChip.addEventListener('click', () => !animating && selectSub(null));
    subRow.appendChild(allChip);

    filters.forEach(f => {
      const chip = document.createElement('button');
      chip.className = 'sub-chip' + (state.activeSub === f.key ? ' active' : '');
      chip.dataset.sub = f.key;
      chip.textContent = f.label;
      chip.addEventListener('click', () => !animating && selectSub(f.key));
      subRow.appendChild(chip);
    });
  }

  /* ── FILTER ───────────────────────────────────────── */
  function getFiltered() {
    return PROJECTS.filter(p => {
      const catMatch = state.activeCat === 'all' || p.cat === state.activeCat;
      const subMatch = !state.activeSub  || p.sub.includes(state.activeSub);
      return catMatch && subMatch;
    });
  }

  /* ── CORE RENDER (with smooth swap) ──────────────── */
  function render(isPageChange) {
    const filtered   = getFiltered();
    const total      = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / CARDS_PER_PAGE));
    state.page       = Math.min(state.page, totalPages);

    if (resultsCount) {
      resultsCount.innerHTML = `Showing <em>${total}</em> project${total !== 1 ? 's' : ''}`;
    }

    const allCards  = Array.from(grid.querySelectorAll('.pcard'));
    const filteredIds = filtered.map(p => p.id);
    const start     = (state.page - 1) * CARDS_PER_PAGE;
    const pageIds   = filteredIds.slice(start, start + CARDS_PER_PAGE);

    // Which cards are currently visible vs should be visible
    const currentlyVisible = allCards.filter(c => !c.classList.contains('pf-hidden'));
    const willBeVisible    = allCards.filter(c => pageIds.includes(c.dataset.pid));
    const sameSet = currentlyVisible.length === willBeVisible.length &&
                    willBeVisible.every(c => !c.classList.contains('pf-hidden'));

    if (sameSet && !isPageChange) {
      renderPagination(totalPages);
      return;
    }

    animating = true;

    /* Step 1 — fade out currently visible cards */
    currentlyVisible.forEach(c => {
      c.style.transition = `opacity ${ANIM_OUT}ms ease, transform ${ANIM_OUT}ms ease`;
      c.style.opacity    = '0';
      c.style.transform  = 'translateY(-8px) scale(0.97)';
    });

    /* Step 2 — after out finishes, swap & fade in */
    setTimeout(() => {
      // Hide old, reset styles
      allCards.forEach(c => {
        const show = pageIds.includes(c.dataset.pid);
        c.style.transition = 'none';
        c.style.opacity    = show ? '0' : '';
        c.style.transform  = show ? 'translateY(14px) scale(0.97)' : '';
        c.classList.toggle('pf-hidden', !show);
      });

      // Lock grid height so no jump while staggering in
      grid.style.minHeight = grid.offsetHeight + 'px';

      // Force reflow before enabling transitions
      grid.offsetHeight; // eslint-disable-line

      willBeVisible.forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = `opacity ${ANIM_IN}ms cubic-bezier(0.4,0,0.2,1), transform ${ANIM_IN}ms cubic-bezier(0.4,0,0.2,1)`;
          c.style.opacity    = '1';
          c.style.transform  = 'translateY(0) scale(1)';
        }, i * 55);
      });

      // Release locked height after all cards finish
      const totalInTime = willBeVisible.length * 55 + ANIM_IN + 50;
      setTimeout(() => {
        grid.style.minHeight = '';
        animating = false;
      }, totalInTime);

      // Empty state
      if (emptyState) emptyState.classList.toggle('show', total === 0);

      renderPagination(totalPages);

    }, ANIM_OUT + 20);
  }

  /* ── PAGINATION ───────────────────────────────────── */
  function renderPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = makePPBtn('←', 'pp-arrow');
    prev.disabled = state.page === 1;
    prev.addEventListener('click', () => {
      if (!animating && state.page > 1) { state.page--; render(true); }
    });
    pagination.appendChild(prev);

    getPageNumbers(state.page, totalPages).forEach(p => {
      if (p === '…') {
        pagination.appendChild(makePPBtn('…', 'pp-ellipsis'));
      } else {
        const btn = makePPBtn(p, p === state.page ? 'active' : '');
        btn.addEventListener('click', () => {
          if (!animating && p !== state.page) { state.page = p; render(true); }
        });
        pagination.appendChild(btn);
      }
    });

    const next = makePPBtn('→', 'pp-arrow');
    next.disabled = state.page === totalPages;
    next.addEventListener('click', () => {
      if (!animating && state.page < totalPages) { state.page++; render(true); }
    });
    pagination.appendChild(next);

    const info = document.createElement('span');
    info.className = 'pp-info';
    info.textContent = `${state.page} / ${totalPages}`;
    pagination.appendChild(info);
  }

  function makePPBtn(text, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'pp-btn ' + (extraClass || '');
    btn.textContent = text;
    return btn;
  }

  function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    if (current <= 4)          return [1,2,3,4,5,'…',total];
    if (current >= total - 3)  return [1,'…',total-4,total-3,total-2,total-1,total];
    return [1,'…',current-1,current,current+1,'…',total];
  }

  /* ── STATE CHANGERS ───────────────────────────────── */
  function selectCat(cat) {
    if (cat === state.activeCat) return;
    state.activeCat = cat;
    state.activeSub = null;
    state.page      = 1;
    tabsWrap.querySelectorAll('.cat-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.cat === cat));
    renderSubFilters(cat);
    render(false);
  }

  function selectSub(sub) {
    if (sub === state.activeSub) return;
    state.activeSub = sub;
    state.page      = 1;
    subRow.querySelectorAll('.sub-chip').forEach(c =>
      c.classList.toggle('active', (c.dataset.sub || null) === (sub || null)));
    render(false);
  }

  /* ── COMING SOON CARDS ────────────────────────────── */
  function injectComingSoonCards() {
    PROJECTS.filter(p => p.status === 'coming-soon').forEach(p => {
      const card = document.createElement('div');
      card.className = 'pcard pcard-coming-soon';
      card.dataset.pid = p.id;
      card.innerHTML = `
        <div class="cs-banner">
          <div class="cs-banner-bg"></div>
          <div class="cs-banner-content">
            <div class="cs-icon">${p._meta.icon}</div>
            <div class="cs-badge">Coming Soon</div>
            <div class="cs-dots">
              <div class="cs-dot"></div><div class="cs-dot"></div><div class="cs-dot"></div>
            </div>
          </div>
        </div>
        <div class="pbody">
          <span class="ptag ptag-coming-soon">NLP · In Development</span>
          <h3 class="ptitle">${p._meta.title}</h3>
          <p class="pdesc">${p._meta.desc}</p>
          <div class="pmeta">
            <span class="mb" style="color:#d8b4fe;background:rgba(168,85,247,0.07);border-color:rgba(168,85,247,0.2)">🔮 Planned</span>
            <span class="mb">Python</span><span class="mb">Transformers</span><span class="mb">HuggingFace</span>
          </div>
          <div class="plinks">
            <span class="plink" style="opacity:0.45;cursor:not-allowed;pointer-events:none">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:11px;height:11px"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              Repo — Soon
            </span>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ── INIT ─────────────────────────────────────────── */
  injectComingSoonCards();
  renderSubFilters('all');

  // Set all cards visible initially with no animation, then do first render
  const allCards = Array.from(grid.querySelectorAll('.pcard'));
  allCards.forEach(c => {
    c.style.opacity   = '1';
    c.style.transform = 'none';
  });

  render(false);

})();