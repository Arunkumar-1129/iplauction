const express = require('express');
const { body } = require('express-validator');
const bidController = require('../controllers/bidController');
const auth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(auth);

router.post(
  '/',
  [
    body('playerId').notEmpty(),
    body('teamId').notEmpty(),
    body('amount').isNumeric(),
  ],
  bidController.placeBid
);

router.get('/:playerId', bidController.getBidsForPlayer);

module.exports = router;



