const { validationResult } = require('express-validator');
const Team = require('../models/Team');

exports.createTeam = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, budget, members } = req.body;
    const team = await Team.create({
      name,
      budget,
      remainingBudget: budget,
      members,
    });
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { budget } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const delta = budget - team.budget;
    team.budget = budget;
    team.remainingBudget += delta;
    if (team.remainingBudget < 0) {
      return res
        .status(400)
        .json({ message: 'Remaining budget cannot be negative' });
    }
    await team.save();
    res.json(team);
  } catch (error) {
    next(error);
  }
};



