var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');

/* All authors */
router.get('/', function(req, res) {
  var query = 'SELECT authors.id as id,name,count(*) as count FROM authors,books_authors_link WHERE authors.id = books_authors_link.author GROUP BY books_authors_link.author ORDER BY sort LIMIT ? OFFSET ?';
  var authors = new Array();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, row) {
	if (authors.length < req.paginate.perpage)
		authors.push(row);
	else
		req.paginate.hasNext = true;
  }, function(err) {
    if (err) console.log(err);
	res.links(req.paginate.links());
	res.json(authors);
  });
});

/* Single author */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM authors WHERE id = ?', req.params.id, function(err, row) {
		res.format({
			html: function(){
				row.title = row.name;
				res.render('author', row);
			},
			json: function(){
				res.json(row);
			}
		});
	});
});

module.exports = router;
