import './v2.js';
import './styles-v2-polish.css';
import { hasSupabaseConfig, supabase } from './supabaseClient.js';

let activity = [];
let activityReady = false;
let activityToastTimer = null;

function waitForApp() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return setTimeout(waitForApp, 250);
  installLogTab();
}

waitForApp();

function installLogTab() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav || nav.querySelector('[data-log-tab]')) return;
  const button = document.createElement('button');
  button.dataset.logTab = 'true';
  button.innerHTML = '<span>◷</span>Log';
  button.addEventListener('click', showLogView);
  nav.appendChild(button);
}

async function showLogView() {
  document.querySelectorAll('.bottom-nav button').forEach((button) => button.classList.remove('active'));
  document.querySelector('[data-log-tab]')?.classList.add('active');

  const card = document.querySelector('.content-card');
  if (!card) return;

  card.innerHTML = '<div class="view-head"><div><h2>Change Log</h2><p>A running history of adds, edits, and removals.</p></div><button class="primary-button compact" data-log-refresh>Refresh</button></div><div class="empty-state"><h3>Loading log…</h3><p>Checking Supabase activity history.</p></div>';
  document.querySelector('[data-log-refresh]')?.addEventListener('click', showLogView);

  if (!hasSupabaseConfig) {
    card.innerHTML = '<div class="view-head"><div><h2>Change Log</h2><p>A running history of adds, edits, and removals.</p></div></div><div class="empty-state"><h3>Log needs Supabase</h3><p>The visual log appears after the activity-log SQL is run.</p></div>';
    return;
  }

  const { data, error } = await supabase.from('apartment_activity').select('*').order('changed_at', { ascending: false }).limit(80);
  if (error) {
    activityReady = false;
    card.innerHTML = '<div class="view-head"><div><h2>Change Log</h2><p>A running history of adds, edits, and removals.</p></div><button class="primary-button compact" data-log-refresh>Refresh</button></div><div class="empty-state"><h3>Run the log SQL first</h3><p>Once the activity table exists, future adds, edits, and removals will show here.</p></div>';
    document.querySelector('[data-log-refresh]')?.addEventListener('click', showLogView);
    return;
  }

  activityReady = true;
  activity = data || [];

  card.innerHTML = '<div class="view-head"><div><h2>Change Log</h2><p>A running history of adds, edits, and removals.</p></div><button class="primary-button compact" data-log-refresh>Refresh</button></div>' + renderActivity();
  document.querySelector('[data-log-refresh]')?.addEventListener('click', showLogView);
}

function renderActivity() {
  if (!activityReady) return '';
  if (!activity.length) return '<div class="empty-state"><h3>No log entries yet</h3><p>After the SQL is run, future listing changes will appear here.</p></div>';
  return '<div class="activity-list">' + activity.map(activityCard).join('') + '</div>';
}

function activityCard(row) {
  const title = row.apartment_name || row.new_row?.name || row.old_row?.name || 'Listing';
  const who = row.changed_by || 'Unknown';
  const diff = diffRows(row).slice(0, 5).join('');
  return '<article class="activity-card"><div class="activity-head"><div><div class="activity-title">' + escapeHtml(title) + '</div><div class="activity-meta">' + escapeHtml(who) + ' • ' + formatTime(row.changed_at) + '</div></div><span class="activity-badge">' + escapeHtml(row.action) + '</span></div>' + (diff ? '<div class="activity-diff">' + diff + '</div>' : '') + '</article>';
}

function diffRows(row) {
  if (row.action === 'insert') return ['<div><b>Added</b> ' + escapeHtml(row.new_row?.name || row.apartment_name || 'listing') + '</div>'];
  if (row.action === 'delete') return ['<div><b>Removed</b> ' + escapeHtml(row.old_row?.name || row.apartment_name || 'listing') + '</div>'];
  const oldRow = row.old_row || {};
  const newRow = row.new_row || {};
  const keys = ['status', 'price', 'score', 'notes', 'verify', 'is_crossed_off'];
  return keys.filter((key) => oldRow[key] !== newRow[key]).map((key) => '<div><b>' + labelFor(key) + '</b>: ' + escapeHtml(oldRow[key] ?? 'blank') + ' → ' + escapeHtml(newRow[key] ?? 'blank') + '</div>');
}

function labelFor(key) {
  return key === 'is_crossed_off' ? 'Crossed off' : key.replaceAll('_', ' ');
}

function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
