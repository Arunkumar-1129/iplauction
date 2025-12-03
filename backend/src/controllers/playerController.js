const { validationResult } = require('express-validator');
const Player = require('../models/Player');

exports.createPlayer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

exports.getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().populate('currentBidder');
    res.json(players);
  } catch (error) {
    next(error);
  }
};

exports.updatePlayerStatus = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    next(error);
  }
};



