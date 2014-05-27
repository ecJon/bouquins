var url;
var links;
var cols;
var urlp={};
$('#book').click(function() {
	cols = [ 'title', 'author_sort' ];
});
$('#author').click(function() {
	cols = [ 'name' ];
});
$('#serie').click(function() {
	cols = [ 'name' ];
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
		$('#items').empty();
		var items = [];
		$.each( data, function(i, elt ) {
			var item = "<tr id='" + elt.id + "'>";
			$.each(cols, function(icol, col) {
				item+="<td>"+elt[col]+"</td>";
			});
			item += "</tr>";
			items.push(item);
		});
		$('#items').append(items.join(""));

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
