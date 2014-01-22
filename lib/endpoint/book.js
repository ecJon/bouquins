
/**
 * Endpoint book.
 */
var Endpoint = require('./endpoint.js');

function Book() {
	Endpoint.call(this);
	this.bookId = null;
}
Book.prototype =  Object.create(Endpoint.prototype, {

	bind: {
		value: function(action, params, callback) {
			switch (action.name) {
				case 'show':
					action.resId = this.bookId;
					action.getRelated = function(res,relcback){
						var rels = new Array();
						var nbrels = 3; // number of requests for rel
						// call callback when no more requests running
						var endrels = function(err) {
							nbrels--;
							if (err) logger.error(err);
							if (nbrels == 0) relcback(null, rels);
						};
						var raq = 'SELECT * FROM books_authors_link WHERE book = ?';
						db.each(raq, res.id, function (err, row) {
							if (!err && row.author) 
								rels.push({ type: 'author', path: '/author/'+row.author });
						}, endrels);
						var rsq = 'SELECT * FROM books_series_link WHERE book = ?';
						db.each(rsq, res.id, function (err, row) {
							if (!err && row.series) 
								rels.push({ type: 'serie', path: '/serie/'+row.series });
						}, endrels);
						var rtq = 'SELECT * FROM books_tags_link WHERE book = ?';
						db.each(rtq, res.id, function (err, row) {
							if (!err && row.tag) 
								rels.push({ type: 'tag', path: '/tag/'+row.tag });
						}, endrels);
					};
					action.loadResource = function(resId, callback) {
						logger.debug('loading book ' + resId);
						db.get('SELECT * FROM books WHERE id = '+ resId, function(err, row) {
							callback(err, row);
						});
					};
					callback(null, action);
					break;
				case 'list':
					//TODO related
					action.loadResources = function(onload, onend) {
						var query = 'SELECT * FROM books ';
						//TODO factorize
						if (!this.perPage) this.perPage = 30;
						//TODO sanitize
						if (!this.page) this.page = 0;
						query += ' LIMIT ? OFFSET ?';
						db.each(query, this.perPage, this.page*this.perPage, function (err, row) {
							onload(err, row);
						}, function(err) {
							//TODO err
							if (err) logger.error(err);
							onend();
						});
					};
					callback(null, action);
					break;
				default:
					callback(new Error('action not implemented'));
			}
		}, enumerable: true, configurable: true, writable: true 
	},
	targetCollection : {
		value: function(pathname) {
			var match = PATH_RE.exec(pathname);
			logger.debug('pathname ' + pathname + ' => ' + match);
			if (match.length > 2 && match[2]) {
				// TODO check integer
				this.bookId = match[2];
				return false;
			}
			return true;
		}, enumerable: true, configurable: true, writable: true 
	}
});
exports = module.exports = new Book();
