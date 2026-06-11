const NEXT_UP = new Set(['To Call','Contacted','Tour Scheduled','Toured','Finalist']);

export function enhanceDecisionListings(){
  const title=document.querySelector('.content-card:not(.home-focused) .view-head h2')?.textContent?.trim();
  if(title==='Listings') addPriorityHeader();
  document.querySelectorAll('.listing-card:not(.decision-card-v2)').forEach(enhanceCard);
}

function addPriorityHeader(){
  const card=document.querySelector('.content-card:not(.home-focused)');
  const filters=card?.querySelector('.filters');
  if(!card||!filters||card.querySelector('.listing-priority')) return;
  const filter=document.querySelector('#statusFilter')?.value || 'All';
  const active=document.querySelectorAll('.listing-card').length;
  const panel=document.createElement('div');
  panel.className='listing-priority';
  panel.innerHTML=`<div class="priority-copy"><strong>Next up, not everything.</strong><span>Start with the places that need a call, tour, or final decision. Details are tucked away until needed.</span></div><div class="priority-chips"><button class="priority-chip ${filter==='All'?'is-on':''}" data-priority-filter="All">Next up</button><button class="priority-chip ${filter==='To Call'?'is-on':''}" data-priority-filter="To Call">To call</button><button class="priority-chip ${filter==='Tour Scheduled'?'is-on':''}" data-priority-filter="Tour Scheduled">Tours</button><button class="priority-chip ${filter==='Finalist'?'is-on':''}" data-priority-filter="Finalist">Finalists</button><button class="priority-chip" data-priority-view="history">History</button></div>`;
  filters.before(panel);
  panel.querySelectorAll('[data-priority-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    const select=document.querySelector('#statusFilter');
    if(!select) return;
    select.value=btn.dataset.priorityFilter;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  panel.querySelector('[data-priority-view="history"]')?.addEventListener('click',()=>document.querySelector('.bottom-nav [data-view="history"]')?.click());
}

function enhanceCard(card){
  card.classList.add('decision-card-v2');
  const body=card.querySelector('.listing-body');
  const title=card.querySelector('.listing-topline h3')?.textContent?.trim() || 'Listing';
  const area=card.querySelector('.listing-topline p')?.textContent?.trim() || '';
  const status=card.dataset.status || card.querySelector('.chips span')?.textContent?.trim() || 'To Call';
  const notes=card.querySelector('.notes')?.textContent?.trim() || '';
  if(!body || body.querySelector('.listing-verdict')) return;

  const verdict=document.createElement('div');
  verdict.className='listing-verdict';
  verdict.innerHTML=`<span class="verdict-main">${verdictText(status)}</span><span class="verdict-sub">${area || 'Review fit'}</span>`;
  body.prepend(verdict);

  if(notes){
    const summary=document.createElement('p');
    summary.className='decision-summary';
    summary.textContent=shorten(notes);
    const chips=body.querySelector('.chips');
    chips?.after(summary);
  }

  const existingActions=body.querySelector('.action-row');
  const source=existingActions?.querySelector('a')?.outerHTML || '';
  const edit=existingActions?.querySelector('[data-edit]')?.outerHTML || '';
  const danger=existingActions?.querySelector('.danger')?.outerHTML || '';
  const primarySource=findPrimaryButton(existingActions,status);
  const primary=primarySource?.cloneNode(true);
  if(primary){
    primary.className='decision-primary';
    primary.textContent=primaryLabel(status, primary.textContent.trim());
  }

  const actions=document.createElement('div');
  actions.className='decision-actions';
  actions.innerHTML=`${primary?primary.outerHTML:'<button class="decision-primary" data-edit="">Review details</button>'}<button class="decision-more-toggle" type="button">More</button>`;
  const lead=body.querySelector('.lead-bar') || body.querySelector('.price-line');
  lead?.after(actions);

  const more=document.createElement('details');
  more.className='listing-more';
  const fullNotes=notes?`<p class="notes">${escapeHtml(notes)}</p>`:'';
  const verify=body.querySelector('details:not(.listing-more)')?.outerHTML || '';
  more.innerHTML=`<summary>Why / full actions</summary><div class="listing-more-inner">${fullNotes}${verify}<div class="action-row">${source}${edit}${otherActions(existingActions,primarySource)}${danger}</div></div>`;
  actions.after(more);
  actions.querySelector('.decision-more-toggle')?.addEventListener('click',()=>{more.open=!more.open;});
}

function verdictText(status){
  if(status==='Finalist') return 'Finalist — decide soon';
  if(status==='Tour Scheduled') return 'Tour scheduled';
  if(status==='Toured') return 'Post-tour decision';
  if(status==='Contacted') return 'Follow up';
  if(status==='To Call') return 'Call this';
  if(status==='Crossed Off'||status==='Rejected') return 'In history';
  return 'Review next';
}

function primaryLabel(status,current){
  if(status==='To Call') return 'Mark contacted';
  if(status==='Contacted') return 'Schedule tour';
  if(status==='Tour Scheduled'||status==='Toured') return 'Make finalist';
  if(status==='Finalist') return 'Keep as finalist';
  return current || 'Next action';
}

function findPrimaryButton(row,status){
  if(!row) return null;
  const target=status==='To Call'?'Contacted':status==='Contacted'?'Tour Scheduled':(status==='Tour Scheduled'||status==='Toured')?'Finalist':status==='Finalist'?'Finalist':'To Call';
  return row.querySelector(`[data-next="${target}"]`) || row.querySelector('[data-status]');
}

function otherActions(row,primary){
  if(!row) return '';
  return [...row.querySelectorAll('button')].filter(btn=>btn!==primary && !btn.classList.contains('danger') && !btn.dataset.edit).map(btn=>btn.outerHTML).join('');
}

function shorten(text){
  const clean=text.replace(/\s+/g,' ').trim();
  if(clean.length<=104) return clean;
  return clean.slice(0,101).trim()+'…';
}

function escapeHtml(value){
  return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
