const { validationResult } = require('express-validator');
const User = require('../models/User');
const Team = require('../models/Team');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password, role, teamName, budget } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    let teamId = null;
    if (role === 'team') {
      if (!teamName || !budget) {
        return res
          .status(400)
          .json({ message: 'Team name and budget are required' });
      }
      const team = await Team.create({
        name: teamName,
        budget,
        remainingBudget: budget,
      });
      teamId = team._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      team: teamId,
    });

    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { owner: user._id });
    }

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('team');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};



