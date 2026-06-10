import './final.js';
import './styles-home-polish.css';

function waitForHome() {
  const dashboard = document.querySelector('#dashboard');
  const nav = document.querySelector('.bottom-nav');
  if (!dashboard || !nav) return setTimeout(waitForHome, 250);
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
  const dashboard = document.querySelector('#dashboard');
  if (!dashboard || dashboard.querySelector('.home-choice-grid')) return;

  const choices = document.createElement('div');
  choices.className = 'home-choice-grid';
  choices.innerHTML = `
    <button class="home-choice primary-choice" data-home-view="listings"><strong>Review active leads</strong><span>Search, filter, edit, and move listings through the pipeline.</span></button>
    <button class="home-choice" data-home-view="add"><strong>Add a listing</strong><span>Capture a new lead without digging through the full board.</span></button>
    <button class="home-choice" data-home-view="history"><strong>See crossed-off places</strong><span>Keep rejected options visible without cluttering decisions.</span></button>
    <button class="home-choice" data-log-direct="true"><strong>Open change log</strong><span>See who changed what once the log SQL is enabled.</span></button>
  `;
  dashboard.prepend(choices);

  choices.querySelectorAll('[data-home-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.homeView;
      document.querySelector(`.bottom-nav [data-view="${target}"]`)?.click();
    });
  });

  choices.querySelector('[data-log-direct]')?.addEventListener('click', () => {
    document.querySelector('[data-log-tab]')?.click();
  });

  const card = document.createElement('div');
  card.className = 'decision-card';
  card.innerHTML = '<h3>Choose your path.</h3><p>This home page is just a launchpad. Jump directly into the part of the search you care about right now.</p><div class="lead-bar"><span style="width:82%"></span></div>';
  dashboard.prepend(card);
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
