import './PlayerCard.css';

const PlayerCard = ({ player, onSelect, isActive }) => (
  <div
    className={`player-card ${isActive ? 'player-card--active' : ''}`}
    onClick={() => onSelect?.(player)}
    role="button"
    tabIndex={0}
  >
    <div className="player-card__header">
      <h3>{player.name}</h3>
      <span className="player-card__category">{player.category}</span>
    </div>
    <p>Base: {player.basePrice}</p>
    <p>Current bid: {player.currentBid || '—'}</p>
    {player.currentBidder && (
      <p className="player-card__bidder">
        High bidder:{' '}
        {typeof player.currentBidder === 'string'
          ? player.currentBidder
          : player.currentBidder?.name || 'Team'}
      </p>
    )}
    <p>Status: {player.status}</p>
  </div>
);

export default PlayerCard;

