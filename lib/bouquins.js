/**
 * TODO license
 * Bouquins module.
 */
GLOBAL.PATH_RE=/\/([a-zA-Z0-9]+)(?:\/|$)([a-zA-Z0-9]+)?/;

var Config = require('./util/config'),
	logger = require('./util/logger'),
	Router =  require('./router/router'),
	sqlite3 = require('sqlite3').verbose(),
	bouquins = exports;

var router = null;
/**
 * Load config file.
 */
bouquins.loadconfig = function(configfile, callback) {
	 Config.loadconfig(configfile, callback);
};
/**
 * Init logger.
 */
bouquins.initLogger = function() {
	if (config.debugLevel) {
		logger.debugLevel = config.debugLevel;
	}
	return logger;
};
/**
 * Init database.
 */
bouquins.initDB = function(callback) {
	logger.debug('Database: '+config.dbfile);
	GLOBAL.db = new sqlite3.Database(config.dbfile, callback);
};
/**
 * Make main router.
 */
bouquins.makeRouter = function() {
	if (!router) {
		router = new Router();
	}
	return router;
};
