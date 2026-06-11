const ACCESS_CODE = String(import.meta.env.VITE_AWR_ACCESS_CODE || 'home').trim();
const USERS = ['Stephen', 'Stephanie'];

document.addEventListener('click', (event) => {
  const button = event.target.closest('.household-card [data-act="login"]');
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const user = document.querySelector('#householdUser')?.value || 'Stephen';
  const code = document.querySelector('#accessCode')?.value?.trim();

  if (code !== ACCESS_CODE) {
    showHouseholdGuardToast('Access code does not match.');
    return;
  }

  localStorage.setItem('awr_user', USERS.includes(user) ? user : 'Stephen');
  localStorage.setItem('awr_access_ok', 'true');
  location.reload();
}, true);

function showHouseholdGuardToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}
