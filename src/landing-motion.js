function ensureCanvas(){
  if(document.querySelector('.awr-motion-canvas')) return;
  const canvas=document.createElement('canvas');
  canvas.className='awr-motion-canvas';
  document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');
  let w=0,h=0,dpr=1,t=0;
  const dots=Array.from({length:42},(_,i)=>({x:Math.random(),y:Math.random(),r:1+Math.random()*2,s:.25+Math.random()*.7,o:.18+Math.random()*.32,phase:i*.7}));
  function resize(){dpr=Math.min(2,window.devicePixelRatio||1);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  function draw(){t+=.006;ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w*.5,h*.3,10,w*.5,h*.3,Math.max(w,h)*.7);g.addColorStop(0,'rgba(125,211,252,.16)');g.addColorStop(.45,'rgba(167,139,250,.08)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);for(const p of dots){const x=p.x*w+Math.sin(t*p.s+p.phase)*26;const y=p.y*h+Math.cos(t*p.s+p.phase)*18;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(245,248,252,${p.o})`;ctx.fill()}requestAnimationFrame(draw)}
  resize();addEventListener('resize',resize,{passive:true});draw();
}

function reveal(){
  document.querySelectorAll('.awr-rise,.listing-card,.home-secondary,.awr-stat-card').forEach((el,i)=>{el.style.transitionDelay=Math.min(i*45,360)+'ms';el.classList.add('awr-rise')});
  const io=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12});
  document.querySelectorAll('.awr-rise').forEach(el=>io.observe(el));
}

function installPremiumLanding(){
  if(document.body.dataset.awrPremium==='true') return;
  document.body.dataset.awrPremium='true';
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) ensureCanvas();
}

export function enhancePremiumLanding(){
  installPremiumLanding();
  const command=document.querySelector('.home-command:not(.awr-command)');
  if(command){
    const stats=[...command.querySelectorAll('.home-micro-stats button')].map(btn=>({kind:btn.dataset.homeFilter,label:btn.querySelector('span')?.textContent||'',num:btn.querySelector('b')?.textContent||'0'}));
    command.classList.add('awr-command');
    command.innerHTML=`
      <section class="awr-landing">
        <div class="awr-landing-main awr-rise">
          <div>
            <div class="awr-eyebrow">Private decision system</div>
            <h3>Find the right home <span class="awr-gradient">before the search gets messy.</span></h3>
            <p>One shared board for leads, calls, tours, crossed-off places, and finalists. Built to keep you and Stephanie moving from maybe to yes.</p>
            <div class="awr-actions">
              <button class="awr-cta" data-home-view="listings">Review active leads</button>
              <button class="awr-ghost" data-home-view="add">Add a listing</button>
            </div>
          </div>
          <div class="awr-stat-grid">${stats.map(s=>`<button class="awr-stat-card" data-home-filter="${s.kind}"><span>${s.label}</span><b>${s.num}</b><small>Tap to view</small></button>`).join('')}</div>
        </div>
        <aside class="awr-side awr-rise">
          <div class="awr-orbit"><div class="awr-orbit-card"><strong>Ground floor. In-unit laundry. Pet safe.</strong><span>The non-negotiables stay visible so the pretty places do not waste your time.</span></div></div>
          <div class="awr-flow">
            <div class="awr-mini"><b>Call</b><span>Verify rules</span></div>
            <div class="awr-mini"><b>Tour</b><span>Compare fit</span></div>
            <div class="awr-mini"><b>Finalist</b><span>Shortlist</span></div>
            <div class="awr-mini"><b>History</b><span>No repeats</span></div>
          </div>
        </aside>
      </section>`;
    command.querySelectorAll('[data-home-view]').forEach((button)=>button.addEventListener('click',()=>document.querySelector(`.bottom-nav [data-view="${button.dataset.homeView}"]`)?.click()));
    command.querySelectorAll('[data-home-filter]').forEach((button)=>button.addEventListener('click',()=>{
      if(button.dataset.homeFilter==='history') document.querySelector('.bottom-nav [data-view="history"]')?.click();
      else { document.querySelector('.bottom-nav [data-view="listings"]')?.click(); setTimeout(()=>{const select=document.querySelector('#statusFilter'); if(!select)return; select.value=button.dataset.homeFilter==='to-call'?'To Call':button.dataset.homeFilter==='finalists'?'Finalist':'All'; select.dispatchEvent(new Event('change',{bubbles:true}))},30); }
    }));
  }
  reveal();
}
