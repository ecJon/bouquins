var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');
var HashMap = require('hashmap').HashMap;

/* All books */
router.get('/', function(req, res) {
   var query = 'SELECT books.id as id,title,series_index,name as series_name FROM books LEFT OUTER JOIN books_series_link ON books.id = books_series_link.book LEFT OUTER JOIN series ON series.id = books_series_link.series ORDER BY books.sort LIMIT ? OFFSET ?';
  var books = new HashMap();
  req.paginate = new paginate(req);
  req.db.each(query, req.paginate.perpage + 1, req.paginate.offset, function (err, book) {
	if (books.count() < req.paginate.perpage) {
		books.set(''+book.id, book);
	} else
		req.paginate.hasNext = true; /* more than perpage */
  }, function(err) {
    if (err) console.log(err);
	res.links(req.paginate.links());
	/* query books authors */
	var qAuthors = 'SELECT books_authors_link.book as book,authors.id as id,name FROM authors, books_authors_link WHERE books_authors_link.author = authors.id AND books_authors_link.book IN (';
	for (var i=0;i<books.count()-1;i++) qAuthors+='?,';
	qAuthors+='?)';
	req.db.each(qAuthors, books.keys(), function(err, author) {
		var book = books.get(''+author.book);
		if (!book.authors) book.authors = new Array();
		book.authors.push(author);
	}, function(err) {
		if (err) console.log(err);
		res.json(books.values());
	});
  });
});

/* Single book */
router.get('/:id', function(req, res) {
	req.db.get('SELECT * FROM books WHERE id = ?', req.params.id, function(err, row) {
		res.format({
			html: function(){
				res.render('book', row);
			},
			json: function(){
				res.json(row);
			}
		});
	});
});

module.exports = router;
