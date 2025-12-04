import { Store } from '../store.js';
import { save, load, exportJSON, importFile } from '../persist.js';
import { startBidding, updateBid, highestBid, finalizeSale, markUnsold } from '../logic/bidding.js';

// Elements
const globalPurse = document.getElementById('globalPurse');
const applyPurseBtn = document.getElementById('applyPurseBtn');
const saveStateBtn = document.getElementById('saveStateBtn');
const loadStateBtn = document.getElementById('loadStateBtn');
const exportStateBtn = document.getElementById('exportStateBtn');
const importFileInput = document.getElementById('importFile');

const addTeamBtn = document.getElementById('addTeamBtn');
const teamsTableBody = document.querySelector('#teamsTable tbody');

const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerSearch = document.getElementById('playerSearch');
const playersTableBody = document.querySelector('#playersTable tbody');
const importPlayersCsv = document.getElementById('importPlayersCsv');

const panelPhoto = document.getElementById('panelPhoto');
const panelName = document.getElementById('panelName');
const panelStats = document.getElementById('panelStats');
const panelBase = document.getElementById('panelBase');
const startBiddingBtn = document.getElementById('startBiddingBtn');
const finalizeSaleBtn = document.getElementById('finalizeSaleBtn');
const markUnsoldBtn = document.getElementById('markUnsoldBtn');

const bidTeam = document.getElementById('bidTeam');
const bidAmount = document.getElementById('bidAmount');
const updateBidBtn = document.getElementById('updateBidBtn');
const highestBidEl = document.getElementById('highestBid');
const bidLog = document.getElementById('bidLog');
const toastEl = document.getElementById('toast');

// Initial settings
globalPurse.value = Store.state.settings.globalPurse;

applyPurseBtn.addEventListener('click', () => {
  Store.state.settings.globalPurse = Number(globalPurse.value || 0);
  alert('Initial purse will be applied to new teams.');
});

saveStateBtn.addEventListener('click', save);
loadStateBtn.addEventListener('click', () => {
  const ok = load();
  if(!ok) alert('No saved state found');
});
exportStateBtn.addEventListener('click', exportJSON);
importFileInput.addEventListener('change', async (e) => {
  if(e.target.files?.[0]) await importFile(e.target.files[0]);
});

