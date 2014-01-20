/**
 * Endpoint library.
 */
var Endpoint = require('./endpoint.js');
function Library() {
	Endpoint.call(this);
}
Library.prototype =  Object.create(Endpoint.prototype, {
});
exports = module.exports = new Library();
