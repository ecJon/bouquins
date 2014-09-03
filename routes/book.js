var express = require('express');
var router = express.Router();
var _ = require('underscore');
var paginate = require('../util/paginate');
var HashMap = require('hashmap').HashMap;

function find(db, pager, appendwhere, callback) {
	var books = new HashMap();

	var qparams = new Array();
	var query = 'SELECT books.id as id,title,series_index,name as series_name,series.id AS series_id'+
		' FROM books' +
		' LEFT OUTER JOIN books_series_link ON books.id = books_series_link.book' +
		' LEFT OUTER JOIN series ON series.id = books_series_link.series';
	if (appendwhere) {
		query = appendwhere(query, qparams);
	}
	query+= ' LIMIT ? OFFSET ?';
	qparams.push(pager.perpage + 1);
	qparams.push(pager.offset);

	// console.log(query);
	// console.log(qparams);
	db.each(query, qparams,
		function (err, book) {
			if (books.count() < pager.perpage) {
				books.set(''+book.id, book);
			} else
				pager.hasNext = true; /* more than perpage */
		},
		function(err) {
			if (err) console.log(err);
			/* query books authors */
			var qAuthors = 'SELECT books_authors_link.book as book,authors.id as id,name FROM authors, books_authors_link WHERE books_authors_link.author = authors.id AND books_authors_link.book IN (';
			for (var i=0;i<books.count()-1;i++) qAuthors+='?,';
			qAuthors+='?)';
			db.each(qAuthors, books.keys(),
				function(err, author) {
					var book = books.get(''+author.book);
					if (!book.authors) book.authors = new Array();
					book.authors.push(author);
				},
				function(err) {
					if (err) console.log(err);
					callback(books.values());
				}
			);
		}
	);
}

/* All books */
router.get('/', function(req, res) {
	var pager = new paginate(req);
	find(req.db, pager,
		function(query, qparams) {
			/* books with given initial */
			query = pager.appendInitialQuery(query,'books.sort',qparams,true);
			/* recent */
			if (req.query.sort == 'recent')
				query+= ' ORDER BY books.last_modified DESC';
			else
				query+= ' ORDER BY books.sort';
			return query;
		},
		function(books) {
			res.links(pager.links());
			res.json(books);
		}
	);
});

/* Search */
router.post('/', function(req,res) {
	/* param q = search term 
	 * Search in
	 *   book.sort weight 1000
	 *   author.sort weight 1
	 *   serie.sort weight 5
	 *   comment weight 100
	 */
	var found = new Array();

	var term = '%'+req.body.q.toUpperCase()+'%';
	console.log(term);
	
	var nbqueries = 4;

	var output = function(err) {
		if (err) console.log(err);
		nbqueries--;
		if (nbqueries == 0) {
			var merged = new HashMap();
			_.each(found, function(elt) {
				var weight = merged.get(''+elt.id) || 0;
				merged.set(''+elt.id,weight+elt.weight);
			});

			/* sort ids by weight */
			var ids = _.sortBy(merged.keys(), function(id) { return -1*merged.get(''+id); });
			/* truncate */
			var pager = new paginate(req);
			ids.length = Math.min(ids.length,pager.perpage);

			find(req.db, pager,
				function(query, qparams) {
					_.each(ids, function(id, index) {
						if (index == 0)
							query+=' WHERE books.id IN (';
						else
							query+=',';
						query+='?';
						qparams.push(id);
					});
					query+=')';
					query = pager.appendInitialQuery(query,'books.sort',qparams,false);
					return query;
				},
				function(books) {
					// TODO no pager res.links(pager.links());
					/* sort by weight */
					res.json(_.sortBy(books, function(book) { return -1*merged.get(''+book.id); }));
				}
			);

		}
	};

	req.db.each('SELECT id FROM books WHERE UPPER(sort) LIKE ?', term,
		function(err, row) { found.push( { id: row.id, weight: 1000 } ); },
		function(err) { output(err); }
	);
	req.db.each('SELECT books_authors_link.book AS id FROM authors'+
		' LEFT OUTER JOIN books_authors_link ON books_authors_link.author = authors.id'+
		' WHERE UPPER(authors.sort) LIKE ?', term,
		function(err, row) { found.push( { id: row.id, weight: 5 } ); },
		function(err) { output(err); }
	);
	req.db.each('SELECT books_series_link.book AS id FROM series'+
		' LEFT OUTER JOIN books_series_link ON books_series_link.series = series.id'+
		' WHERE UPPER(series.sort) LIKE ?', term,
		function(err, row) { found.push( { id: row.id, weight: 100 } ); },
		function(err) { output(err); }
	);
	req.db.each('SELECT book FROM comments WHERE UPPER(text) LIKE ?', term,
		function(err, row) { found.push( { id: row.book, weight: 10 } ); },
		function(err) { output(err); }
	);
});

/* Single book */
router.get('/:id', function(req, res) {
	var book, authors, tags, details;
	var queries = 3;
	if (req.locals.book_details_custom) queries+=req.locals.book_details_custom.length;
	var callback = function() {
		if (queries == 0) {
			book.authors = authors;
			book.tags = tags;
			book.custom = custom;
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
		'series.id AS series_id, publishers.name AS pubname FROM books ' +
		' LEFT OUTER JOIN books_languages_link ON books_languages_link.book = books.id ' +
		' LEFT OUTER JOIN languages ON languages.id = books_languages_link.lang_code ' +
		' LEFT OUTER JOIN data ON data.book = books.id ' +
		' LEFT OUTER JOIN books_series_link ON books.id = books_series_link.book ' +
		' LEFT OUTER JOIN series ON series.id = books_series_link.series ' +
		' LEFT OUTER JOIN books_publishers_link ON books.id = books_publishers_link.book ' +
		' LEFT OUTER JOIN publishers ON publishers.id = books_publishers_link.publisher ' +
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
	// details
	custom = new Array();
	if (req.locals.book_details_custom) {
		_.each(req.locals.book_details_custom, function(detail) {
			req.db.each(detail.query, req.params.id,
				function(err, row) {
					row.name = detail.name;
					row.type = detail.type;
					custom.push(row);
				},
				function(err) {
					if (err) console.log('ERR tags: '+err);
					queries--;
					callback();
				}
			);
		});
	}
});


module.exports = router;
