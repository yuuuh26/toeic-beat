const base=new URL('./',location.href).href;
const sourceUrl=new URL('app.js',base);
try{
 let source=await fetch(sourceUrl,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('app.js '+r.status);return r.text();});
 for(const file of ['audio.js','tracks.js','core.js','db.js'])source=source.replaceAll(`'./${file}'`,`'${base}${file}'`);
 source=source.replace('TOEIC BEAT v1.4.0','TOEIC BEAT v1.5.0');
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
  "function nextQuestion(){if(!game)return;if(game.index>=game.selected.length){finishGame(true);return;}",
  "function nextQuestion(){if(!game)return;if(game.index>=game.selected.length){if(window.__toeicTimedSession?.active&&!window.__toeicTimedSession.expired){const next=selectWords(words,stats,settings.target,Math.min(500,words.length));if(next.length){game.selected=next;game.index=0;}else{finishGame(true);return;}}else{finishGame(true);return;}}"
 );
 source=source.replace(
  "function frame(now){if(!game||game.paused)return;",
  "function frame(now){if(!game||game.paused)return;if(window.__toeicTimedSession?.expired){finishGame(true);return;}"
 );
 source=source.replace(
  "else if(game.phase==='feedback'&&elapsed>=game.left&&!game.waitForVoice){game.index++;nextQuestion();}",
  "else if(game.phase==='feedback'&&(window.__toeicSkipReview||(elapsed>=game.left&&!game.waitForVoice))){window.__toeicSkipReview=false;game.waitForVoice=false;audio.cancelVoice();game.index++;nextQuestion();}"
 );
 const blob=new Blob([source],{type:'text/javascript'});
 await import(URL.createObjectURL(blob));
}catch(error){
 console.error(error);
 const main=document.querySelector('#main');
 if(main)main.innerHTML='<p class="empty">アプリの読み込みに失敗しました。オンラインで再読み込みしてください。</p>';
}
