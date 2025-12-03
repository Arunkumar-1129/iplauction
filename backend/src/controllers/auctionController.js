const { validationResult } = require('express-validator');
const Auction = require('../models/Auction');

exports.createAuction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const auction = await Auction.create(req.body);
    res.status(201).json(auction);
  } catch (error) {
    next(error);
  }
};

exports.getAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    next(error);
  }
};

exports.updateAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.json(auction);
  } catch (error) {
    next(error);
  }
};



