import './styles.css';
import { hasSupabaseConfig, supabase } from './supabaseClient.js';

const STATUSES = [
  'To Call',
  'Contacted',
  'Tour Scheduled',
  'Toured',
  'Rejected',
  'Finalist',
  'Crossed Off'
];

const STARTER_LISTINGS = [
  {
    name: '5637 Twin Oaks',
    area: 'Stephanie excited',
    price: null,
    bedrooms: 2,
    bathrooms: null,
    tier: 'Hot Lead',
    status: 'To Call',
    score: 8.8,
    notes: 'Condo-style lead. Verify HOA, pet rules, lease timing, washer/dryer, and ground-floor fit.',
    verify: 'HOA/pet/lease rules; dog approval; move-in timing.',
    is_crossed_off: false
  },
  {
    name: '56146 Chesapeake',
    area: 'Stephanie excited',
    price: null,
    bedrooms: 2,
    bathrooms: null,
    tier: 'Hot Lead',
    status: 'To Call',
    score: 8.6,
    notes: 'Active lead. Confirm whether the practical details beat a standard apartment option.',
    verify: 'Availability, lease terms, pet approval, W/D, ground floor.',
    is_crossed_off: false
  },
  {
    name: '15536 Ashley',
    area: 'Stephanie excited',
    price: null,
    bedrooms: 2,
    bathrooms: null,
    tier: 'Hot Lead',
    status: 'To Call',
    score: 8.4,
    notes: 'Ashley added to the board as a serious lead.',
    verify: 'Pet/HOA/lease rules and total monthly cost.',
    is_crossed_off: false
  },
  {
    name: 'Laurel Valley',
    area: 'Apartment lead',
    tier: 'To Call',
    status: 'To Call',
    score: 7.5,
    notes: 'Call for current dog, ground floor, W/D, and July move-in details.',
    verify: 'Dog + ground floor + W/D + July move-in.',
    is_crossed_off: false
  },
  {
    name: 'Stone Ridge',
    area: 'Apartment lead',
    tier: 'To Call',
    status: 'To Call',
    score: 7.4,
    notes: 'Needs direct call and updated availability check.',
    verify: 'Dog + ground floor + W/D + July move-in.',
    is_crossed_off: false
  },
  {
    name: 'Stonehaven',
    area: 'Apartment lead',
    tier: 'To Call',
    status: 'To Call',
    score: 7.2,
    notes: 'Keep in active call batch unless pricing/availability disappoints.',
    verify: 'Dog + ground floor + W/D + July move-in.',
    is_crossed_off: false
  },
  {
    name: 'Cornerstone',
    area: 'Apartment lead',
    tier: 'To Call',
    status: 'To Call',
    score: 7.1,
    notes: 'Backup active lead.',
    verify: 'Dog + ground floor + W/D + July move-in.',
    is_crossed_off: false
  },
  {
    name: 'The Graham — 2B/2B',
    area: 'History',
    bedrooms: 2,
    bathrooms: 2,
    tier: 'Former default',
    status: 'Crossed Off',
    score: 0,
    notes: 'Preserved as search history. The 2B/2B was taken; the 2B/1B is not worth the price.',
    verify: 'No longer active.',
    is_crossed_off: true
  }
];

const app = document.querySelector('#app');
let listings = [];
let editingId = null;

renderShell();
boot();

async function boot() {
  if (!hasSupabaseConfig) {
    listings = STARTER_LISTINGS;
    renderApp(null, 'demo');
    return;
  }

  const { data } = await supabase.auth.getSession();
  renderApp(data.session, 'live');

  supabase.auth.onAuthStateChange((_event, session) => {
    renderApp(session, 'live');
  });
}

function renderShell() {
  app.innerHTML = `
    <main class="wrap">
      <header class="hero">
        <div class="hero-inner">
          <div>
            <div class="kicker">Apartment Search</div>
            <h1>Apartment<br />War Room</h1>
            <div class="subtitle">Shared decision board for Stephen & Stephanie. Add listings, update status, upload screenshots, and keep the same board synced across devices.</div>
          </div>
          <div class="stats" id="heroStats"></div>
        </div>
        <div class="rule">Rule: new winner must clear dog + ground floor + washer/dryer + move-in timing, and improve cost, commute, or quality. Condo-style leads need HOA/pet/lease-rule confirmation.</div>
      </header>

      <section id="authCard" class="auth-card"></section>
      <section class="dash" id="dashboard"></section>
      <section class="form-panel" id="formPanel"></section>
      <section class="toolbar" id="toolbar"></section>
      <section class="gallery" id="gallery"></section>
    </main>
  `;
}

