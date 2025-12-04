// Central in-memory store for admin auction
export const Store = (() => {
  const state = {
    settings: { globalPurse: 10000 },
    teams: [],
    players: [],
    bids: [], // active bids for current player
    purchases: [],
    currentPlayerId: null,
    auctionStatus: 'idle', // idle | in-auction
  };
  const listeners = new Set();
  const notify = () => listeners.forEach((l) => l(state));
  return {
    state,
    subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); },
    set(key, value){ state[key] = value; notify(); },
    update(partial){ Object.assign(state, partial); notify(); },
    push(key, value){ state[key].push(value); notify(); },
    replace(key, fn){ state[key] = fn(state[key]); notify(); },
    findTeam(id){ return state.teams.find(t=>t.id===id); },
    findPlayer(id){ return state.players.find(p=>p.id===id); },
    teamSpend(teamId){ return state.purchases.filter(p=>p.teamId===teamId).reduce((s,p)=>s+p.amount,0); },
    teamRemaining(teamId){ const t=this.findTeam(teamId); return (t?.purse||0) - this.teamSpend(teamId); },
  };
})();
