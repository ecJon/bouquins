var express = require('express');
var router = express.Router();

/* All authors */
router.get('/', function(req, res) {
  var query = 'SELECT * FROM authors ';
  query += ' LIMIT ? OFFSET ?';
  var authors = new Array();
  var perpage = req.query.perpage;
  perpage = perpage ? perpage : 10;
  req.db.each(query, perpage, 0, function (err, row) {
    authors.push(row);
  }, function(err) {
	res.json(authors);
  });
});

/* Single author */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM authors WHERE id = ?', req.params.id, function(err, row) {
		res.json(row);
	});
});

module.exports = router;
