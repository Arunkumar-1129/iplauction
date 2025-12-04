import { Store } from './store.js';

function save(){
  const snapshot = JSON.stringify(Store.state);
  localStorage.setItem('iplauction-admin', snapshot);
}

function load(){
  const raw = localStorage.getItem('iplauction-admin');
  if(!raw) return false;
  try{
    const st = JSON.parse(raw);
    Store.update(st);
    return true;
  }catch(e){ console.error('Failed to load state', e); return false; }
}

function exportJSON(){
  const blob = new Blob([JSON.stringify(Store.state, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'auction-admin-state.json';
  a.click();
}

async function importFile(file){
  const text = await file.text();
  const st = JSON.parse(text);
  Store.update(st);
}

export { save, load, exportJSON, importFile };
