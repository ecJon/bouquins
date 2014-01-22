/**
* Action.
*/

var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
* Constructor.
*/
function Action(name) {
	logger.debug('new Action');
	EventEmitter.call(this);
	//
	// ATTRIBUTES
	//
	this.name = name;

	//
	// INIT
	//
};
// injerits EventEmitter
Action.prototype =  Object.create(EventEmitter.prototype, {

	//
	// FUNCTIONS
	//

	/**
	* @return action needs request body data.
	*/
	withReqData: {
		value: function() {
			return false;
		}, 
		enumerable: true, 
		configurable: true, 
		writable: true 
	},

	/**
	* Listen request data event.
	*/
	reqData: {
		value: function(chunk) {
			//TODO
		}, 
		enumerable: true, 
		configurable: true, 
		writable: true 
	},

	/**
	* Prepare action.
	* @param callback (err, statusCode, headers)
	*/
	prepare: {
		value: function(callback) {
			logger.debug('prepare Action');
			// TODO impl per action type
			// default: OK, no headers
			callback(null, 200, {});
		}, 
		enumerable: true, 
		configurable: true, 
		writable: true 
	},

	doAction: {
		value: function(){
			logger.debug('doAction');
			//TODO emit data end events
			this.emit('end');
		}, 
		enumerable: true, 
		configurable: true, 
		writable: true 
	}

});

/**
* Action show single resource.
*/
function ShowAction() {
	logger.debug('new ShowAction');
	Action.call(this, 'show');

	// Resource id.
	this.resId = null;
	// Resource.
	this.res = null;
};
// inherits Action
ShowAction.prototype = Object.create(Action.prototype, {
	/**
	 * Prepare show action.
	 * Headers:
	 *	- Link: related resource.
	 */
	prepare: {
		value: function(callback) {
			var self = this;
			if (this.resId) {
				this.loadResource(this.resId, function(err, res) {
					self.res = res;
					logger.debug('resource loaded: ' + res);
					//TODO err
					var link = '';
					var rels = self.getRelated(res); // { type: 'author', path: '/author/id'}
					logger.debug(rels);
					rels.forEach(function (e) {
						if (link.length > 0) link+=', ';
						link += '<' + config.urlPrefix + e.path + '>; rel=' + e.type;
					});
					var headers = {};
					if (link.length > 0) {
						headers.Link = link;
					}
					callback(null, 200, headers);
				});
			} else {
				//TODO error?
				callback(null, '5OO', {});
			}
		}, enumerable: true, configurable: true, writable: true 
	},
	/**
	 * Load resource.
	 * @param resource id
	 * @param callback <function(err, resource)>
	 */
	loadResource: {
		value: function(resId, callback){
			//implement
			callback(new Error('Cannot load resource ' + resId));
		}, enumerable: true, configurable: true, writable: true 
	},
	/**
	 * Get related resources.
	 * @param res resource 
	 * @return related resources { type: 'author', path: '/author/id'}
	 */
	getRelated: {
		value: function(res){
			return [];
		}, enumerable: true, configurable: true, writable: true 
	},

	doAction: {
		value: function(){
			logger.debug('doAction');
			this.emit('data', this.res);
			this.emit('end');
		}, enumerable: true, configurable: true, writable: true 
	}

});
/**
* Action show list of resources.
*/
function ListAction() {
	logger.debug('new ListAction');
	Action.call(this, 'list');
};
// inherits Action
ListAction.prototype = Object.create(Action.prototype, {
	prepare: {
		value: function(callback) {
			//TODO
			callback(null, 200, {});
		}, enumerable: true, configurable: true, writable: true 
	},
	doAction: {
		value: function() {
			logger.debug('doAction');
			var self = this;
			// TODO parameters
			this.loadResources(function(err, res) {
				// for each loaded resource
				self.emit('data', res);
			}, function(err) {
				self.emit('end');
			});
		}, enumerable: true, configurable: true, writable: true 
	},
	loadResources: {
		value: function(onload, onend) {
			// nothing to load
			onend(null);
		}, enumerable: true, configurable: true, writable: true 
	}
});

module.exports = {
	ShowAction: ShowAction,
	ListAction: ListAction
};
