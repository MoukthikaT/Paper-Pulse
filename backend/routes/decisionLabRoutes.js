const express = require('express');
const router = express.Router();
const decisionLabController = require('../controllers/decisionLabController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/challenge', (req, res, next) => decisionLabController.getChallenge(req, res, next));
router.post('/submit', (req, res, next) => decisionLabController.submitDecision(req, res, next));
router.get('/stats', (req, res, next) => decisionLabController.getStats(req, res, next));

module.exports = router;
