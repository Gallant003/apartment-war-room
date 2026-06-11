import './final.js';
import './household-click-guard.js';
import './styles-v2-polish.css';
import './styles-home-polish.css';
import './blue-fixes.css';
import './final-overrides.css';
import './final-tweaks-2.css';
import './listing-compact.css';
import './final-night.css';
import './home-pill-actions.css';
import './apartment-holo.css';
import './landing-premium.css';
import './landing-spacing-fixes.css';
import './listings-decision.css';
import './household-access.css';
import { enhancePremiumLanding } from './landing-motion.js';
import { enhanceDecisionListings } from './listings-decision.js';
import { hasSupabaseConfig, supabase } from './supabaseClient.js';

let observing = false;
let loginBusy = false;
let currentRoute = location.hash.replace('#', '') || 'dashboard';

function waitForHome() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return setTimeout(waitForHome, 250);
  installLoginFallback();
  normalizeNav();
  enhanceDashboard();
  enhancePremiumLanding();
  compactAddForm();
  tagListingCards();
  enhanceDecisionListings();
  installHistoryRouting();
  observeChanges();
}

waitForHome();

function normalizeNav() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  const keep = new Map();
  Array.from(nav.querySelectorAll('button')).forEach((button) => {
    const key = button.dataset.logTab ? 'log' : button.dataset.view;
    if (!key) return button.remove();
    if (keep.has(key)) return button.remove();
    keep.set(key, button);
    const label = { dashboard: 'Home', listings: 'Listings', add: 'Add', history: 'History', log: 'Log' }[key] || button.textContent.replace(/[⌂⌕+×◷]/g, '').trim();
    button.textContent = label;
    button.dataset.routeKey = key;
  });
}

function installHistoryRouting() {
  if (document.body.dataset.historyRouting === 'true') return;
  document.body.dataset.historyRouting = 'true';
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.bottom-nav button,[data-home-view],[data-log-direct],[data-home-filter]');
    if (!button) return;
    const route = button.dataset.homeView || button.dataset.routeKey || (button.dataset.logDirect ? 'log' : '') || (button.dataset.homeFilter ? button.dataset.homeFilter : '');
    if (!route || route === currentRoute) return;
    currentRoute = route;
    history.pushState({ route }, '', `#${route}`);
  }, true);
  window.addEventListener('popstate', () => {
    const route = location.hash.replace('#', '') || 'dashboard';
    currentRoute = route;
    if (route === 'log') document.querySelector('[data-log-tab]')?.click();
    else if (['active','to-call','finalists','history'].includes(route)) openHomeFilter(route);
    else document.querySelector(`.bottom-nav [data-view="${route}"]`)?.click();
  });
}

function installLoginFallback() {
  if (document.body.dataset.loginFallback === 'true') return;
  document.body.dataset.loginFallback = 'true';
  document.addEventListener('click', async (event) => {
    if (document.querySelector('#accessCode')) return;
    const button = event.target.closest('[data-act="login"]');
    if (!button || loginBusy) return;
    event.preventDefault();
    event.stopPropagation();
    const email = document.querySelector('#email')?.value?.trim();
    if (!email) return showToast('Enter your email first.');
    if (!hasSupabaseConfig) return showToast('Supabase is not connected.');
    loginBusy = true;
    button.disabled = true;
    const original = button.textContent;
    button.textContent = 'Sending...';
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } });
      showToast(error ? error.message : 'Check your email for the login link.');
    } catch (error) {
      showToast(error?.message || 'Login link failed.');
    } finally {
      loginBusy = false;
      button.disabled = false;
      button.textContent = original || 'Send link';
    }
  }, true);
}

