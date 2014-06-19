var url;
var links;
var cols;
var headers;
var urlp={};
function link(content, href, glyph) {
	var link="";
	if (content) {
		if (glyph) link+="<span class=\"glyphicon "+glyph+"\"></span>&nbsp;";
		link += "<a href=\""+href+"\">";
		link+=content+"</a>";
	}
	return link;
}
$('#book').click(function() {
	headers = ['Titre', 'Auteur(s)', 'Serie'];
	cols = [
		function(elt) {
			return link(elt.title, '/book/'+elt.id, 'glyphicon-book');
		}, function(elt) {
			var links="";
			if (Array.isArray(elt.authors)) {
				$.each(elt.authors, function(ida, author) {
					links+=link(author.name, '/author/'+author.id,'glyphicon-user');
				});
			}
			return links;
		}, function(elt) {
			return link(elt.series_name, '/serie/'+elt.id, 'glyphicon-list');
		}
	];
});
$('#author').click(function() {
	headers = ['Nom', 'Livres'];
	cols = [ function(elt){
		return link(elt.name, '/author/'+elt.id,'glyphicon-user');
	}, function(elt) { return elt.count; } ];
});
$('#serie').click(function() {
	headers = ['Nom', 'Auteur(s)', 'Livres'];
	cols = [
		function(elt) {
			return link(elt.name, '/serie/'+elt.id, 'glyphicon-list');
		}, function(elt) {
			var links="";
			if (Array.isArray(elt.authors)) {
				$.each(elt.authors, function(ida, author) {
					links+=link(author.name, '/author/'+author.id,'glyphicon-user');
				});
			}
			return links;
		}, function(elt) {
			return elt.count;
		}
	];
});
$.each(['book','author','serie'], function (i, elt) {
	$('#'+elt).click(function() {
		url = '/'+elt;
		loadItems();
	});
});
$.each(['prev','next'], function (i, elt) {
	$('#'+elt).click(function() {
		var parsed = $.url(links[elt]);
		url = parsed.attr('path');
		urlp = parsed.param();
		loadItems();
	});
});
$(".perpage").click(function() {
	urlp.perpage = $(this).attr("value");
	urlp.page = 0;
	loadItems();
});

function loadItems() {
	$.getJSON( url, urlp, function( data, textStatus, xhr ) {
		var items = $('#items');
		items.empty();
		var item = "<tr>";
		$.each(headers, function(ih, h) {
			item+="<th>"+h+"</th>";
		});
		item += "</tr>";
		items.append(item);
		$.each( data, function(i, elt ) {
			var item = "<tr id='" + elt.id + "'>";
			$.each(cols, function(icol, col) {
				item+="<td>"+col(elt)+"</td>";
			});
			item += "</tr>";
			items.append(item);
		});

		var linkHeader = xhr.getResponseHeader('link');
		links = parse_link_header(linkHeader);
		$.each(['prev','next'], function (i, elt) {
			var btn = $('#'+elt);
			if (links[elt]) {
				btn.parent().removeClass('disabled');
			} else {
				btn.parent().addClass('disabled');
			}
		});
	});
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
