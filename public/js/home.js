var ItemsCol = function(id, headers, cols) {
	this.id = id;
	this.url= '/'+id;
	this.headers = headers;//table headers
	this.cols = cols;//cell rendering functions
};
$.extend(ItemsCol.prototype,{
	data: null, // loaded items
	bind: function() {
		var self = this;
		$('#'+this.id) .click(function() {
			toggleActive(this);
			home.pagination.page=0;
			self.load();
		});
	},
	load: function(addparam) {
		var self = this;
		$.getJSON( this.url, $.extend({}, home.pagination, addparam),
			function( data, textStatus, xhr ) {
				self.data = data;
				home.current = self;
				home.update();
				var linkHeader = xhr.getResponseHeader('link');
				home.updatePager(parse_link_header(linkHeader));
		});
	},
	renderRow: function(elt) {
		var item = "<tr id='" + elt.id + "'>";
		$.each(this.cols, function(icol, col) {
			item+="<td>"+col(elt)+"</td>";
		});
		item += "</tr>";
		return item;
	},
});
var HomePage = function() {
	this.books= new ItemsCol('book', [$.t('bouquins.cols.booktitle'), $.t('bouquins.cols.bookauthors'), $.t('bouquins.cols.bookserie')], [
		function(elt) {
			return link(elt.title, '/book/'+elt.id, 'glyphicon-book');
		},
		function(elt) {
			var links='';
			if (Array.isArray(elt.authors)) {
				$.each(elt.authors, function(ida, author) {
					links+=link(author.name, '/author/'+author.id,'glyphicon-user');
				});
			}
			return links;
		},
		function(elt) {
			var content = elt.series_name == null ? '' : elt.series_name + '(' + elt.series_index + ')';
			return link(content, '/serie/'+elt.series_id, 'glyphicon-list');
		}
	]);
	this.authors= new ItemsCol('author', [$.t('bouquins.cols.authorname'), $.t('bouquins.cols.authorbooks')], [
		function(elt){ return link(elt.name, '/author/'+elt.id,'glyphicon-user'); },
		function(elt) { return elt.count; }
	]);
	this.series= new ItemsCol('serie', [$.t('bouquins.cols.seriename'), $.t('bouquins.cols.serieauthors'), $.t('bouquins.cols.seriebooks')], [
		function(elt) { return link(elt.name, '/serie/'+elt.id, 'glyphicon-list'); },
		function(elt) {
			var links='';
			if (Array.isArray(elt.authors)) {
				$.each(elt.authors, function(ida, author) {
					links+=link(author.name, '/author/'+author.id,'glyphicon-user');
				});
			}
			return links;
		},
		function(elt) { return elt.count; }
	]);
	this.pagination= {
		perpage: 10,
		page: 0,
	};
	this.table = $('#items');
	// bind buttons events
	$.each([this.books,this.authors,this.series], function(ind, itemsCol) {
		itemsCol.bind();
	});
	$('#recent').click(function() {
		home.pagination.page=0;
		home.books.load({sort:'recent'});
		toggleActive(this);
	});
	$(".perpage").click(function() {
		home.pagination.perpage = $(this).attr("value");
		$('.perpage').removeClass('active');
		$(this).addClass('active');
		home.pagination.page = 0;
		if (home.current)
			home.current.load();
	});
	$(".initial").click(function() {
		if ($(this).hasClass('active')) {
			home.pagination.initial = null;
			$('.initial').removeClass('active');
		} else {
			home.pagination.initial = $(this).attr("value");
			$('.initial').removeClass('active');
			$(this).addClass('active');
		}
		home.pagination.page = 0;
		if (home.current)
			home.current.load();
	});
	$.each([this.authors,this.books,this.series],function(i,itemsCol) {
		if (window.location.hash == '#'+itemsCol.id+'s')
			itemsCol.load();
	});
};
$.extend(HomePage.prototype,{
	current: null,
	table: null,
	displayHeaders: function(headers) {
		var row = "<tr>";
		$.each(headers, function(ih, h) {
			row+="<th>"+h+"</th>";
		});
		row += "</tr>";
		this.table.append(row);
	},
	addRow: function(elt) {
		var row = this.current.renderRow(elt);
		this.table.append(row);
	},
	update: function() {
		this.table.empty();
		if (this.current) {
			$('#itemsanchor').attr('name',this.current.id+'s');
			$('#blkitems').removeClass('hidden');
			this.displayHeaders(this.current.headers);
			var self = this;
			$.each(this.current.data, function(ind, elt) {
				self.addRow(elt);
			});
		} else {
			$('#blkitems').addClass('hidden');
			$('#itemsanchor').attr('name',null);
		}
	},
	updatePager: function(links) {
		$.each(['prev','next'], function (i, elt) {
			var btn = $('.'+elt);
			if (links[elt]) {
				btn.parent().removeClass('disabled');
			} else {
				btn.parent().addClass('disabled');
			}
			btn.unbind();
			btn.click(function() {
				var parsed = $.url(links[elt]);
				var urlp = parsed.param();
				home.pagination.page = urlp.page;
				home.pagination.perpage = urlp.perpage;
				home.current.load();
			});
		});
	},
});
/**
 * Make link.
 */
function link(content, href, glyph) {
	var link="";
	if (content) {
		if (glyph) link+="<span class=\"glyphicon "+glyph+"\"></span>&nbsp;";
		link += "<a href=\""+href+"\">";
		link+=content+"</a>";
	}
	return link;
}
/**
 * Toggle Active buttons.
 */
function toggleActive(btn) {
	$(btn).siblings().removeClass('active');
	$(btn).addClass('active');
}
/*
* parse_link_header()
*
* Parse the Github Link HTTP header used for pageination
* http://developer.github.com/v3/#pagination
*/
function parse_link_header(header) {
	if (header.length == 0) {
		throw new Error("input must not be of zero length");
	}
 
	// Split parts by comma
	var parts = header.split(',');
	var links = {};
	// Parse each part into a named link
	$.each(parts, function(i, p) {
		var section = p.split(';');
		if (section.length != 2) {
			throw new Error("section could not be split on ';'");
		}
		var url = section[0].replace(/<(.*)>/, '$1').trim();
		var name = section[1].replace(/rel="(.*)"/, '$1').trim();
		links[name] = url;
	});

	return links;
}
