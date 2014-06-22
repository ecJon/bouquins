var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');
var HashMap = require('hashmap').HashMap;

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
	var author;
	var books = new Array();
	var authors = new Array();
	var series = new HashMap();
	var respond = function() {
		if (books.length>0) author.books = books;
		if (series.count()>0) author.series = series.values();
		if (authors.length>0) author.coauthors = authors;
		res.format({
			html: function(){
				author.title = author.name;
				res.render('author', author);
			},
			json: function(){
				res.json(author);
			}
		});
	};
	
	var booksIds = new Array();
	req.db.each('SELECT books.id AS id,title,series_index,series.id AS series_id,series.name AS series_name,books_authors_link.author AS author_id' +
		' FROM books' +
		' LEFT OUTER JOIN books_authors_link ON books_authors_link.book = books.id'+
		' LEFT OUTER JOIN books_series_link ON books_series_link.book = books.id'+
		' LEFT OUTER JOIN series ON books_series_link.series = series.id'+
		' WHERE books_authors_link.author = ?'+
		' ORDER BY author_id', req.params.id,
		function(err, book) {
			books.push(book);
			if (book.series_id) {
				book.serie = { id: book.series_id, name: book.series_name};
				series.set(''+book.serie.id, book.serie);
			}
			delete book.series_id;
			delete book.series_name;
			booksIds.push(book.id);
		},
		function(err) {
			if (err) console.log(err);
			if (!err && books.length>0) {
				var autQuery = 'SELECT authors.id AS id,authors.name AS name'+
					' FROM authors LEFT OUTER JOIN books_authors_link ON authors.id = books_authors_link.author'+
					' WHERE books_authors_link.book IN (';
				for (var i=0; i<booksIds.length-1; i++) autQuery+='?, ';
				autQuery+='?) ORDER BY id';
				req.db.each(autQuery, booksIds,
					function(err, autRow) {
						if (autRow.id == req.params.id)
							author = autRow;
						else {
							if (authors.length == 0 || authors[authors.length-1].id != autRow.id)
								authors.push(autRow);
						}
					},
					function(err) {
						if (err) console.log(err);
						respond();
					}
				);
			} else {
				respond();
			}
		}
	);
});

module.exports = router;
