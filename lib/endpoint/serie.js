
/**
 * Endpoint serie.
 */
var Endpoint = require('./endpoint.js');

function Serie() {
	Endpoint.call(this);
	this.serieId = null;
}
Serie.prototype =  Object.create(Endpoint.prototype, {

	bind: {
		value: function(action, params, callback) {
			switch (action.name) {
				case 'show':
					action.resId = this.serieId;
					action.getRelated = function(res,relcback){
						var rels = new Array();
						var nbrels = 2; // number of requests for rel
						// call callback when no more requests running
						var endrels = function(err) {
							nbrels--;
							if (err) logger.error(err);
							if (nbrels == 0) relcback(null, rels);
						};
						// author
						var raq = 'SELECT DISTINCT author FROM books_series_link AS bsl, books_authors_link AS bal WHERE bsl.book = bal.book AND bsl.series = ?';
						db.each(raq, res.id, function (err, row) {
							if (!err && row.author) 
								rels.push({ type: 'author', path: '/author/'+row.author });
						}, endrels);
						// books
						var rbq = 'SELECT * FROM books_series_link WHERE series = ?';
						db.each(rbq, res.id, function (err, row) {
							if (!err && row.book) 
								rels.push({ type: 'book', path: '/book/'+row.book });
						}, endrels);
					};
					action.loadResource = function(resId, callback) {
						logger.debug('loading serie ' + resId);
						db.get('SELECT * FROM series WHERE id = '+ resId, function(err, row) {
							callback(err, row);
						});
					};
					callback(null, action);
					break;
				case 'list':
					//TODO related
					action.loadResources = function(onload, onend) {
						var query = 'SELECT * FROM series ';
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
				this.serieId = match[2];
				return false;
			}
			return true;
		}, enumerable: true, configurable: true, writable: true 
	}
});
exports = module.exports = new Serie();
