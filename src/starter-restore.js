import { STARTER_LISTINGS } from './data.js';
import { hasSupabaseConfig, supabase } from './supabaseClient.js';

let busy = false;

export function enhanceStarterRestore(){
  const statValues = [...document.querySelectorAll('.hero-stats strong')].map(x => Number(x.textContent || 0));
  const looksEmpty = statValues.length && statValues.every(n => !n);
  if(!looksEmpty || document.querySelector('.starter-restore')) return;

  const target = document.querySelector('.listing-priority') || document.querySelector('.home-command') || document.querySelector('.content-card');
  if(!target) return;

  const panel = document.createElement('div');
  panel.className = 'starter-restore';
  panel.innerHTML = `<strong>Starter board is empty.</strong><span>Restore the original search leads into Supabase.</span><button type="button" data-restore-starter>Load starter board</button>`;
  target.prepend(panel);
}

document.addEventListener('click', async (event)=>{
  const button = event.target.closest('[data-restore-starter]');
  if(!button || busy) return;
  busy = true;
  button.disabled = true;
  button.textContent = 'Loading...';
  try{
    if(!hasSupabaseConfig) throw new Error('Supabase is not connected.');
    const { data: existing, error: checkError } = await supabase.from('apartments').select('id').limit(1);
    if(checkError) throw checkError;
    if(existing?.length){
      toast('Starter board already has data. Refreshing...');
      setTimeout(()=>location.reload(), 700);
      return;
    }
    const { error } = await supabase.from('apartments').insert(STARTER_LISTINGS);
    if(error) throw error;
    toast('Starter board loaded.');
    setTimeout(()=>location.reload(), 700);
  }catch(error){
    toast(error?.message || 'Could not load starter board.');
    button.disabled = false;
    button.textContent = 'Load starter board';
    busy = false;
  }
});

function toast(message){
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2600);
}
