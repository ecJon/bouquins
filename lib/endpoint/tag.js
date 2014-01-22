/**
 * Endpoint tag.
 */
var Endpoint = require('./endpoint.js');

function Tag() {
	Endpoint.call(this);
	this.tagId = null;
}
Tag.prototype =  Object.create(Endpoint.prototype, {

	bind: {
		value: function(action, params, callback) {
			switch (action.name) {
				case 'show':
					action.resId = this.tagId;
					action.loadResource = function(resId, callback) {
						logger.debug('loading tag ' + resId);
						db.get('SELECT * FROM tags WHERE id = '+ resId, function(err, row) {
							callback(err, row);
						});
					};
					callback(null, action);
					break;
				case 'list':
					action.loadResources = function(onload, onend) {
						var query = 'SELECT * FROM tags ';
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
				this.tagId = match[2];
				return false;
			}
			return true;
		}, enumerable: true, configurable: true, writable: true 
	}
});
exports = module.exports = new Tag();
