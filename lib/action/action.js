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
};
// inherits Action
ShowAction.prototype = Object.create(Action.prototype);

module.exports = {
	ShowAction: ShowAction
};
