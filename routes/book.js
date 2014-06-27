var express = require('express');
var router = express.Router();
var paginate = require('../util/paginate');
var HashMap = require('hashmap').HashMap;

/* All books */
router.get('/', function(req, res) {
	var qparams = new Array();
	var query = 'SELECT books.id as id,title,series_index,name as series_name,series.id AS series_id'+
		' FROM books' +
		' LEFT OUTER JOIN books_series_link ON books.id = books_series_link.book' +
		' LEFT OUTER JOIN series ON series.id = books_series_link.series';
	var initial = req.query.initial;
	if (initial) {
		query+=' WHERE';
		if (initial == '0') {
			query+=' substr(books.sort,1,1) < ? OR substr(books.sort,1,1) > ?';
			qparams.push('A');
			qparams.push('Z');
		} else {
			query+=' UPPER(books.sort) LIKE ?';
			qparams.push(req.query.initial.toUpperCase()+'%');
		}
	}
	query+= ' ORDER BY books.sort LIMIT ? OFFSET ?';
	var books = new HashMap();
	req.paginate = new paginate(req);
	qparams.push(req.paginate.perpage + 1);
	qparams.push(req.paginate.offset);
	req.db.each(query, qparams,
		function (err, book) {
			if (books.count() < req.paginate.perpage) {
				books.set(''+book.id, book);
			} else
				req.paginate.hasNext = true; /* more than perpage */
		},
		function(err) {
			if (err) console.log(err);
			res.links(req.paginate.links());
			/* query books authors */
			var qAuthors = 'SELECT books_authors_link.book as book,authors.id as id,name FROM authors, books_authors_link WHERE books_authors_link.author = authors.id AND books_authors_link.book IN (';
			for (var i=0;i<books.count()-1;i++) qAuthors+='?,';
			qAuthors+='?)';
			req.db.each(qAuthors, books.keys(),
				function(err, author) {
					var book = books.get(''+author.book);
					if (!book.authors) book.authors = new Array();
					book.authors.push(author);
				},
				function(err) {
					if (err) console.log(err);
					res.format({
						html: function(){
							//TODO load items in home page
							res.render('home', books.values());
						},
						json: function(){
							res.json(books.values());
						}
					});
				}
			);
		}
	);
});

/* Single book */
router.get('/:id', function(req, res) {
	var book, authors, tags;
	var queries = 3;
	var callback = function() {
		if (queries == 0) {
			book.authors = authors;
			book.tags = tags;
			res.format({
				html: function(){
					res.render('book', book);
				},
				json: function(){
					res.json(book);
				}
			});
		}
	};
	// book
	req.db.get('SELECT books.id AS id,title,timestamp,pubdate,series_index,isbn,lccn,path,uuid,has_cover,' +
		'languages.lang_code,format,uncompressed_size,data.name AS data_name,series.name AS series_name,' +
		'series.id AS series_id FROM books ' +
		' LEFT OUTER JOIN books_languages_link ON books_languages_link.book = books.id ' +
		' LEFT OUTER JOIN languages ON languages.id = books_languages_link.lang_code ' +
		' LEFT OUTER JOIN data ON data.book = books.id ' +
		' LEFT OUTER JOIN books_series_link ON books.id = books_series_link.book ' +
		' LEFT OUTER JOIN series ON series.id = books_series_link.series ' +
		' WHERE books.id = ?', req.params.id,
		function(err, row) {
			if (err) console.log('ERR book: '+err);
			book = row;
			queries--;
			callback();
		}
	);
	// authors
	authors = new Array();
	req.db.each('SELECT authors.id as id,name FROM authors, books_authors_link WHERE books_authors_link.author = authors.id AND books_authors_link.book = ?', req.params.id,
		function(err, author) {
			authors.push(author);
		},
		function(err) {
			if (err) console.log('ERR authors: '+err);
			queries--;
			callback();
		}
	);
	// tags
	tags = new Array();
	req.db.each('SELECT tags.id as id,name FROM tags, books_tags_link WHERE books_tags_link.tag = tags.id AND books_tags_link.book = ?', req.params.id,
		function(err, tag) {
			tags.push(tag);
		},
		function(err) {
			if (err) console.log('ERR tags: '+err);
			queries--;
			callback();
		}
	);
});


module.exports = router;
