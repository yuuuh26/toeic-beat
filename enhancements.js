(()=>{
 const STORAGE='toeic-beat-session-mode-v1';
 let prefs={mode:'count',minutes:3,count:20};
 try{prefs={...prefs,...JSON.parse(localStorage.getItem(STORAGE)||'{}')};}catch{}
 let timer=null,elapsed=0,last=0,timeEnded=false;
 window.__toeicSkipReview=false;
 window.__toeicTimedSession={active:false,expired:false};
 const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(prefs));}catch{}};
 const stopTimer=()=>{clearInterval(timer);timer=null;elapsed=0;window.__toeicTimedSession.active=false;window.__toeicTimedSession.expired=false;};
 const finishTimed=()=>{if(!window.__toeicTimedSession.active||window.__toeicTimedSession.expired)return;window.__toeicTimedSession.expired=true;timeEnded=true;};
 const startTimer=()=>{
  clearInterval(timer);elapsed=0;last=performance.now();timeEnded=false;
  window.__toeicTimedSession={active:true,expired:false,limitMs:prefs.minutes*60000};
  timer=setInterval(()=>{
   const now=performance.now();
   const playing=document.body.classList.contains('game-mode');
   const paused=document.querySelector('#pauseDialog')?.open||document.hidden;
   if(playing&&!paused)elapsed+=now-last;
   last=now;
   const remaining=Math.max(0,window.__toeicTimedSession.limitMs-elapsed);
   const badge=document.querySelector('#remaining');
   if(badge&&playing){const total=Math.ceil(remaining/1000),m=Math.floor(total/60),s=String(total%60).padStart(2,'0');badge.textContent=`⏱ ${m}:${s}`;}
   if(remaining<=0)finishTimed();
  },200);
 };
 function ensureOption(select,value,label,hidden=false){let o=[...select.options].find(x=>x.value===String(value));if(!o){o=new Option(label,String(value));select.add(o);}o.hidden=hidden;return o;}
 function patchHome(){
  const count=document.querySelector('#count');
  if(!count||count.dataset.sessionPatched)return;
  count.dataset.sessionPatched='1';
  ensureOption(count,500,'時間制用',true);
  const label=count.closest('label');if(!label)return;
  const title=label.querySelector('.label');if(title)title.textContent='SESSION / 終了条件';
  const toggle=document.createElement('div');toggle.className='session-mode';
  toggle.innerHTML='<button type="button" data-session-mode="count">問題数</button><button type="button" data-session-mode="time">時間</button>';
  label.insertBefore(toggle,count);
  const time=document.createElement('select');time.id='durationSelect';time.setAttribute('aria-label','プレイ時間');
  time.innerHTML=[2,3,5,10].map(n=>`<option value="${n}" ${prefs.minutes===n?'selected':''}>${n}分</option>`).join('');
  label.appendChild(time);
  const apply=()=>{
   toggle.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.sessionMode===prefs.mode));
   count.hidden=prefs.mode==='time';time.hidden=prefs.mode!=='time';
   if(prefs.mode==='time'){if(Number(count.value)!==500){prefs.count=Number(count.value)||prefs.count;count.value='500';count.dispatchEvent(new Event('change',{bubbles:true}));}}
   else{const restored=[10,20,30,50].includes(Number(prefs.count))?prefs.count:20;count.value=String(restored);count.dispatchEvent(new Event('change',{bubbles:true}));}
  };
  toggle.onclick=e=>{const b=e.target.closest('[data-session-mode]');if(!b)return;prefs.mode=b.dataset.sessionMode;save();apply();};
  time.onchange=()=>{prefs.minutes=Number(time.value);save();};
  count.addEventListener('change',()=>{if(prefs.mode==='count'){prefs.count=Number(count.value);save();}});
  apply();
 }
 function patchReview(){
  const review=document.querySelector('#missReview:not([hidden])');
  if(review&&!review.querySelector('.skip-hint')){const hint=document.createElement('em');hint.className='skip-hint';hint.textContent='画面をタップして次へ';review.appendChild(hint);}
 }
 function patchResult(){
  if(!document.querySelector('.result-score'))return;
  if(window.__toeicTimedSession.active&&!window.__toeicTimedSession.expired){const again=document.querySelector('#again');if(again&&!again.dataset.autoRestart){again.dataset.autoRestart='1';setTimeout(()=>again.click(),60);}return;}
  if(timeEnded){const h2=document.querySelector('main h2');if(h2)h2.textContent='時間終了。';const eye=document.querySelector('main>.eyebrow');if(eye)eye.textContent='TIME COMPLETE';timeEnded=false;clearInterval(timer);timer=null;window.__toeicTimedSession.active=false;}
 }
 document.addEventListener('pointerdown',e=>{
  const review=document.querySelector('#missReview:not([hidden])');
  if(review&&document.body.classList.contains('game-mode')){e.preventDefault();window.__toeicSkipReview=true;try{speechSynthesis.cancel();}catch{}}
 },true);
 document.addEventListener('click',e=>{
  if(e.target.closest('#start')){if(prefs.mode==='time')startTimer();else stopTimer();}
  if(e.target.closest('#quit,#home,.brand a,[data-page]')&&!window.__toeicTimedSession.expired)stopTimer();
 },true);
 const observer=new MutationObserver(()=>{patchHome();patchReview();patchResult();});
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
 patchHome();
})();
