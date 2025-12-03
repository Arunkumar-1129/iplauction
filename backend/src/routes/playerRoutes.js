const express = require('express');
const { body } = require('express-validator');
const playerController = require('../controllers/playerController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(auth);

router.get('/', playerController.getPlayers);

router.post(
  '/',
  isAdmin,
  [
    body('name').notEmpty(),
    body('category').notEmpty(),
    body('basePrice').isNumeric(),
  ],
  playerController.createPlayer
);

router.patch('/:id', isAdmin, playerController.updatePlayerStatus);

module.exports = router;


