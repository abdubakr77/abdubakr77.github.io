/* ============================================================
   Abdullah Bakr — Filterable Projects Grid
   projects-filter.js
   ============================================================ */

(function initProjectsFilter() {

  /* ── DATA ─────────────────────────────────────────────
     Each project gets: id, cat (main), sub (sub-filters),
     framework, status
  ─────────────────────────────────────────────────────── */
  const PROJECTS = [
    {
      id: 'cats-dogs',
      cat: 'cv',
      sub: ['classification', 'tensorflow'],
      status: 'done',
    },
    {
      id: 'deepcsv',
      cat: 'oss',
      sub: ['pypi', 'data-tools'],
      status: 'done',
    },
    {
      id: 'weather',
      cat: 'ml',
      sub: ['regression', 'sklearn'],
      status: 'done',
    },
    {
      id: 'intel',
      cat: 'cv',
      sub: ['transfer-learning', 'classification', 'tensorflow'],
      status: 'done',
    },
    {
      id: 'garbage',
      cat: 'cv',
      sub: ['transfer-learning', 'classification', 'pytorch'],
      status: 'done',
    },
    {
      id: 'cancer-vgg',
      cat: 'medical',
      sub: ['classification', 'pytorch', 'imaging'],
      status: 'done',
    },
    {
      id: 'cancer-tl',
      cat: 'medical',
      sub: ['transfer-learning', 'classification', 'tensorflow', 'imaging'],
      status: 'done',
    },
    {
      id: 'nih-xray',
      cat: 'research',
      sub: ['multi-label', 'pytorch', 'imaging'],
      status: 'research',
    },
    // NLP Coming Soon
    {
      id: 'nlp-sentiment',
      cat: 'nlp',
      sub: [],
      status: 'coming-soon',
      _meta: { icon: '💬', title: 'Sentiment Analysis Engine', desc: 'Fine-tuning BERT/RoBERTa for multi-class Arabic & English sentiment analysis. Planned deployment as REST API.' }
    },
    {
      id: 'nlp-ner',
      cat: 'nlp',
      sub: [],
      status: 'coming-soon',
      _meta: { icon: '🏷️', title: 'Named Entity Recognition (NER)', desc: 'Token-level classification system for extracting entities from unstructured biomedical and news text using transformer models.' }
    },
    {
      id: 'nlp-summarizer',
      cat: 'nlp',
      sub: [],
      status: 'coming-soon',
      _meta: { icon: '📝', title: 'Abstractive Text Summarizer', desc: 'Seq2Seq model (T5/PEGASUS) for generating concise summaries of long-form Arabic and English documents.' }
    },
  ];

  /* ── SUB-FILTER DEFINITIONS per category ─────────────*/
  const SUB_FILTERS = {
    all: [],
    cv: [
      { key: 'classification',   label: 'Classification' },
      { key: 'transfer-learning', label: 'Transfer Learning' },
      { key: 'tensorflow',       label: 'TensorFlow' },
      { key: 'pytorch',          label: 'PyTorch' },
    ],
    ml: [
      { key: 'regression',       label: 'Regression' },
      { key: 'classification',   label: 'Classification' },
      { key: 'sklearn',          label: 'Scikit-learn' },
    ],
    oss: [
      { key: 'pypi',             label: 'PyPI Published' },
      { key: 'data-tools',       label: 'Data Tools' },
    ],
    medical: [
      { key: 'imaging',          label: 'Medical Imaging' },
      { key: 'classification',   label: 'Classification' },
      { key: 'transfer-learning', label: 'Transfer Learning' },
      { key: 'pytorch',          label: 'PyTorch' },
      { key: 'tensorflow',       label: 'TensorFlow' },
    ],
    nlp: [],
    research: [
      { key: 'multi-label',      label: 'Multi-Label' },
      { key: 'pytorch',          label: 'PyTorch' },
      { key: 'imaging',          label: 'Medical Imaging' },
    ],
  };

  /* ── CATEGORY METADATA ────────────────────────────── */
  const CATS = [
    { key: 'all',      icon: '⬡',  label: 'All Projects' },
    { key: 'cv',       icon: '👁️',  label: 'Computer Vision' },
    { key: 'ml',       icon: '📊',  label: 'ML / Data' },
    { key: 'oss',      icon: '📦',  label: 'Open Source' },
    { key: 'medical',  icon: '🩺',  label: 'Medical AI' },
    { key: 'nlp',      icon: '💬',  label: 'NLP' },
    { key: 'research', icon: '🔬',  label: 'Research' },
  ];

  const CARDS_PER_PAGE = 6;

  /* ── STATE ────────────────────────────────────────── */
  let state = {
    activeCat: 'all',
    activeSub: null,
    page: 1,
    sort: 'default', // 'default' | 'coming-last'
  };

  /* ── DOM REFS ─────────────────────────────────────── */
  const section     = document.getElementById('projects');
  if (!section) return;

  const grid        = section.querySelector('.proj-grid');
  const tabsWrap    = section.querySelector('.cat-tabs-wrap');
  const subRow      = section.querySelector('.sub-filter-row');
  const pagination  = section.querySelector('.proj-pagination');
  const resultsCount = section.querySelector('.results-count');
  const emptyState  = section.querySelector('.proj-empty');

  /* ── BUILD CATEGORY TABS ──────────────────────────── */
  function countForCat(cat) {
    if (cat === 'all') return PROJECTS.length;
    return PROJECTS.filter(p => p.cat === cat).length;
  }

  CATS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (c.key === 'all' ? ' active' : '');
    btn.dataset.cat = c.key;
    btn.innerHTML = `
      <span class="ct-icon">${c.icon}</span>
      <span class="ct-txt">${c.label}</span>
      <span class="ct-count">${countForCat(c.key)}</span>
    `;
    btn.addEventListener('click', () => selectCat(c.key));
    tabsWrap.appendChild(btn);
  });

  /* ── BUILD SUB FILTERS ────────────────────────────── */
  function renderSubFilters(cat) {
    const filters = SUB_FILTERS[cat] || [];
    subRow.innerHTML = '';
    if (filters.length === 0) {
      subRow.classList.add('hidden');
      return;
    }
    subRow.classList.remove('hidden');

    const label = document.createElement('span');
    label.className = 'sub-filter-label';
    label.textContent = 'Filter';
    subRow.appendChild(label);

    // "All" chip
    const allChip = document.createElement('button');
    allChip.className = 'sub-chip' + (state.activeSub === null ? ' active' : '');
    allChip.dataset.sub = '';
    allChip.textContent = 'All';
    allChip.addEventListener('click', () => selectSub(null));
    subRow.appendChild(allChip);

    filters.forEach(f => {
      const chip = document.createElement('button');
      chip.className = 'sub-chip' + (state.activeSub === f.key ? ' active' : '');
      chip.dataset.sub = f.key;
      chip.textContent = f.label;
      chip.addEventListener('click', () => selectSub(f.key));
      subRow.appendChild(chip);
    });
  }

  /* ── FILTER LOGIC ─────────────────────────────────── */
  function getFiltered() {
    return PROJECTS.filter(p => {
      const catMatch = state.activeCat === 'all' || p.cat === state.activeCat;
      const subMatch = !state.activeSub || p.sub.includes(state.activeSub);
      return catMatch && subMatch;
    });
  }

  /* ── RENDER ───────────────────────────────────────── */
  function render() {
    const filtered = getFiltered();
    const total    = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / CARDS_PER_PAGE));
    state.page = Math.min(state.page, totalPages);

    // Update results count
    if (resultsCount) {
      resultsCount.innerHTML = `Showing <em>${total}</em> project${total !== 1 ? 's' : ''}`;
    }

    // Show/hide all cards
    const allCards = grid.querySelectorAll('.pcard');
    const filteredIds = filtered.map(p => p.id);

    // Paginate
    const start = (state.page - 1) * CARDS_PER_PAGE;
    const end   = start + CARDS_PER_PAGE;
    const pageIds = filteredIds.slice(start, end);

    allCards.forEach(card => {
      const id = card.dataset.pid;
      if (pageIds.includes(id)) {
        card.classList.remove('pf-hidden');
        // Stagger animation
        const idx = pageIds.indexOf(id);
        card.style.animationDelay = (idx * 60) + 'ms';
        card.classList.remove('pf-entering');
        void card.offsetWidth; // reflow
        card.classList.add('pf-entering');
      } else {
        card.classList.add('pf-hidden');
        card.classList.remove('pf-entering');
      }
    });

    // Empty state
    if (emptyState) {
      if (total === 0) {
        emptyState.classList.add('show');
      } else {
        emptyState.classList.remove('show');
      }
    }

    // Render pagination
    renderPagination(totalPages);
  }

  /* ── PAGINATION RENDER ────────────────────────────── */
  function renderPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    // Prev arrow
    const prev = makePPBtn('←', 'pp-arrow');
    prev.disabled = state.page === 1;
    prev.addEventListener('click', () => { if (state.page > 1) { state.page--; render(); scrollToProjects(); } });
    pagination.appendChild(prev);

    // Page numbers
    const pages = getPageNumbers(state.page, totalPages);
    pages.forEach(p => {
      if (p === '…') {
        const el = makePPBtn('…', 'pp-ellipsis');
        pagination.appendChild(el);
      } else {
        const btn = makePPBtn(p, p === state.page ? 'active' : '');
        btn.addEventListener('click', () => { state.page = p; render(); scrollToProjects(); });
        pagination.appendChild(btn);
      }
    });

    // Next arrow
    const next = makePPBtn('→', 'pp-arrow');
    next.disabled = state.page === totalPages;
    next.addEventListener('click', () => { if (state.page < totalPages) { state.page++; render(); scrollToProjects(); } });
    pagination.appendChild(next);

    // Page info
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
    if (current <= 4) return [1,2,3,4,5,'…',total];
    if (current >= total - 3) return [1,'…',total-4,total-3,total-2,total-1,total];
    return [1,'…',current-1,current,current+1,'…',total];
  }

  function scrollToProjects() {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── STATE CHANGERS ───────────────────────────────── */
  function selectCat(cat) {
    state.activeCat = cat;
    state.activeSub = null;
    state.page = 1;

    // Update tabs
    tabsWrap.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === cat);
    });

    renderSubFilters(cat);
    render();
  }

  function selectSub(sub) {
    state.activeSub = sub;
    state.page = 1;

    // Update chips
    subRow.querySelectorAll('.sub-chip').forEach(c => {
      c.classList.toggle('active', (c.dataset.sub || null) === (sub || null));
    });

    render();
  }

  /* ── INJECT COMING SOON CARDS ─────────────────────── */
  function injectComingSoonCards() {
    const csSoon = PROJECTS.filter(p => p.status === 'coming-soon');
    csSoon.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pcard pcard-coming-soon fade-in';
      card.dataset.pid = p.id;
      card.innerHTML = `
        <div class="cs-banner">
          <div class="cs-banner-bg"></div>
          <div class="cs-banner-content">
            <div class="cs-icon">${p._meta.icon}</div>
            <div class="cs-badge">Coming Soon</div>
            <div class="cs-dots">
              <div class="cs-dot"></div>
              <div class="cs-dot"></div>
              <div class="cs-dot"></div>
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
            <span class="plink plink-disabled" style="opacity:0.45;cursor:not-allowed">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:11px;height:11px"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              Repo — Soon
            </span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ── ASSIGN data-pid TO EXISTING CARDS ───────────────*/
  function assignProjectIds() {
    const existingPids = ['cats-dogs','deepcsv','weather','intel','garbage','cancer-vgg','cancer-tl','nih-xray'];
    const existingCards = grid.querySelectorAll('.pcard:not(.pcard-coming-soon)');
    existingCards.forEach((card, i) => {
      if (existingPids[i]) card.dataset.pid = existingPids[i];
    });
  }

  /* ── INIT ─────────────────────────────────────────── */
  assignProjectIds();
  injectComingSoonCards();

  // Initial sub-filter render (all = no subs)
  renderSubFilters('all');

  // Initial render
  render();

})();
