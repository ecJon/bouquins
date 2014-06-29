var url = require('url');

var paginate = function(req) {
  this.perpage = req.query.perpage ? req.query.perpage : 10;
  this.page = Number(req.query.page ? req.query.page : 0);
  this.offset = this.page * this.perpage;
  this.oUrl = url.parse(req.originalUrl, true);
  this.hasNext = false;
  this.initial = req.query.initial;
};

paginate.prototype = {
  links: function() {
	var links = {};
    this.oUrl.search = null;
    if (this.page > 0) {
      this.oUrl.query.page = this.page - 1;
      links.prev = url.format(this.oUrl);
      this.oUrl.query.page = this.page;
    }
	if (this.hasNext) {
      this.oUrl.query.page = this.page + 1;
      links.next = url.format(this.oUrl);
      this.oUrl.query.page = this.page;
	}
	return links;
  },
  /** Append search clause for initial to query */
  appendInitialQuery: function(query, column ,qparams, where) {
	  if (this.initial) {
		  if(where)
			  query+=' WHERE';
		  else
			  query+=' AND';
		  if (this.initial == '0') {
			  query+=' substr('+column+',1,1) < ? OR substr('+column+',1,1) > ?';
			  qparams.push('A');
			  qparams.push('Z');
		  } else {
			  query+=' UPPER('+column+') LIKE ?';
			  qparams.push(this.initial.toUpperCase()+'%');
		  }
	  }
	  return query;
  }
};

module.exports = paginate;
