/**
 * TODO license
 * Basic logger.
 */
var logger = exports;

logger.debugLevel = 'debug';
logger.log = function(level, message) {
	var levels = ['fatal', 'error', 'warn', 'info', 'debug'];
	if (levels.indexOf(level) <= levels.indexOf(logger.debugLevel) ) {
		if (typeof message !== 'string') {
			message = JSON.stringify(message);
		};
		console.log(new Date().toISOString() + ' [' + level+'] '+message);
	}
}
logger.debug = function(message) {
	logger.log('debug', message);
}
logger.info = function(message) {
	logger.log('info', message);
}
logger.error = function(message) {
	logger.log('error', message);
}
logger.fatal = function(message) {
	logger.log('fatal', message);
}