function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
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
      <h3>Choose your next move.</h3>
      <p></p>
    </div>
    <button class="home-primary" data-home-view="listings"><div class="home-kicker">Recommended</div><strong>Review active leads</strong><span>Compare, prioritize, and move fast.</span><i class="home-arrow">›</i></button>
    <div class="home-micro-stats">
      <button data-home-filter="active"><span>Active</span><b>${counts.active}</b></button>
      <button data-home-filter="to-call"><span>To Call</span><b>${counts.toCall}</b></button>
      <button data-home-filter="finalists"><span>Finalists</span><b>${counts.finalists}</b></button>
      <button data-home-filter="history"><span>History</span><b>${counts.history}</b></button>
    </div>
    <div class="home-secondary-grid">
      <button class="home-secondary" data-home-view="add"><strong>Add a listing</strong><span>Capture a new place quickly.</span></button>
      <button class="home-secondary" data-home-view="history"><strong>Crossed off</strong><span>Review rejected options.</span></button>
      <button class="home-secondary" data-log-direct="true"><strong>Change log</strong><span>See edits after SQL setup.</span></button>
    </div>`;

  content.querySelector('.view-head')?.after(command);
  command.querySelectorAll('[data-home-view]').forEach((button) => button.addEventListener('click', () => document.querySelector(`.bottom-nav [data-view="${button.dataset.homeView}"]`)?.click()));
  command.querySelectorAll('[data-home-filter]').forEach((button) => button.addEventListener('click', () => openHomeFilter(button.dataset.homeFilter)));
  command.querySelector('[data-log-direct]')?.addEventListener('click', () => document.querySelector('[data-log-tab]')?.click());
}

function openHomeFilter(kind) {
  if (kind === 'history') {
    document.querySelector('.bottom-nav [data-view="history"]')?.click();
    return;
  }
  document.querySelector('.bottom-nav [data-view="listings"]')?.click();
  setTimeout(() => {
    const select = document.querySelector('#statusFilter');
    if (!select) return;
    const value = kind === 'to-call' ? 'To Call' : kind === 'finalists' ? 'Finalist' : 'All';
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, 30);
}

function compactAddForm() {
  const title = document.querySelector('.view-head h2')?.textContent.trim();
  const form = document.querySelector('#listingForm');
  if (!form || !['Add Listing', 'Edit Listing'].includes(title) || form.dataset.compactReady === 'true') return;
  form.dataset.compactReady = 'true';
  document.querySelector('.content-card')?.classList.add('add-tight');
  const grid = form.querySelector('.form-grid');
  if (!grid) return;
  const advanced = document.createElement('details');
  advanced.className = 'advanced-fields';
  advanced.innerHTML = '<summary>More details, verification, and image</summary><div class="advanced-grid"></div>';
  const advancedGrid = advanced.querySelector('.advanced-grid');
  ['address','bedrooms','bathrooms','sqft','tier','source_url','mls_number','verify','imageFile','is_crossed_off'].forEach((id) => {
    const label = form.querySelector(`#${id}`)?.closest('label');
    if (label) advancedGrid.appendChild(label);
  });
  grid.appendChild(advanced);
}

function getCounts() {
  const stats = Array.from(document.querySelectorAll('.hero-stats div'));
  const read = (label) => stats.find((div) => div.querySelector('span')?.textContent.trim() === label)?.querySelector('strong')?.textContent.trim() || '0';
  return { active: read('Active'), toCall: read('To Call'), finalists: read('Finalists'), history: read('History') };
}

function tagListingCards() {
  document.querySelectorAll('.listing-card').forEach((card) => {
    const status = card.querySelector('.chips span')?.textContent?.trim();
    const fallbackStatus = card.querySelector('.image-fallback span')?.textContent?.trim();
    if (status) card.dataset.status = status;
    if (status && fallbackStatus && status.toLowerCase() === fallbackStatus.toLowerCase()) {
      card.querySelector('.chips span')?.classList.add('is-duplicate-status');
      card.querySelector('.image-fallback span')?.setAttribute('data-deduped', 'true');
    }
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
  if (observing) return;
  observing = true;
  const root = document.querySelector('#app');
  if (!root) return;
  const observer = new MutationObserver(() => requestAnimationFrame(() => {
    normalizeNav();
    enhanceDashboard();
    enhancePremiumLanding();
    compactAddForm();
    tagListingCards();
    enhanceDecisionListings();
    installLoginFallback();
  }));
  observer.observe(root, { childList: true, subtree: true });
}
