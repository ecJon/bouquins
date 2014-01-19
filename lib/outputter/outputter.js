/**
 * TODO license
 * Outputter.
 */

/**
 * Outputter class.
 * Abstract (not exported).
 */
function Outputter() {
	//
	// ATTRIBUTES
	//
	/**
	 * Output stream.
	 */
	this.out = null;
};
Outputter.prototype = {
	//
	// FUNCTIONS
	//

	/**
	 * Add header to request.
	 * Available before calling outputTo().
	 */
	addHeader: function (name, value) {},

	/**
	 * Listen action 'data' event.
	 * Receive resource instance to output.
	 */
	output: function (resource) {
		//TODO
	},

	/**
	 * Listen action 'end' event.
	 * End of action data transmission.
	 */
	end: function() {
		logger.debug('Action ended');
		//TODO
		this.out.end();
	},

	/**
	 * Set target stream and start outputting.
	 */
	outputTo: function(stream) {
		this.out = stream;
	}

};

/**
 * Outputter in json format.
 */
var JSONOutputter = function() {
	Outputter.call(this);
	logger.debug('JSON');
};
// inherits Outputter
JSONOutputter.prototype = Object.create(Outputter.prototype, {
});

/**
 * Outputter in html.
 */
var HtmlOutputter = function() {
	Outputter.call(this);
};
// inherits Outputter
HtmlOutputter.prototype = Object.create(Outputter.prototype, {
});

/**
 * Outputter in text.
 */
var TextOutputter = function() {
	Outputter.call(this);
};
// inherits Outputter
TextOutputter.prototype = Object.create(Outputter.prototype, {
});

//module.exports.JSONOutputter = JSONOutputter;
module.exports = {
	JSONOutputter: JSONOutputter,
	TextOutputter: TextOutputter,
	HtmlOutputter: HtmlOutputter
};
