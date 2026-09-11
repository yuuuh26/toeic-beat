(()=>{
 const STORAGE='toeic-beat-session-mode-v1',DB_NAME='yuu-toeic-beat';
 let prefs={mode:'count',minutes:3,count:20};
 try{prefs={...prefs,...JSON.parse(localStorage.getItem(STORAGE)||'{}')};}catch{}
 let timer=null,elapsed=0,last=0,timeEnded=false;
 window.__toeicSkipReview=false;
 window.__toeicTimedSession={active:false,expired:false};
 const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(prefs));}catch{}};
 const notice=text=>{const n=document.querySelector('#notice');if(n){n.textContent=text;n.hidden=false;}};
 const openDB=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,2);r.onupgradeneeded=()=>{const db=r.result;for(const store of ['settings','stats','sessions','audio'])if(!db.objectStoreNames.contains(store))db.createObjectStore(store,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const getAudio=async id=>{const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('audio').objectStore('audio').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});};
 const putAudio=async(id,file)=>{const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('audio','readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.objectStore('audio').put({id,blob:file,name:file.name,size:file.size,type:file.type,updated:new Date().toISOString()});});};
 const stopTimer=()=>{clearInterval(timer);timer=null;elapsed=0;window.__toeicTimedSession.active=false;window.__toeicTimedSession.expired=false;};
 const finishTimed=()=>{if(!window.__toeicTimedSession.active||window.__toeicTimedSession.expired)return;window.__toeicTimedSession.expired=true;timeEnded=true;};
 const startTimer=()=>{
  clearInterval(timer);elapsed=0;last=performance.now();timeEnded=false;
  window.__toeicTimedSession={active:true,expired:false,limitMs:prefs.minutes*60000};
  timer=setInterval(()=>{
   const now=performance.now(),playing=document.body.classList.contains('game-mode'),paused=document.querySelector('#pauseDialog')?.open||document.hidden;
   if(playing&&!paused)elapsed+=now-last;last=now;
   const remaining=Math.max(0,window.__toeicTimedSession.limitMs-elapsed),badge=document.querySelector('#remaining');
   if(badge&&playing){const total=Math.ceil(remaining/1000),m=Math.floor(total/60),s=String(total%60).padStart(2,'0');badge.textContent=`⏱ ${m}:${s}`;}
   if(remaining<=0)finishTimed();
  },200);
 };
 function ensureOption(select,value,label,hidden=false){let o=[...select.options].find(x=>x.value===String(value));if(!o){o=new Option(label,String(value));select.add(o);}o.hidden=hidden;return o;}
 function patchHome(){
  const count=document.querySelector('#count');if(!count)return;
  if(!count.dataset.sessionPatched){
   count.dataset.sessionPatched='1';ensureOption(count,500,'時間制用',true);
   const label=count.closest('label');if(label){const title=label.querySelector('.label');if(title)title.textContent='SESSION / 終了条件';const toggle=document.createElement('div');toggle.className='session-mode';toggle.innerHTML='<button type="button" data-session-mode="count">問題数</button><button type="button" data-session-mode="time">時間</button>';label.insertBefore(toggle,count);const time=document.createElement('select');time.id='durationSelect';time.setAttribute('aria-label','プレイ時間');time.innerHTML=[2,3,5,10].map(n=>`<option value="${n}" ${prefs.minutes===n?'selected':''}>${n}分</option>`).join('');label.appendChild(time);const apply=()=>{toggle.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.sessionMode===prefs.mode));count.hidden=prefs.mode==='time';time.hidden=prefs.mode!=='time';if(prefs.mode==='time'){if(Number(count.value)!==500){prefs.count=Number(count.value)||prefs.count;count.value='500';count.dispatchEvent(new Event('change',{bubbles:true}));}}else{const restored=[10,20,30,50].includes(Number(prefs.count))?prefs.count:20;count.value=String(restored);count.dispatchEvent(new Event('change',{bubbles:true}));}};toggle.onclick=e=>{const b=e.target.closest('[data-session-mode]');if(!b)return;prefs.mode=b.dataset.sessionMode;save();apply();};time.onchange=()=>{prefs.minutes=Number(time.value);save();};count.addEventListener('change',()=>{if(prefs.mode==='count'){prefs.count=Number(count.value);save();}});apply();}
  }
  const pending=localStorage.getItem('toeic-beat-pending-track'),track=document.querySelector('#track');
  if(pending==='infinite'&&track?.querySelector('option[value="infinite"]')){track.value='infinite';track.dispatchEvent(new Event('change',{bubbles:true}));localStorage.removeItem('toeic-beat-pending-track');notice('The Infinite Pathを選択曲に設定しました。');}
 }
 function patchSettings(){
  if(document.querySelector('#infiniteTrack'))return;
  const existing=document.querySelector('#customTrack')?.closest('.card');if(!existing)return;
  const card=document.createElement('section');card.className='card';card.innerHTML='<h3>The Infinite Path</h3><p class="muted">添付曲を一度登録すると、この端末の曲一覧から選べます。MP3はIndexedDBに保存されます。</p><label class="file-import">The Infinite Pathを登録<input id="infiniteTrack" type="file" accept="audio/mpeg,.mp3"></label><p class="storage" id="infiniteStatus">確認中…</p>';existing.after(card);
  const input=card.querySelector('#infiniteTrack'),status=card.querySelector('#infiniteStatus');
  getAudio('infinite').then(x=>{status.textContent=x?.blob?`登録済み：${x.name||'the_infinite_path.mp3'} · ${((x.size||x.blob.size)/1024/1024).toFixed(2)} MB`:'未登録';}).catch(()=>status.textContent='保存状態を確認できません');
  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.mp3')&&file.type!=='audio/mpeg'){notice('MP3ファイルを選択してください。');return;}try{await putAudio('infinite',file);localStorage.setItem('toeic-beat-pending-track','infinite');notice('The Infinite Pathを保存しました。曲一覧へ反映します。');setTimeout(()=>location.reload(),250);}catch(e){console.error(e);notice('曲を保存できませんでした。端末の空き容量をご確認ください。');}};
 }
 function patchReview(){const review=document.querySelector('#missReview:not([hidden])');if(review&&!review.querySelector('.skip-hint')){const hint=document.createElement('em');hint.className='skip-hint';hint.textContent='画面をタップして次へ';review.appendChild(hint);}}
 function patchResult(){if(!document.querySelector('.result-score'))return;if(window.__toeicTimedSession.active&&!window.__toeicTimedSession.expired){const again=document.querySelector('#again');if(again&&!again.dataset.autoRestart){again.dataset.autoRestart='1';setTimeout(()=>again.click(),60);}return;}if(timeEnded){const h2=document.querySelector('main h2');if(h2)h2.textContent='時間終了。';const eye=document.querySelector('main>.eyebrow');if(eye)eye.textContent='TIME COMPLETE';timeEnded=false;clearInterval(timer);timer=null;window.__toeicTimedSession.active=false;}}
 document.addEventListener('pointerdown',e=>{const review=document.querySelector('#missReview:not([hidden])');if(review&&document.body.classList.contains('game-mode')){e.preventDefault();window.__toeicSkipReview=true;try{speechSynthesis.cancel();}catch{}}},true);
 document.addEventListener('click',e=>{if(e.target.closest('#start')){if(prefs.mode==='time')startTimer();else stopTimer();}if(e.target.closest('#quit,#home,.brand a,[data-page]')&&!window.__toeicTimedSession.expired)stopTimer();},true);
 const observer=new MutationObserver(()=>{patchHome();patchSettings();patchReview();patchResult();});observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});patchHome();patchSettings();
})();
