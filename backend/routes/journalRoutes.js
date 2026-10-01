const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => journalController.getJournalEntries(req, res, next));
router.get('/stats', (req, res, next) => journalController.getJournalStats(req, res, next));
router.put('/:tradeId', (req, res, next) => journalController.updateReflection(req, res, next));

module.exports = router;
