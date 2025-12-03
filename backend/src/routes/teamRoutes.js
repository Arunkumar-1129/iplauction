const express = require('express');
const { body } = require('express-validator');
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(auth);

router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeam);

router.post(
  '/',
  isAdmin,
  [body('name').notEmpty(), body('budget').isNumeric()],
  teamController.createTeam
);

router.patch(
  '/:id/budget',
  isAdmin,
  [body('budget').isNumeric()],
  teamController.updateBudget
);

module.exports = router;



