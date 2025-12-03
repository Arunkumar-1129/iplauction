const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    defaultBudget: { type: Number, required: true },
    settings: {
      minIncrement: { type: Number, default: 0 },
      bidTimeLimitSeconds: { type: Number, default: 60 },
      extendOnBidSeconds: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auction', auctionSchema);



