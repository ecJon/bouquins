
/**
 * Endpoint author.
 */
var Endpoint = require('./endpoint.js');

function Author() {
	Endpoint.call(this);
	this.authorId = null;
}
Author.prototype =  Object.create(Endpoint.prototype, {

	bind: {
		value: function(action, params, callback) {
			switch (action.name) {
				case 'show':
					action.resId = this.authorId;
					action.getRelated = function(res, relcback){
						// books of this autor
						// TODO authors writing same book
						relcback(null, new Array({ type: 'books', path: '/books?author='+this.resId }));
					};
					action.loadResource = function(resId, loadcback) {
						logger.debug('loading author ' + resId);
						db.get('SELECT * FROM authors WHERE id = '+ resId, function(err, row) {
							loadcback(err, row);
						});
					};
					callback(null, action);
					break;
				case 'list':
					//TODO related
					action.loadResources = function(onload, onend) {
						var query = 'SELECT * FROM authors ';
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
		},
		enumerable: true, 
		configurable: true, 
		writable: true 
	},
	targetCollection : {
		value: function(pathname) {
			var match = PATH_RE.exec(pathname);
			logger.debug('pathname ' + pathname + ' => ' + match);
			if (match.length > 2 && match[2]) {
				// TODO check integer
				this.authorId = match[2];
				return false;
			}
			return true;
		},
		enumerable: true, 
		configurable: true, 
		writable: true 
	}
});
exports = module.exports = new Author();
