const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/track', projectController.addProjectTracking);

module.exports = router;
