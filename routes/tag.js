var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');

/* All tags */
router.get('/', function(req, res) {
  var query = 'SELECT * FROM tags LIMIT ? OFFSET ?';
  var tags = new Array();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, row) {
	if (tags.length < req.paginate.perpage)
		tags.push(row);
	else
		req.paginate.hasNext = true;
  }, function(err) {
	res.links(req.paginate.links());
	res.json(tags);
  });
});

/* Single tag */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM tags WHERE id = ?', req.params.id, function(err, row) {
		res.json(row);
	});
});

module.exports = router;
