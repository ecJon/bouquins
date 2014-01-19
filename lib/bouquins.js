/**
 * TODO license
 * Bouquins module.
 */

var config = require('./util/config'),
	logger = require('./util/logger'),
	Router =  require('./router/router'),
	bouquins = exports;

var router = null;
/**
 * Load config file.
 */
bouquins.loadconfig = function(configfile, callback) {
	 config.loadconfig(configfile, callback);
};
/**
 * Init logger.
 */
bouquins.initLogger = function() {
	if (config.debugLevel) {
		logger.debugLevel = config.debugLevel;
	}
	return logger;
}
/**
 * Make main router.
 */
bouquins.makeRouter = function() {
	if (!router) {
		router = new Router();
	}
	return router;
}
