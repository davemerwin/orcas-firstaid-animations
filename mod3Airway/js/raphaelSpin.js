//taken from http://raphaeljs.com/spin-spin-spin.html
function spinner(r, w, h, colour, R1, R2, count, stroke_width) {
	var sectorsCount = count || 12,
		color = colour || "#fff",
		width = stroke_width || 15,
		r1 = Math.min(R1, R2) || 35,
		r2 = Math.max(R1, R2) || 60,
		cx = w / 2,
		cy = h / 2,
		
		sectors = [],
		opacity = [],
		beta = 2 * Math.PI / sectorsCount,

		pathParams = {stroke: color, "stroke-width": width, "stroke-linecap": "round"};
		var rect = r.rect(0, 0, r.width, r.height).attr({fill:"#000", opacity:.7});
		Raphael.getColor.reset();
	for (var i = 0; i < sectorsCount; i++) {
		var alpha = beta * i - Math.PI / 2,
			cos = Math.cos(alpha),
			sin = Math.sin(alpha);
		opacity[i] = 1 / sectorsCount * i;
		sectors[i] = r.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
		if (color == "rainbow") {
			sectors[i].attr("stroke", Raphael.getColor());
		}
	}
	var tick;
	(function ticker() {
		opacity.unshift(opacity.pop());
		for (var i = 0; i < sectorsCount; i++) {
			sectors[i].attr("opacity", opacity[i]);
		}
		r.safari();
		tick = setTimeout(ticker, 1000 / sectorsCount);
	})();
	return [function (sectors, rect) {
		clearTimeout(tick);
		rect.remove();
		for(var i = 0; i < sectors.length; ++i)
			sectors[i].remove();
	}, sectors, rect];
}
