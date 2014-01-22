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
	 * Init before outputing.
	 */
	init: function () {},
	/**
	 * Listen action 'data' event.
	 * Receive resource instance to output.
	 */
	output: function (resource) { },

	/**
	 * Listen action 'end' event.
	 * End of action data transmission.
	 */
	end: function() {
		logger.debug('Action ended');
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
	this.buffer = new Array();
	this.colStarted = false;
};
// inherits Outputter
JSONOutputter.prototype = Object.create(Outputter.prototype, {
	output: {
		value: function(resource) {
			logger.debug('ressource: '+JSON.stringify(this.buffer));
			logger.debug('colStarted: '+this.colStarted);
			if (!this.colStarted && this.buffer.length == 0)
				this.buffer.push(resource);
			else {
				this.buffer.push(resource);
				if (!this.colStarted) {
					this.out.write('[');
					this.colStarted = true;
				} else
					this.out.write(',');
				while (this.buffer.length>0) {
					var r = this.buffer.shift();
					this.out.write(JSON.stringify(r));
					if (this.buffer.length>0)
						this.out.write(',');
				}
			}
		}, enumerable: true, configurable: true, writable: true 
	},
	end: {
		value: function() {
			if (this.buffer.length == 1) {
				// single resource
				this.out.write(JSON.stringify(this.buffer[0]));
			}
			if (this.colStarted) {
				//end collection
				this.out.write(']');
			}
			logger.debug('Action ended');
			this.out.end();
		}, enumerable: true, configurable: true, writable: true 
	},
	init: {
		value: function() {
			this.addHeader('Content-Type', 'application/json');
		}, enumerable: true, configurable: true, writable: true 
	}
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