async function renderApp(session, mode) {
  renderAuth(session, mode);

  if (mode === 'live' && !session) {
    listings = [];
    renderStats();
    renderDashboard();
    renderForm(false);
    renderToolbar(false);
    renderListings();
    return;
  }

  if (mode === 'live') await loadListings();
  renderStats();
  renderDashboard();
  renderForm(true);
  renderToolbar(true);
  renderListings();
}

function renderAuth(session, mode) {
  const authCard = document.querySelector('#authCard');

  if (mode === 'demo') {
    authCard.innerHTML = `
      <div>
        <strong>Demo mode</strong>
        <p>Supabase environment variables are not set yet. The app is showing starter data only. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel to enable shared persistence.</p>
      </div>
    `;
    return;
  }

  if (session) {
    authCard.innerHTML = `
      <div>
        <strong>Signed in</strong>
        <p>${escapeHtml(session.user.email)} can edit the shared board.</p>
      </div>
      <button id="logoutButton">Log out</button>
    `;
    document.querySelector('#logoutButton').addEventListener('click', async () => {
      await supabase.auth.signOut();
    });
    return;
  }

  authCard.innerHTML = `
    <div>
      <strong>Sign in to edit</strong>
      <p>Use the email allowlist from Supabase. Magic-link auth keeps this simple and safe.</p>
    </div>
    <div class="auth-actions">
      <input id="emailInput" type="email" placeholder="you@example.com" />
      <button id="loginButton">Send magic link</button>
    </div>
  `;

  document.querySelector('#loginButton').addEventListener('click', sendMagicLink);
}

async function sendMagicLink() {
  const email = document.querySelector('#emailInput').value.trim();
  if (!email) return alert('Enter your email first.');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });

  if (error) return alert(error.message);
  alert('Check your email for the login link.');
}

async function loadListings() {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('is_crossed_off', { ascending: true })
    .order('status', { ascending: true })
    .order('score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) return alert(error.message);
  listings = data || [];
}

function renderStats() {
  const active = listings.filter((item) => !isCrossed(item));
  const finalist = listings.filter((item) => item.status === 'Finalist');
  const toCall = listings.filter((item) => item.status === 'To Call');
  const crossed = listings.filter(isCrossed);

  document.querySelector('#heroStats').innerHTML = `
    <div class="stat"><b>Active leads</b><span>${active.length}</span></div>
    <div class="stat"><b>To call</b><span>${toCall.length}</span></div>
    <div class="stat"><b>Finalists</b><span>${finalist.length}</span></div>
    <div class="stat"><b>Crossed off</b><span>${crossed.length}</span></div>
  `;
}

function renderDashboard() {
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, []]));

  for (const listing of listings) {
    const status = isCrossed(listing) ? 'Crossed Off' : listing.status;
    if (!byStatus[status]) byStatus[status] = [];
    byStatus[status].push(listing);
  }

  document.querySelector('#dashboard').innerHTML = `
    <article class="panel pipeline-panel">
      <div class="panel-head">
        <h2>Pipeline</h2>
        <p>Live counts and current status. Crossed-off listings stay visible as history.</p>
      </div>
      <div class="pipeline">
        ${STATUSES.map((status) => `
          <div>
            <h4>${status} <span>${byStatus[status]?.length || 0}</span></h4>
            ${(byStatus[status] || []).slice(0, 5).map((item) => `<p class="${status === 'Crossed Off' ? 'rejected-pipe' : ''}">${escapeHtml(item.name)}</p>`).join('') || '<p class="empty-pipe">None yet</p>'}
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

function renderToolbar(enabled) {
  document.querySelector('#toolbar').innerHTML = `
    <div>
      <h2>Listings</h2>
      <p>${listings.length} total listings</p>
    </div>
    <button id="seedButton" ${!enabled || listings.length ? 'disabled' : ''}>Load starter board</button>
  `;

  const seedButton = document.querySelector('#seedButton');
  seedButton?.addEventListener('click', seedStarterListings);
}

