function ParseNode(n){
	var attr = { "stroke-width": 0, "stroke-opacity": 0, "fill":"#000" };
	var style;
	var shape;
	
	if(n.attributes)
	{
		$.each(n.attributes, function(index, value){
			switch(value.name) {
			  case "stroke-dasharray":
				attr[value.name] = "- ";
			  break;
			  case "stroke-miterlimit":
				attr['stroke-width'] = parseInt(value.value) / 5;
				attr['stroke-opacity'] = 1;
				break;
			  case "stroke-width":
				attr['stroke-width'] = parseInt(value.value);
				attr['stroke-opacity'] = 1;
				break;
			  case "style":
				style = value.value;
			  break;
			  case "x":
			  case "y":
				attr[value.name] = parseFloat(value.value);
				break;
			  case "transform":
				var nums = value.value.replace(/matrix\(/g, " ").replace(/\)/g, " ").split(" ").filter(function(element){
					return element.length > 0;
				});
				var transform = {kx : "1", ky: "1", tx: "0", ty: "0"};
				if(nums.length >= 1)
					transform.kx = nums[0];
				if(nums.length >= 4)
					transform.ky = nums[3];
				if(nums.length >= 5)
					transform.tx = nums[4];
				if(nums.length >= 6)
					transform.ty = nums[5];
				attr['scale'] = transform.kx + ", " + transform.ky;
				attr['translation'] = transform.tx + ", " + transform.ty;
				var x = 0;
				break;
			  default:
				attr[value.name] = value.value;
			  break;
			}
		});
		if(style){
			style.scan(/([a-z\-]+) ?: ?([^ ;]+)[ ;]?/, function(m) {
			  attr[m[1]] = m[2];
			});
		}
	}
	switch(n.nodeName.toLowerCase()) {
	  case "rect":
		shape = paper.rect();
	  break;
	  case "circle":
		shape = paper.circle();
	  break;
	  case "ellipse":
		shape = paper.ellipse();
	  break;
	  case "path":
		shape = paper.path(attr["d"]);
	  break;
	  case "polygon":
		shape = paper.polygon(attr["points"]);
	  break;
	  case "image":
		shape = paper.image(attr["xlink:href"]);
	  break;
	  case "line":
		shape = paper.line(attr['x1'], attr['y1'], attr['x2'], attr['y2']);
	  break;
	  //-F case "text":
	  //-F   shape = paper.text();
	  //-F break;
	}
	
	if(attr["display"] && attr["display"].toLowerCase() == "none")
		shape.hide();
		
	
	if(shape)
		shape.attr(attr);
	
	return shape;
}

function ParseSVG(n, paper, map)
{
	var id = $(n).attr("id");
	var set;
	if(n.childNodes.length > 0)
		set = paper.set();
		
	for(var i = 0; i < n.childNodes.length; ++i)
	{
		var ms = ParseSVG(n.childNodes[i], paper, map);
		if(ms[0])
			set.push(ms[0]);
		map = ms[1];
	}
	if(id && set)
	{
		if(set.length > 0)
			map[id] = set;
	}
	if(set)
	{
		if(!set.length)
			set = null;
		return [set, map];
	}
		
	var shape = ParseNode(n);
	if(id)
		map[id] = shape;
		
	return [shape, map];
}

Raphael.fn.importSVG = function (svg, map) {
	if(svg.childNodes.length == 0)
		throw "Invalid SVG provided";
	
	return ParseSVG(svg, this, map);
};

// extending raphael with a polygon function
Raphael.fn.polygon = function(point_string) {
  var poly_array = ["M"];
  $.each(point_string.split(new RegExp(/[ ,]{1}/g)), function(i, v) {
	if(v.length > 0)
	{
		if (i % 2 == 0 && i > 0) poly_array.push("L");
		poly_array.push(parseFloat(v));
	}
  });
  poly_array.push("Z");
  return this.path(poly_array);
};

Raphael.fn.line = function(x1, y1, x2, y2)
{
	var path = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
	return this.path(path);
};