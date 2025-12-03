const express = require('express');
const { body } = require('express-validator');
const auctionController = require('../controllers/auctionController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(auth);

router.get('/', auctionController.getAuctions);

router.post(
  '/',
  isAdmin,
  [body('name').notEmpty(), body('defaultBudget').isNumeric()],
  auctionController.createAuction
);

router.patch('/:id', isAdmin, auctionController.updateAuction);

module.exports = router;



