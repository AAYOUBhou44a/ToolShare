const express = require('express');
const router = express.Router();

const {
  initializeAdmin,
} = require('../controllers/installation.controller');

router.post('/admin', initializeAdmin);

module.exports = router;