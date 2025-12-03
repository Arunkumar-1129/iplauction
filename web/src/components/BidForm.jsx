import { useState } from 'react';

const BidForm = ({ player, onSubmit, disabled }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!player) return;
    onSubmit?.(Number(amount));
    setAmount('');
  };

  if (!player) {
    return <p>Select a player to place a bid.</p>;
  }

  const minBid =
    player.currentBid > 0
      ? player.currentBid + (player.minIncrement || 0)
      : player.basePrice;

  return (
    <form className="bid-form" onSubmit={handleSubmit}>
      <h3>Place bid for {player.name}</h3>
      <label htmlFor="bid-amount">
        Amount (minimum {minBid})
        <input
          id="bid-amount"
          type="number"
          min={minBid}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <button type="submit" disabled={disabled}>
        Submit Bid
      </button>
    </form>
  );
};

export default BidForm;



