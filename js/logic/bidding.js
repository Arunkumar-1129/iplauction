import { Store } from '../store.js';

function currentPlayer(){ return Store.findPlayer(Store.state.currentPlayerId); }

function canBid(teamId, amount){
  const remaining = Store.teamRemaining(teamId);
  return amount > 0 && amount <= remaining;
}

function updateBid(teamId, amount){
  const p = currentPlayer();
  if(!p) return alert('Select a player to start bidding');
  if(!canBid(teamId, amount)) return alert('Bid exceeds team remaining purse');
  // upsert bid for team
  const existing = Store.state.bids.find(b=>b.teamId===teamId && b.playerId===p.id);
  if(existing){ existing.amount = amount; existing.ts = Date.now(); }
  else { Store.push('bids', { id: Date.now(), playerId: p.id, teamId, amount, ts: Date.now() }); }
  // ensure notify for mutated existing
  Store.replace('bids', arr => arr);
}

function highestBid(){
  const p = currentPlayer();
  const bids = Store.state.bids.filter(b=>b.playerId===p?.id);
  return bids.sort((a,b)=>b.amount-a.amount)[0] || null;
}

function startBidding(playerId){
  Store.update({ currentPlayerId: playerId, auctionStatus: 'in-auction' });
  // clear previous bids
  Store.replace('bids', arr => arr.filter(b=>b.playerId===playerId));
}

function finalizeSale(){
  const p = currentPlayer();
  if(!p) return alert('No player selected');
  const top = highestBid();
  if(!top) return alert('No bids entered');
  // deduct purse
  const team = Store.findTeam(top.teamId);
  team.purse = team.purse - top.amount;
  // assign player
  p.status = 'Sold';
  p.soldPrice = top.amount;
  p.soldToTeamId = team.id;
  Store.push('purchases', { id: Date.now(), playerId: p.id, teamId: team.id, amount: top.amount, ts: Date.now() });
  // exit auction state
  Store.update({ auctionStatus: 'idle', currentPlayerId: null });
}

function markUnsold(){
  const p = currentPlayer();
  if(!p) return;
  p.status = 'Available'; // back to available or unsold marker
  Store.update({ auctionStatus: 'idle', currentPlayerId: null });
}

export { startBidding, updateBid, highestBid, finalizeSale, markUnsold };
