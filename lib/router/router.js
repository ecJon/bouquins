/**
* TODO license
* Router class.
*/
var util = require('util')
	Endpoint = require('../endpoint/endpoint.js'),
	Outputter = require('../outputter/outputter');

exports = module.exports = Router;
function Router() {
	// constructor
}
Router.prototype = {

	//
	// FUNCTIONS
	//

	/**
	* Build the endpoint for given path.
	* @param path <string> path
	* @param callback <function(error, endpoint)> callback
	*/
	buildEndpoint : function (path, callback) {
		logger.debug('Building endpoint for ' + path);
		// TODO
		callback(null, new Endpoint(path));
	},

	/**
	* Build an outputter for given mime type.
	* @param mime <string> requested mime type.
	* @param callback <function(err)> error callback
	*/
	buildOutputter : function(mime, callback) {
		switch(mime) {
			case 'application/json':
				return new Outputter.JSONOutputter();
			case 'text/html':
				return new Outputter.HtmlOutputter();
			case 'text/plain':
				return new Outputter.TextOutputter();
			default:
				logger.error('Usupported type: '+mime);
				return new Outputter.JSONOutputter();
		}
	},

	/**
	* Listener 'request' event.
	*/
	request: function(req, resp) {
		// req headers available
		// pause stream until action is ready
		req.pause();

		logger.debug('Handling request');

		// build outputter
		var outputter = this.buildOutputter(req.headers.accept, function(err) {
			//TODO error code, terminate resp
		});

		logger.debug('outputter: ' + outputter);

		var url = require('url').parse(req.url, true);
		// TODO sanitize url.pathname
		this.buildEndpoint(url.pathname, function(err, endpoint) {
			//TODO err
			//TODO
			endpoint.buildAction(req.method, url, function(err, action) {
				//TODO err

				// allow outputter to set headers
				outputter.addHeader = function(name, value) {
					if (resp.headersSent) {
						logger.warn('Header already sent, ignoring: ' + name);
					} else {
						resp.setHeader(name, value);
					}
				};

				if (action.withReqData()) {
					// action needs all request data
					// listen data event
					req.on('data', action.reqData);
				}
				// when request data received, prepare action, send headers, exec action
				req.on('end', function() {
					action.prepare(function(err, statusCode, headers){
						//TODO err

						// TODO does it keep outputter headers?
						resp.writeHead(statusCode, headers);

						// wire streaming event
						action.on('data', function(chunk) {
							outputter.output(chunk);
						});
						action.on('end', function() {
							outputter.end();
						});

						// start outputter
						outputter.outputTo(resp);

						// start action
						action.doAction();

					});

				});

				// resume reading request stream
				req.resume();

			});
		});
	}

};
