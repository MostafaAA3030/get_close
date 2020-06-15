const express = require('express');

const router = express.Router();

router.get('/counter', (req, res) => {
  res.render('counter');
});

module.exports = router;
