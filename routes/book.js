var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');

/* All books */
router.get('/', function(req, res) {
  var query = 'SELECT * FROM books LIMIT ? OFFSET ?';
  var books = new Array();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, row) {
	if (books.length < req.paginate.perpage)
		books.push(row);
	else
		req.paginate.hasNext = true;
  }, function(err) {
	res.links(req.paginate.links());
	res.json(books);
  });
});

/* Single book */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM books WHERE id = ?', req.params.id, function(err, row) {
		res.json(row);
	});
});

module.exports = router;
