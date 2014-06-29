var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('home', { title: req.t('bouquins.homeTitle') });
});

module.exports = router;
