const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    budget: { type: Number, required: true },
    remainingBudget: {
      type: Number,
      required: true,
      default: function defaultRemainingBudget() {
        return this.budget;
      },
    },
    members: { type: [String], default: [] },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);

