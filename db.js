const NAME='yuu-toeic-beat';
export async function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,2);r.onupgradeneeded=()=>{const db=r.result;for(const store of ['settings','stats','sessions','audio'])if(!db.objectStoreNames.contains(store))db.createObjectStore(store,{keyPath:'id'});};r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('別のタブを閉じて、再読み込みしてください。'));});}
export function all(db,store){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export function getOne(db,store,id){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export function saveSettings(db,settings){return write(db,['settings'],tx=>tx.objectStore('settings').put({id:'main',...settings}));}
function write(db,stores,fn){return new Promise((resolve,reject)=>{const tx=db.transaction(stores,'readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('保存が中断されました'));fn(tx);});}
export function saveProgress(db,stat,session){return write(db,['stats','sessions'],tx=>{tx.objectStore('stats').put(stat);tx.objectStore('sessions').put(session);});}
export function saveSession(db,session){return write(db,['sessions'],tx=>tx.objectStore('sessions').put(session));}
export function saveAudio(db,id,blob,name){return write(db,['audio'],tx=>tx.objectStore('audio').put({id,blob,name,size:blob.size,type:blob.type,updated:new Date().toISOString()}));}
