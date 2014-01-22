
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
		value: function(action, callback) {
			switch (action.name) {
				case 'show':
					action.resId = this.authorId;
					//TODO related
					action.loadResource = function(resId, callback) {
						logger.debug('loading author ' + resId);
						// TODO load from db
						db.get('SELECT * FROM authors WHERE id = '+ resId, function(err, row) {
							callback(err, row);
						});
					};
					callback(null, action);
					break;
				case 'list':
					action.loadResources = function(onload, onend) {
						//TODO load from bdd
						db.each('SELECT * FROM authors LIMIT 30', function (err, row) {
							onload(err, row);
						}, function() {
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
