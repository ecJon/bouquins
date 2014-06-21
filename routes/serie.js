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
	var nbq = 3;
	var serie;
	var books = new Array();
	var authors = new Array();
	var respond = function() {
		if (nbq==0) {
			serie.books = books;
			serie.authors = authors;
			res.format({
				html: function(){
					serie.title = serie.name;
					res.render('serie', serie);
				},
				json: function(){
					res.json(serie);
				}
			});
		}
	};
	req.db.get('SELECT * FROM series WHERE id = ?', req.params.id, function(err, row) {
		if (err) console.log(err);
		serie = row;
		nbq--;
		respond();
	});
	var booksIds = new Array();
	req.db.each('SELECT books.id AS id,title,series_index'+
		' FROM books'+
		' LEFT OUTER JOIN books_series_link ON books_series_link.book = books.id'+
		' WHERE books_series_link.series = ?'+
		' ORDER BY series_index', req.params.id, 
		function(err, book) {
			books.push(book);
			booksIds.push(book.id);
		},
		function(err) {
			if (err) console.log(err);
			nbq--;
			var autq = 'SELECT DISTINCT authors.name AS name, authors.id AS id'+
				' FROM authors'+
				' LEFT OUTER JOIN books_authors_link ON books_authors_link.author = authors.id'+
				' WHERE books_authors_link.book IN (';
			for (var i=0;i<booksIds.length-1;i++) autq+='?,';
			autq+='?)';
			req.db.each(autq, booksIds,
				function(err, author) {
					authors.push(author);
				},
				function(err) {
					if (err) console.log(err);
					nbq--;
					respond();
				}
			);
		}
	);
});

module.exports = router;
