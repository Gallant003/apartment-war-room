import './final.js';
import './styles-home-polish.css';

function waitForHome() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return setTimeout(waitForHome, 250);
  polishNav();
  enhanceDashboard();
  tagListingCards();
  observeChanges();
}

waitForHome();

function polishNav() {
  document.querySelectorAll('.bottom-nav button').forEach((button) => {
    const text = button.textContent.trim();
    button.innerHTML = text.replace(/[⌂⌕+×◷]/g, '').trim() || text;
  });
}

function enhanceDashboard() {
  const content = document.querySelector('.content-card');
  const head = document.querySelector('.view-head h2');
  const dashboard = document.querySelector('.dashboard-grid');
  if (!content || !dashboard || !head || head.textContent.trim() !== 'Dashboard') return;
  if (content.querySelector('.home-command')) return;

  content.classList.add('home-focused');

  const counts = getCounts();
  const command = document.createElement('div');
  command.className = 'home-command';
  command.innerHTML = `
    <div>
      <div class="home-kicker">Command Center</div>
      <h3>What do you want to work on?</h3>
      <p>Start with the main board, or jump straight into the part of the search that matters right now.</p>
    </div>
    <button class="home-primary" data-home-view="listings">
      <div class="home-kicker">Recommended</div>
      <strong>Review active leads</strong>
      <span>Compare live options, move listings through the pipeline, and decide what deserves attention next.</span>
      <i class="home-arrow">›</i>
    </button>
    <div class="home-secondary-grid">
      <button class="home-secondary" data-home-view="add"><strong>Add a listing</strong><span>Capture a new place quickly.</span></button>
      <button class="home-secondary" data-home-view="history"><strong>Crossed off</strong><span>Review rejected options.</span></button>
      <button class="home-secondary" data-log-direct="true"><strong>Change log</strong><span>See edits after SQL setup.</span></button>
    </div>
    <div class="home-micro-stats">
      <div><span>Active</span><b>${counts.active}</b></div>
      <div><span>To Call</span><b>${counts.toCall}</b></div>
      <div><span>Finalists</span><b>${counts.finalists}</b></div>
      <div><span>History</span><b>${counts.history}</b></div>
    </div>
  `;

  const viewHead = content.querySelector('.view-head');
  viewHead?.after(command);

  command.querySelectorAll('[data-home-view]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(`.bottom-nav [data-view="${button.dataset.homeView}"]`)?.click();
    });
  });

  command.querySelector('[data-log-direct]')?.addEventListener('click', () => {
    document.querySelector('[data-log-tab]')?.click();
  });
}

function getCounts() {
  const stats = Array.from(document.querySelectorAll('.hero-stats div'));
  const read = (label) => {
    const item = stats.find((div) => div.querySelector('span')?.textContent.trim() === label);
    return item?.querySelector('strong')?.textContent.trim() || '0';
  };
  return { active: read('Active'), toCall: read('To Call'), finalists: read('Finalists'), history: read('History') };
}

function tagListingCards() {
  document.querySelectorAll('.listing-card').forEach((card) => {
    const status = card.querySelector('.chips span')?.textContent?.trim();
    if (status) card.dataset.status = status;
    const score = Number(card.querySelector('.score-badge strong')?.textContent || 0);
    if (!card.querySelector('.lead-bar') && score) {
      const bar = document.createElement('div');
      bar.className = 'lead-bar';
      bar.innerHTML = `<span style="width:${Math.min(100, Math.max(5, score * 10))}%"></span>`;
      card.querySelector('.price-line')?.after(bar);
    }
  });
}

function observeChanges() {
  const root = document.querySelector('#app');
  if (!root) return;
  const observer = new MutationObserver(() => {
    polishNav();
    enhanceDashboard();
    tagListingCards();
  });
  observer.observe(root, { childList: true, subtree: true });
}