// Teams
function renderTeams(){
  if(!Store.state.teams.length){
    teamsTableBody.innerHTML = `<tr><td colspan="5" class="empty">No teams yet. Click \"Add Team\" to create one.</td></tr>`;
  } else {
    teamsTableBody.innerHTML = Store.state.teams.map((t,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${t.name}</td>
      <td>₹ ${t.purse.toLocaleString?.() || t.purse}</td>
      <td>₹ ${Store.teamRemaining(t.id).toLocaleString?.() || Store.teamRemaining(t.id)}</td>
      <td>${Store.state.purchases.filter(p=>p.teamId===t.id).length}</td>
    </tr>
    `).join('');
  }
  // team select
  bidTeam.innerHTML = Store.state.teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}

addTeamBtn.addEventListener('click', () => {
  const name = prompt('Team name');
  if(!name) return;
  const purse = Number(Store.state.settings.globalPurse || 0);
  Store.push('teams', { id: Date.now(), name, purse });
});

// Players
function renderPlayers(){
  const q = (playerSearch.value || '').toLowerCase();
  const rows = Store.state.players.filter(p => !q || p.name.toLowerCase().includes(q));
  if(!rows.length){
    playersTableBody.innerHTML = `<tr><td colspan="6" class="empty">No players yet. Use \"Add Player\" or \"Import CSV\".</td></tr>`;
    return;
  }
  playersTableBody.innerHTML = rows.map((p,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${p.photo ? `<img src="${p.photo}" class="thumb"/>` : '-'}</td>
      <td>${p.name}</td>
      <td>₹ ${p.basePrice.toLocaleString?.() || p.basePrice}</td>
      <td><span class="badge ${p.status==='Sold'?'status-sold':p.status==='In Auction'?'status-auction':'status-available'}">${p.status || 'Available'}</span></td>
      <td>
        <button data-action="select" data-id="${p.id}">Select</button>
      </td>
    </tr>
  `).join('');
}

addPlayerBtn.addEventListener('click', () => {
  const name = prompt('Player name');
  if(!name) return;
  const photo = prompt('Photo URL (optional)') || '';
  const basePrice = Number(prompt('Base price (₹)')||0);
  const stats = prompt('Stats/notes') || '';
  Store.push('players', { id: Date.now(), name, photo, basePrice, stats, status: 'Available' });
});

// CSV import: supports two formats:
// 1) Simple: name,photo,basePrice,stats
// 2) ESPN-style: ID,Name,longName,battingName,fieldingName,imgUrl,dob,battingStyles,longBattingStyles,bowlingStyles,longBowlingStyles,playingRoles,espn_url
importPlayersCsv?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if(lines.length < 2) return alert('CSV seems empty');
  const headers = lines[0].split(',').map(h=>h.trim());
  // Build case-insensitive header index
  const hmap = Object.fromEntries(headers.map((h,i)=>[h.toLowerCase(), i]));
  const simple = {
    name: hmap['name'],
    photo: hmap['photo'],
    basePrice: hmap['baseprice'],
    stats: hmap['stats'],
  };
  const espn = {
    id: hmap['id'],
    name: hmap['name'],
    imgUrl: hmap['imgurl'],
    battingStyles: hmap['battingstyles'],
    longBattingStyles: hmap['longbattingstyles'],
    bowlingStyles: hmap['bowlingstyles'],
    longBowlingStyles: hmap['longbowlingstyles'],
    playingRoles: hmap['playingroles'],
    espn_url: hmap['espn_url'],
  };
  const added = [];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',');
    let name = '', photo = '', basePrice = 0, stats = '';
    if(simple.name !== undefined){
      name = cols[simple.name]?.trim() || '';
      if(!name) continue;
      photo = simple.photo !== undefined ? (cols[simple.photo]?.trim() || '') : '';
      const basePriceRaw = simple.basePrice !== undefined ? (cols[simple.basePrice]?.trim() || '0') : '0';
      basePrice = Number(basePriceRaw.replace(/[^0-9.]/g,'')) || 0;
      stats = simple.stats !== undefined ? (cols[simple.stats]?.trim() || '') : '';
    } else if(espn.name !== undefined){
      name = cols[espn.name]?.trim() || '';
      if(!name) continue;
      photo = espn.imgUrl !== undefined ? (cols[espn.imgUrl]?.trim() || '') : '';
      // No base price column in ESPN file; default 0 (admin can set later)
      basePrice = 0;
      // Build stats from roles and styles if present
      const roles = espn.playingRoles !== undefined ? (cols[espn.playingRoles]?.trim() || '') : '';
      const bat = espn.longBattingStyles !== undefined ? (cols[espn.longBattingStyles]?.trim() || '') : '';
      const bowl = espn.longBowlingStyles !== undefined ? (cols[espn.longBowlingStyles]?.trim() || '') : '';
      stats = [roles, bat, bowl].filter(Boolean).join(' | ');
    } else {
      // Unknown header set
      alert('CSV headers not recognized. Expected simple or ESPN-style headers.');
      break;
    }
    Store.push('players', { id: Date.now()+i, name, photo, basePrice, stats, status: 'Available' });
    added.push(name);
  }
  alert(`Imported ${added.length} players from CSV`);
});

playersTableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const id = Number(btn.dataset.id);
  const p = Store.findPlayer(id);
  if(!p) return;
  // populate panel
  panelPhoto.innerHTML = p.photo ? `<img src="${p.photo}" class="photo"/>` : '';
  panelName.textContent = p.name;
  panelStats.textContent = p.stats || '-';
  panelBase.textContent = `Base: ₹ ${p.basePrice}`;
  Store.update({ currentPlayerId: p.id });
  // highlight selection row
  [...playersTableBody.querySelectorAll('tr')].forEach(tr=>tr.classList.remove('highlight'));
  btn.closest('tr')?.classList.add('highlight');
  showToast(`Selected: ${p.name}`);
});

// Bidding
startBiddingBtn.addEventListener('click', () => {
  if(!Store.state.currentPlayerId) return alert('Select a player');
  startBidding(Store.state.currentPlayerId);
  const p = Store.findPlayer(Store.state.currentPlayerId);
  p.status = 'In Auction';
  showToast(`Bidding started for ${p.name}`);
});

updateBidBtn.addEventListener('click', () => {
  const teamId = Number(bidTeam.value);
  const amount = Number(bidAmount.value || 0);
  updateBid(teamId, amount);
  renderHighestAndLog();
  const teamName = Store.findTeam(teamId)?.name || 'Team';
  showToast(`${teamName} bid ₹ ${amount.toLocaleString()}`);
});

finalizeSaleBtn.addEventListener('click', () => {
  finalizeSale();
  renderTeams();
  renderPlayers();
  highestBidEl.textContent = '—';
  bidLog.innerHTML = '';
  showToast('Sale finalized');
});

markUnsoldBtn.addEventListener('click', () => {
  markUnsold();
  renderPlayers();
  showToast('Marked unsold');
});

function renderHighestAndLog(){
  const top = highestBid();
  highestBidEl.textContent = top ? `₹ ${top.amount.toLocaleString?.() || top.amount}` : '—';
  const pId = Store.state.currentPlayerId;
  const bids = Store.state.bids.filter(b=>b.playerId===pId).sort((a,b)=>b.ts-a.ts);
  bidLog.innerHTML = bids.map(b=>`<li>${new Date(b.ts).toLocaleTimeString()} — Team ${Store.findTeam(b.teamId).name} bid ₹ ${b.amount.toLocaleString?.() || b.amount}</li>`).join('');
  // highlight highest
  if(top){ highestBidEl.classList.add('highlight'); setTimeout(()=>highestBidEl.classList.remove('highlight'), 600); }
}

// subscriptions
Store.subscribe(()=>{ renderTeams(); renderPlayers(); renderHighestAndLog(); });
renderTeams();
renderPlayers();

// Toast utility
function showToast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toastEl.classList.remove('show'), 1500);
}
