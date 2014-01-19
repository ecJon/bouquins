/**
 * Config module.
 * TODO license
 */

var config = exports;
/**
 * Loads config from config file
 */
config.loadconfig=function(configfile, callback) {
	require('fs').readFile(
			configfile, {encoding:'utf8'},
			function(err, data) {
				if (err) callback(err);
				try {
					var config = JSON.parse(data);
					callback(null, config);
				} catch (err) {
					callback(err);
				}
			});
};
