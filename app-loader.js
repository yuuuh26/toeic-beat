const base=new URL('./',location.href).href;
const sourceUrl=new URL('app.js',base);
try{
 let source=await fetch(sourceUrl,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('app.js '+r.status);return r.text();});
 for(const file of ['audio.js','tracks.js','core.js','db.js'])source=source.replaceAll(`'./${file}'`,`'${base}${file}'`);
 source=source.replace('TOEIC BEAT v1.4.0','TOEIC BEAT v1.6.0');
 source=source.replace(
  "customTrackReady=false,customTrackName='',customTrackSize=0;",
  "customTrackReady=false,customTrackName='',customTrackSize=0,customInfiniteReady=false;"
 );
 source=source.replace(
  "const availableTracks=()=>TRACKS.filter(t=>!t.custom||customTrackReady);",
  "const availableTracks=()=>TRACKS.filter(t=>!t.custom||(t.id==='sunlight'?customTrackReady:t.id==='infinite'?customInfiniteReady:false));"
 );
 source=source.replace(
  "const [st,ss,se,custom]=await Promise.all([all(db,'stats'),all(db,'settings'),all(db,'sessions'),getOne(db,'audio','sunlight').catch(()=>null)]);",
  "const [st,ss,se,custom,infinite]=await Promise.all([all(db,'stats'),all(db,'settings'),all(db,'sessions'),getOne(db,'audio','sunlight').catch(()=>null),getOne(db,'audio','infinite').catch(()=>null)]);"
 );
 source=source.replace(
  "if(custom?.blob){customTrackReady=true;customTrackName=custom.name||'sunlight_on_the_dash.mp3';customTrackSize=custom.size||custom.blob.size||0;audio.setCustomTrackBlob(custom.blob);}",
  "if(custom?.blob){customTrackReady=true;customTrackName=custom.name||'sunlight_on_the_dash.mp3';customTrackSize=custom.size||custom.blob.size||0;audio.setCustomTrackBlob(custom.blob,'sunlight');}if(infinite?.blob){customInfiniteReady=true;audio.setCustomTrackBlob(infinite.blob,'infinite');}"
 );
 source=source.replace(
  "const session={id:crypto.randomUUID(),started:new Date().toISOString(),difficulty:settings.difficulty,track:settings.track,target:settings.target,planned:selected.length,completed:false,answers:[]};",
  "const session={id:crypto.randomUUID(),started:new Date().toISOString(),difficulty:settings.difficulty,track:settings.track,target:settings.target,planned:selected.length,completed:false,answers:[],reviewIds:[]};"
 );
 source=source.replace(
  '<span id="remaining" class="remaining">1 / ${selected.length}</span><button class="icon-button" id="pause" aria-label="一時停止">Ⅱ</button>',
  '<span id="remaining" class="remaining">1 / ${selected.length}</span><button class="icon-button question-flag" id="questionFlag" aria-label="この問題を復習に追加" aria-pressed="false">?</button><button class="icon-button" id="pause" aria-label="一時停止">Ⅱ</button><button class="quiet-end" id="finishEarly" aria-label="途中終了">終了</button>'
 );
 source=source.replace(
  "$('#pause').onclick=pauseGame;const ok=await audio.start();",
  "$('#pause').onclick=pauseGame;$('#questionFlag').onclick=toggleQuestionFlag;$('#finishEarly').onclick=()=>{if(confirm('ここまでで終了して結果を見ますか？')){window.__toeicStopTimedSession?.();finishGame(false);}};const ok=await audio.start();"
 );
 source=source.replace(
  "function nextQuestion(){if(!game)return;if(game.index>=game.selected.length){finishGame(true);return;}",
  "function nextQuestion(){if(!game)return;if(game.index>=game.selected.length){if(window.__toeicTimedSession?.active&&!window.__toeicTimedSession.expired){const next=selectWords(words,stats,settings.target,Math.min(500,words.length));if(next.length){game.selected=next;game.index=0;}else{finishGame(true);return;}}else{finishGame(true);return;}}"
 );
 source=source.replace(
  "$('#choices').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b.dataset.answer));audio.speak(w.word);}\nfunction rewardEffect",
  "$('#choices').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b.dataset.answer));syncQuestionFlag();const spokenIndex=game.index;setTimeout(()=>{if(game&&game.phase==='question'&&game.index===spokenIndex)audio.speak(w.word);},180);}\nfunction reviewIds(){if(!game)return [];return game.session.reviewIds||(game.session.reviewIds=[]);}\nfunction syncQuestionFlag(){const b=$('#questionFlag');if(!b||!game)return;const w=game.selected[game.index],on=!!w&&reviewIds().includes(w.id);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'この問題を復習から外す':'この問題を復習に追加');}\nfunction toggleQuestionFlag(){if(!game||!['question','feedback'].includes(game.phase))return;const w=game.selected[game.index];if(!w)return;const ids=reviewIds(),i=ids.indexOf(w.id);if(i>=0)ids.splice(i,1);else ids.push(w.id);syncQuestionFlag();if(db)queueSave(()=>saveSession(db,structuredClone(game.session)));}\nfunction rewardEffect"
 );
 source=source.replace(
  "function frame(now){if(!game||game.paused)return;",
  "function frame(now){if(!game||game.paused)return;if(window.__toeicTimedSession?.expired){finishGame(true);return;}"
 );
 source=source.replace(
  "else if(game.phase==='feedback'&&elapsed>=game.left&&!game.waitForVoice){game.index++;nextQuestion();}",
  "else if(game.phase==='feedback'&&(window.__toeicSkipReview||(elapsed>=game.left&&!game.waitForVoice))){window.__toeicSkipReview=false;game.waitForVoice=false;audio.cancelVoice();game.index++;nextQuestion();}"
 );
 source=source.replace(
  '<button data-review="weak">過去の苦手</button>',
  '<button data-review="weak">過去の苦手</button><button data-review="flagged">？復習</button>'
 );
 source=source.replace(
  ":Object.keys(stats).filter(id=>weak(stats[id])).sort((a,b)=>stats[a].accuracy-stats[b].accuracy);",
  ":kind==='flagged'?(s.reviewIds||[]):Object.keys(stats).filter(id=>weak(stats[id])).sort((a,b)=>stats[a].accuracy-stats[b].accuracy);"
 );
 const blob=new Blob([source],{type:'text/javascript'});
 await import(URL.createObjectURL(blob));
}catch(error){
 console.error(error);
 const main=document.querySelector('#main');
 if(main)main.innerHTML='<p class="empty">アプリの読み込みに失敗しました。オンラインで再読み込みしてください。</p>';
}
