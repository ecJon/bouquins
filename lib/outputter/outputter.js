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
	this.headers = {};
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
	outputTo: function(headers, stream) {
		this.headers = headers;
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
	logger.debug('HTML');
	// TODO use templates
	this.buffer = new Array();
	this.colStarted = false;
};
// inherits Outputter
HtmlOutputter.prototype = Object.create(Outputter.prototype, {
	output: {
		value: function(resource) {
			var self = this;
			logger.debug('colStarted: '+this.colStarted);
			if (!this.colStarted && this.buffer.length == 0) {
				this.buffer.push(resource);
				this.out.write('<html><head><title>Bouquins</title></head>');
			} else {
				this.buffer.push(resource);
				if (!this.colStarted) {
					this.out.write('<h1>Data</h1><table><tr>');
					this.colStarted = true;
				} else
					this.out.write('</tr>');
				while (this.buffer.length>0) {
					var r = this.buffer.shift();
					Object.keys(r).forEach(function(key) {
						self.out.write('<td title=\"'+key+'\">'+r[key]+'</td>');
					});
					if (this.buffer.length>0)
						this.out.write('</tr><tr>');
				}
			}
		}, enumerable: true, configurable: true, writable: true 
	},
	end: {
		value: function() {
			var self = this;
			if (this.buffer.length == 1) {
				// single resource
				this.out.write('<ul>');
				var r = this.buffer[0];
				Object.keys(r).forEach(function(key) {
					self.out.write('<li>'+key+': '+r[key]+'</li>');
				});
				this.out.write('</ul>');
			}
			if (this.colStarted) {
				//end collection
				this.out.write('</table>');
			}
			// links
			var links = this.headers.Link;
			if (links) {
				this.out.write('<h1>Links</h1><ul>')
				var re = /<([^>]*)>; rel=([^,$]*)/g;
				var match;
				while ((match = re.exec(links)) != null) {
					this.out.write('<li><a href=\"'+match[1]+'\">'+match[2]+'</a></li>');
				}
				this.out.write('</ul>')
			}
			this.out.write('</html>');
			logger.debug('Action ended');
			this.out.end();
		}, enumerable: true, configurable: true, writable: true 
	},
	init: {
		value: function() {
			this.addHeader('Content-Type', 'text/html');
		}, enumerable: true, configurable: true, writable: true 
	}

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
