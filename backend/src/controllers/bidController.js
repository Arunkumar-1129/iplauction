const { validationResult } = require('express-validator');
const Player = require('../models/Player');
const Bid = require('../models/Bid');
const Team = require('../models/Team');
const Auction = require('../models/Auction');

const extendAuctionIfNeeded = async (player, amountPlacedAt) => {
  if (!player.auction) return player;
  const auction = await Auction.findById(player.auction);
  if (!auction) return player;
  const { extendOnBidSeconds } = auction.settings;
  if (!extendOnBidSeconds) return player;
  if (
    player.auctionEndTime &&
    player.auctionEndTime.getTime() - amountPlacedAt.getTime() <=
      extendOnBidSeconds * 1000
  ) {
    player.auctionEndTime = new Date(
      amountPlacedAt.getTime() + extendOnBidSeconds * 1000
    );
  }
  return player;
};

exports.placeBid = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { playerId, teamId, amount } = req.body;
    const [player, team] = await Promise.all([
      Player.findById(playerId),
      Team.findById(teamId),
    ]);
    if (!player || !team) {
      return res.status(404).json({ message: 'Player or team not found' });
    }
    if (player.status !== 'active') {
      return res.status(400).json({ message: 'Player is not open for bids' });
    }

    const minIncrement = player.minIncrement || 0;
    const minAllowed =
      player.currentBid === 0
        ? player.basePrice
        : player.currentBid + minIncrement;
    if (amount < minAllowed) {
      return res.status(400).json({
        message: `Bid must be at least ${minAllowed}`,
      });
    }
    if (
      player.auctionEndTime &&
      player.auctionEndTime.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Bidding window is closed' });
    }

    const previousTeamId = player.currentBidder;
    const previousAmount = player.currentBid;

    const sameTeamAsPrevious =
      previousTeamId && previousTeamId.toString() === team._id.toString();
    const availableBudget = sameTeamAsPrevious
      ? team.remainingBudget + previousAmount
      : team.remainingBudget;

    if (amount > availableBudget) {
      return res
        .status(400)
        .json({ message: 'Bid exceeds remaining virtual budget' });
    }

    team.remainingBudget = availableBudget - amount;
    await team.save();

    if (previousTeamId && !sameTeamAsPrevious) {
      await Team.findByIdAndUpdate(previousTeamId, {
        $inc: { remainingBudget: previousAmount },
      });
    }

    player.currentBid = amount;
    player.currentBidder = team._id;
    player.status = 'active';
    await extendAuctionIfNeeded(player, new Date());
    await player.save();

    const bid = await Bid.create({
      amount,
      player: player._id,
      team: team._id,
    });

    const payload = {
      playerId: player._id,
      amount,
      teamId: team._id,
      remainingBudget: team.remainingBudget,
    };

    req.io.emit('bid:update', payload);
    if (player.auction) {
      req.io
        .to(`auction-${player.auction.toString()}`)
        .emit('bid:update', payload);
    }

    res.status(201).json({ bid, player });
  } catch (error) {
    next(error);
  }
};

exports.getBidsForPlayer = async (req, res, next) => {
  try {
    const bids = await Bid.find({ player: req.params.playerId })
      .sort({ createdAt: -1 })
      .populate('team');
    res.json(bids);
  } catch (error) {
    next(error);
  }
};

