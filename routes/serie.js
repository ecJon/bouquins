var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');
var HashMap = require('hashmap').HashMap;

/* All series */
router.get('/', function(req, res) {
  var query = 'SELECT series.id as id,name,count(*) as count FROM series,books_series_link WHERE books_series_link.series = series.id GROUP BY books_series_link.series ORDER BY sort LIMIT ? OFFSET ?';
  var series = new HashMap();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, row) {
	if (series.count() < req.paginate.perpage)
		series.set(''+row.id,row);
	else
		req.paginate.hasNext = true;
  }, function(err) {
	if (err) console.log(err);
	res.links(req.paginate.links());
	/* query series authors */
	var qAuthors = 'SELECT DISTINCT books_series_link.series as serie, authors.id as id,name FROM authors,books_authors_link,books_series_link WHERE books_series_link.book = books_authors_link.book AND books_authors_link.author = authors.id AND books_series_link.series IN (';
	for (var i=0;i<series.count()-1;i++) qAuthors+='?,';
	qAuthors+='?)';
	req.db.each(qAuthors, series.keys(), function(err, author) {
		var serie = series.get(''+author.serie);
		if (!serie.authors) serie.authors = new Array();
		serie.authors.push(author);
	}, function(err) {
		if (err) console.log(err);
		res.json(series.values());
	});
  });
});

/* Single serie */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM series WHERE id = ?', req.params.id, function(err, row) {
		res.format({
			html: function(){
				row.title = row.name;
				res.render('serie', row);
			},
			json: function(){
				res.json(row);
			}
		});
	});
});

module.exports = router;
