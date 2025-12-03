const Team = require('../models/Team');

const budgetValidator = async (req, res, next) => {
  try {
    const { teamId, amount } = req.body;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (amount > team.remainingBudget) {
      return res
        .status(400)
        .json({ message: 'Bid exceeds remaining virtual budget' });
    }
    req.team = team;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = budgetValidator;