function renderForm(enabled) {
  const panel = document.querySelector('#formPanel');

  panel.innerHTML = `
    <div class="panel-head">
      <h2>${editingId ? 'Edit Listing' : 'Add Listing'}</h2>
      <p>Persistence first. Pretty second. Add the essentials and refine later.</p>
    </div>
    <form id="listingForm" class="listing-form">
      <div class="form-grid">
        ${input('name', 'Name', true)}
        ${input('area', 'Area')}
        ${input('address', 'Address')}
        ${input('price', 'Price', false, 'number')}
        ${input('bedrooms', 'Bedrooms', false, 'number', '0.5')}
        ${input('bathrooms', 'Bathrooms', false, 'number', '0.5')}
        ${input('sqft', 'Sqft', false, 'number')}
        ${input('tier', 'Tier')}
        <label>Status<select id="status">${STATUSES.map((status) => `<option>${status}</option>`).join('')}</select></label>
        ${input('score', 'Score', false, 'number', '0.1')}
        ${input('source_url', 'Source URL', false, 'url')}
        ${input('mls_number', 'MLS Number')}
        <label class="wide">Notes<textarea id="notes"></textarea></label>
        <label class="wide">Verify<textarea id="verify"></textarea></label>
        <label>Image / Screenshot<input id="imageFile" type="file" accept="image/*" /></label>
        <label class="checkbox-label"><input id="is_crossed_off" type="checkbox" /> Crossed off</label>
      </div>
      <div class="form-actions">
        <button type="submit" ${enabled ? '' : 'disabled'}>${editingId ? 'Save changes' : 'Add listing'}</button>
        <button type="button" id="resetButton">Clear</button>
      </div>
    </form>
  `;

  document.querySelector('#listingForm').addEventListener('submit', saveListing);
  document.querySelector('#resetButton').addEventListener('click', () => {
    editingId = null;
    renderForm(enabled);
  });

  if (editingId) fillForm(listings.find((item) => item.id === editingId));
}

function input(id, label, required = false, type = 'text', step = null) {
  return `<label>${label}<input id="${id}" type="${type}" ${step ? `step="${step}"` : ''} ${required ? 'required' : ''} /></label>`;
}

async function saveListing(event) {
  event.preventDefault();

  const payload = readForm();
  if (payload.status === 'Crossed Off') payload.is_crossed_off = true;

  const imageFile = document.querySelector('#imageFile').files[0];
  if (imageFile) payload.image_url = await uploadImage(imageFile);

  if (!hasSupabaseConfig) {
    if (editingId) listings = listings.map((item) => item.id === editingId ? { ...item, ...payload } : item);
    else listings.unshift({ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() });
    editingId = null;
    renderApp(null, 'demo');
    return;
  }

  const query = editingId
    ? supabase.from('apartments').update(payload).eq('id', editingId)
    : supabase.from('apartments').insert(payload);

  const { error } = await query;
  if (error) return alert(error.message);

  editingId = null;
  await renderApp((await supabase.auth.getSession()).data.session, 'live');
}

function readForm() {
  return {
    name: value('name'),
    area: value('area'),
    address: value('address'),
    price: numberValue('price'),
    bedrooms: numberValue('bedrooms'),
    bathrooms: numberValue('bathrooms'),
    sqft: numberValue('sqft'),
    tier: value('tier'),
    status: value('status') || 'To Call',
    score: numberValue('score'),
    notes: value('notes'),
    verify: value('verify'),
    source_url: value('source_url'),
    mls_number: value('mls_number'),
    is_crossed_off: document.querySelector('#is_crossed_off').checked
  };
}

function fillForm(listing) {
  if (!listing) return;
  for (const key of ['name', 'area', 'address', 'price', 'bedrooms', 'bathrooms', 'sqft', 'tier', 'status', 'score', 'notes', 'verify', 'source_url', 'mls_number']) {
    const el = document.querySelector(`#${key}`);
    if (el) el.value = listing[key] ?? '';
  }
  document.querySelector('#is_crossed_off').checked = Boolean(listing.is_crossed_off);
}

