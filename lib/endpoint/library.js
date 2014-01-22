/**
 * Endpoint library.
 */
var Endpoint = require('./endpoint.js');
function Library() {
	Endpoint.call(this);
}
Library.prototype =  Object.create(Endpoint.prototype, {

	bind: {
		value: function(action, params, callback) {
			if (action.name == 'show') {
				action.resId = 'library';
				action.loadResource = function(resId, callback) {
					//TODO load from db
					callback(null, {
						name: 'Bibliothèque Meutel'
					});
				};
				action.getRelated = function(res, relcback){
					relcback(null, new Array(
						// authors list
						{ type: 'authors', path: '/author/' },
						// books list
						{ type: 'books', path: '/books/' },
						// tags list
						{ type: 'tags', path: '/tags/' },
						// series list
						{ type: 'series', path: '/series/' },
						// user favorites
						{ type: 'favorites', path:'/favorites/'}
					));
				};
			}
			callback(null, action);
		}, 
		enumerable: true, 
		configurable: true, 
		writable: true 
	},


});
exports = module.exports = new Library();
