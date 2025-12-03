const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'sold'],
      default: 'pending',
    },
    currentBid: { type: Number, default: 0 },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    minIncrement: { type: Number, default: 0 },
    auctionEndTime: { type: Date },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);



