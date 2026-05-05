// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDate(d) {
  return d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ─── DOM refs ──────────────────────────────────────────────────────────────
const skeleton     = document.getElementById('skeleton');
const errorState   = document.getElementById('error-state');
const cardsGrid    = document.getElementById('cards-grid');
const refreshBtn   = document.getElementById('refresh-btn');
const retryBtn     = document.getElementById('retry-btn');
const liveDateEl   = document.getElementById('live-date');
const lastUpdated  = document.getElementById('last-updated');

// ─── Live clock ────────────────────────────────────────────────────────────
(function tick() {
  liveDateEl.textContent = fmtDate(new Date());
  setTimeout(tick, 30000);
})();

// ─── Build card HTML ───────────────────────────────────────────────────────
function buildCard(article, index) {
  const isFeatured = index === 0;
  const card = document.createElement('a');
  card.className = 'article-card' + (isFeatured ? ' featured' : '');
  card.href   = article.url || '#';
  card.target = '_blank';
  card.rel    = 'noopener noreferrer';

  const imgSrc = article.urlToImage;
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${article.title || ''}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-img-placeholder>✦</div>'">`
    : `<div class="card-img-placeholder">✦</div>`;

  card.innerHTML = `
    <div class="card-img-wrap">${imgHtml}</div>
    <div class="card-body">
      <div class="card-source">
        <span>${article.source?.name || 'Unknown'}</span>
        <span class="card-time">${timeAgo(article.publishedAt)}</span>
      </div>
      <h2 class="card-title">${article.title || 'No title'}</h2>
      ${article.description ? `<p class="card-desc">${article.description}</p>` : ''}
      <span class="card-link">
        Read Story
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </span>
    </div>`;
  return card;
}

// ─── Fetch & render ────────────────────────────────────────────────────────
async function loadNews() {
  // Reset state
  skeleton.style.display    = 'grid';
  errorState.style.display  = 'none';
  cardsGrid.style.display   = 'none';
  cardsGrid.innerHTML       = '';
  refreshBtn.classList.add('spinning');

  try {
    const res  = await fetch(`/api/news?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]');
    if (!articles.length) throw new Error('No articles');

    articles.forEach((article, i) => cardsGrid.appendChild(buildCard(article, i)));

    skeleton.style.display  = 'none';
    cardsGrid.style.display = 'grid';
    lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}`;

  } catch (err) {
    console.error('News load error:', err);
    skeleton.style.display   = 'none';
    errorState.style.display = 'block';
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}

// ─── Event listeners ───────────────────────────────────────────────────────
refreshBtn.addEventListener('click', loadNews);
retryBtn.addEventListener('click', loadNews);

// ─── Init ──────────────────────────────────────────────────────────────────
loadNews();
