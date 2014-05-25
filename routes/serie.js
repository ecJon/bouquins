var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');

/* All series */
router.get('/', function(req, res) {
  var query = 'SELECT * FROM series LIMIT ? OFFSET ?';
  var series = new Array();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, row) {
	if (series.length < req.paginate.perpage)
		series.push(row);
	else
		req.paginate.hasNext = true;
  }, function(err) {
	res.links(req.paginate.links());
	res.json(series);
  });
});

/* Single serie */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM series WHERE id = ?', req.params.id, function(err, row) {
		res.json(row);
	});
});

module.exports = router;