async function uploadImage(file) {
  if (!hasSupabaseConfig) return null;

  const extension = file.name.split('.').pop() || 'jpg';
  const filePath = `listings/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from('listing-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    alert(error.message);
    throw error;
  }

  const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
  return data.publicUrl;
}

async function seedStarterListings() {
  if (!hasSupabaseConfig) return;

  const { error } = await supabase.from('apartments').insert(STARTER_LISTINGS);
  if (error) return alert(error.message);

  await renderApp((await supabase.auth.getSession()).data.session, 'live');
}

function renderListings() {
  const gallery = document.querySelector('#gallery');

  if (!listings.length) {
    gallery.innerHTML = '<article class="empty-state"><h3>No listings yet</h3><p>Add your first listing or load the starter board.</p></article>';
    return;
  }

  gallery.innerHTML = listings.map((listing) => card(listing)).join('');

  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      editingId = button.dataset.edit;
      renderForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => quickStatus(button.dataset.status, button.dataset.next));
  });
}

function card(listing) {
  const crossed = isCrossed(listing);
  const image = listing.image_url
    ? `<div class="photo"><img src="${escapeHtml(listing.image_url)}" alt="${escapeHtml(listing.name)}" /></div>`
    : `<div class="photo art ${crossed ? '' : 'gold'}"><span>${escapeHtml(listing.status || 'Lead')}</span><strong>${escapeHtml(listing.tier || 'War Room')}</strong></div>`;

  return `
    <article class="card ${crossed ? 'rejected' : ''}">
      ${image}
      <div class="body">
        <div class="top">
          <div>
            <h3>${escapeHtml(listing.name)}</h3>
            <div class="area">${escapeHtml(listing.area || listing.address || 'No area yet')}</div>
          </div>
          <div class="score"><b>${listing.score ?? '—'}</b><span>score</span></div>
        </div>
        <div class="price">${money(listing.price)}</div>
        <div class="chips">
          <span class="active">${escapeHtml(listing.status)}</span>
          ${listing.tier ? `<span>${escapeHtml(listing.tier)}</span>` : ''}
          ${listing.bedrooms ? `<span>${listing.bedrooms} bed</span>` : ''}
          ${listing.bathrooms ? `<span>${listing.bathrooms} bath</span>` : ''}
          ${listing.sqft ? `<span>${listing.sqft} sqft</span>` : ''}
          ${listing.mls_number ? `<span>MLS ${escapeHtml(listing.mls_number)}</span>` : ''}
        </div>
        ${listing.notes ? `<p class="take">${escapeHtml(listing.notes)}</p>` : ''}
        ${listing.verify ? `<details><summary>Verify</summary><p>${escapeHtml(listing.verify)}</p></details>` : ''}
        <div class="card-actions">
          ${listing.source_url ? `<a href="${escapeHtml(listing.source_url)}" target="_blank" rel="noreferrer">Source</a>` : ''}
          <button data-edit="${listing.id}">Edit</button>
          <button data-status="${listing.id}" data-next="Contacted">Contacted</button>
          <button data-status="${listing.id}" data-next="Tour Scheduled">Tour</button>
          <button data-status="${listing.id}" data-next="Finalist">Finalist</button>
          <button data-status="${listing.id}" data-next="Crossed Off">Cross off</button>
        </div>
      </div>
    </article>
  `;
}

async function quickStatus(id, status) {
  const payload = { status, is_crossed_off: status === 'Crossed Off' };

  if (!hasSupabaseConfig) {
    listings = listings.map((item) => item.id === id ? { ...item, ...payload } : item);
    renderApp(null, 'demo');
    return;
  }

  const { error } = await supabase.from('apartments').update(payload).eq('id', id);
  if (error) return alert(error.message);

  await renderApp((await supabase.auth.getSession()).data.session, 'live');
}

function value(id) {
  return document.querySelector(`#${id}`)?.value.trim() || null;
}

function numberValue(id) {
  const raw = value(id);
  return raw === null ? null : Number(raw);
}

function money(value) {
  if (!value) return 'Price TBD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function isCrossed(listing) {
  return Boolean(listing.is_crossed_off || listing.status === 'Crossed Off' || listing.status === 'Rejected');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
