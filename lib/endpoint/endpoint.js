/**
 * Endpoint class.
 */
var Action = require('../action/action.js');

function Endpoint() {
	// constructor
};
Endpoint.prototype = {
	/**
	 * Build an action on resource endpoint.
	 * @param method <string> HTTP method
	 * @param url <url> target URL
	 * @param callback <function(err, action)> callback
	 */
	buildAction : function(method, url, callback) {
		var col = this.targetCollection(url.pathname);
		var action;
		if (col && method == 'POST') {
			//TODO search
		} else if (col && method == 'GET') {
			//TODO list
		} else if (!col && method == 'POST') {
			//TODO edit
		} else if (!col && method == 'GET') {
			action = new Action.ShowAction();
		}
		if (action) {
			this.bind(action, function(err) {
				callback(err, action);
			});
		} else {
			callback(new Error('no action'));
		}
	},

	targetCollection : function(pathname) {
		// TODO
		return false;
	},

	/**
	 * Bind action to endpoint resource.
	 */
	bind : function(action, callback) {
		//TODO
		callback(null, action);
	}
};
exports = module.exports = Endpoint;
