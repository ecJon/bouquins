
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
					action.loadResource = function(resId, callback) {
						logger.debug('loading author ' + resId);
						// TODO load from db
						callback(null, {
							id: resId,
							name: 'Test test'
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
			if (match.length > 2) {
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
