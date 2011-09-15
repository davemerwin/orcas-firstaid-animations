var themeColorCircle = "#001783";
var themeColorHighlight = "#005A78";
var audioControllerColor = "#3B3939";
//var audio = $('#audio audio').get(0);

var GetCoord = function(q, e)
{
    return new Coord(e.pageX - q.position().left, e.pageY - q.position().top);
};

//taken from http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
function GetUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//Convert SVG array from relative to absolute coordinates relative to "rel = (x,y)"
function ConvertToAbsolute(rel, row)
{
	var res = [];
	
	//If the identifier is already capitalized, then it is already row absolute coordinates
	if(typeof(row[0]) == "string" && row[0].toUpperCase() == row[0])
		return row;
	
	for(var i = 0; i < row.length; ++i)
	{
		if(typeof(row[i]) == "string")
			res.push(row[i].toUpperCase());  //Use absolute coordinate conventions
		else if(typeof(row[i]) == "number")
			res.push(row[i] + rel[(i + 1) % 2]);
	}
	
	return res;
}

function ConvertSmoothToCurve(p, i)
{
	pb = p[i - 1];
	pn = p[i];
	
	var dx = pb[pb.length - 4] - pb[pb.length - 2];
	var dy = pb[pb.length - 3] - pb[pb.length - 1];
	
	var res = [];
	res[0] = (pn[0] == "S" ? "C" : "c");
	res[1] = pb[pb.length - 2] - dx;
	res[2] = pb[pb.length - 1] - dy;
	res[3] = pn[1];
	res[4] = pn[2];
	res[5] = pn[3];
	res[6] = pn[4];
	return res;
}

//Convert entire path array to absolute coordinates.  Using weird relative coordinate interpretation where it's always relative to the last
//set of coordinates of the object before it
function ConvertPathToAbsolute(p)
{
	var res = [];
	var rel = [0, 0];
	
	for(var i = 0; i < p.length; ++i)
	{
		res.push(ConvertToAbsolute(rel, p[i]));
		rel[0] = res[i][res[i].length - 2];  //Absolute coordinates are now relative to the last set of coordinates of this feature
		rel[1] = res[i][res[i].length - 1];
	}
	
	return res;
}

function SerializePathArray(data)
{
	var result = "";
	for(var i = 0; i < data.length; ++i)
	{
		if(data[i].length > 0)
			result += data[i][0] + " ";
		for(var j = 1; j < data[i].length; ++j)
		{
			result += data[i][j] + " ";
		}
	}
	
	return result;
}

function SerializePath(path)
{
	var data = path.attr('path');
	if(typeof(data) == "string")
		return data;
		
	return SerializePathArray(data);
}

function Button(clickFunc, label, posX, posY)
{
	var set = paper.set();
	var circle = paper.circle(posX, posY, 55).attr({fill:themeColorCircle, stroke:"#000000", "stroke-width":3});
	set.push(circle);
	var text = paper.text(posX, posY, label).attr({"font-size":20, "font-weight":"bold", "font-family":"Lucida Sans Unicode, Lucida Grande", fill:"#FFF"});
	set.push(text);
	set.mouseover(function(e){
		circle.attr("r", 60);
	});
	set.mouseout(function(e){
		circle.attr("r", 55);
	});
	
	set.click(function(e){
		this.remove();
		text.remove();
		circle.remove();
		clickFunc();
	});
}

function ContinueButton(clickFunc)
{
	var width = $('#canvas').width();
	var height = $('#canvas').height();
	var rect = paper.rect(0, 0, width, height).attr({fill:"#000", opacity:.7});
	var func = function(e){
		rect.remove();
		clickFunc();
	};
	Button(func, "Continue", width / 2, height / 2);
}

function Scale(object, scaleX, scaleY, x, y, time, after)
{
	if(0)
	{
		if(after)
			object.animate({scale:"" + scaleX + ", " + scaleY + ", " + x + ", " + y}, time, after);
		else
			object.animate({scale:"" + scaleX + ", " + scaleY + ", " + x + ", " + y}, time);
	}
	else
	{
		object.scale(scaleX, scaleY, x, y);
		if(after)
			setTimeout(after, time);
	}
}

function Translate(object, dx, dy, time, after, force)
{
	if($.browser.msie && !force)
	{
		object.translate(dx, dy);
		if(after)
			setTimeout(after, time);
	}
	else
	{
		if(after)
			object.animate({translation:"" + dx + ", " + dy}, time, after);
		else
			object.animate({translation:"" + dx + ", " + dy}, time);
	}
}

function TranslateTo(object, src, target, time, after, force)
{
	Translate(object, target.attrs.x + target.attrs.width / 2 - (src.attrs.x + src.attrs.width / 2),
	target.attrs.y + target.attrs.height / 2 - (src.attrs.y + src.attrs.height / 2), time, after, force);
}

function Audio(file)
{
	if(debug)
		return "mod3/Audio/debug.mp3";
	else
		return file;
}

function DoneScreen(message, continueFunc, retryFunc, audio)
{

	$.ajax({
		url: 'modalMod.xml',
		type: 'GET',
		dataType: 'html',
		context: document.body,
		success: function(data){
			var width = $('#canvas').width();
			var height = $('#canvas').height();
			var rect = paper.rect(0, 0, width, height).attr({fill:"#000", opacity:.7});
			$(this).append(data);
			$('#modal').css({
				"position":"fixed",
				"top": "75px",
				"left": "50%",
				"margin-left":"-200px",
			});
			$('#modal p').text(message);
			
			$('#jPlayer').jPlayer("stop");
			if(audio)
			{	
				$('#jPlayer').jPlayer("setMedia", {
					 mp3:Audio(audio),
					 ogg:Audio(audio)
				}).jPlayer("play");
			}
			
			$('#retry').click(function(e){
				$('#modal').remove();
				rect.remove();
				retryFunc();
			});
			$('#continue').click(function(e){
				$('#modal').remove();
				rect.remove();
				continueFunc();
			});
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}	
	});
}

function Clamp(n, l, h)
{
	if(l <= n && n <= h)
		return n;
	if(n < l)
		return l;
	if(n > h)
		return h;
}

function LerpNumbers(n1, n2, t, clamp)
{
	if(clamp)
		t = Clamp(t, 0, 1);
	return t * n2 + (1 - t) * n1;
}

function OutputPath(path)
{
	$.each(path, function(i, v){
		var string = "";
		$.each(v, function(i, v){
			string += v + " ";
		});
		
		console.log(string);
	});
}

function LerpPaths(p1, p2, t)
{
	if(p1.length != p2.length)
		throw "Can't lerp paths.  Different lengths.";
		
	p1 = ConvertPathToAbsolute(p1);
	p2 = ConvertPathToAbsolute(p2);
		
	var res = [];
	
	for(var i = 0; i < p1.length; ++i)
	{
		if(p1[i].length != p2[i].length)
		{
			//try and convert curve to smooth
			if(p1[i][0].toUpperCase() == "S")
				p1[i] = ConvertSmoothToCurve(p1, i);
			else if(p2[i][0].toUpperCase() == "S")
				p2[i] = ConvertSmoothToCurve(p2, i);
				
			if(p1[i].length != p2[i].length)
				throw "Can't lerp paths.  Different lengths";
		}
			
		res.push([]);
			
		for(var j = 0; j < p1[i].length; ++j)
		{
			if(typeof(p1[i][j]) != typeof(p2[i][j]))
				throw "Can't lerp paths.  Different coordinate types.";
				
			if(typeof(p1[i][j]) != "number")
			{
				if(p1[i][j] != p2[i][j])
					throw "Can't lerp paths.  Different coordinate types.";
					
				res[res.length - 1].push(p1[i][j]);
			}
			else
			{
				res[res.length - 1].push(LerpNumbers(p1[i][j], p2[i][j], t));
			}		
		}
	}
	
	return res;
}

function StringToPath(path)
{
	if(typeof(path) == "string")
	{
		var res = Raphael.parsePathString(path);
		return res;
	}
	return path;
}

function SetPathData(p, data)
{
	if(typeof(p.attrs.path) == typeof(data))
		p.attr({path:data});
	else if(typeof(p.attrs.path) == "string")
		p.attr({path: SerializePathArray(data)});
	else
		p.attr({path: StringToPath(data)});
}

function HexToRgb(hex)
{
	hex = hex.replace("#", "");
	hex = parseInt(hex, 16);
	var rgb = [];
	rgb.push((hex & (255 << 16)) >> 16);
	rgb.push((hex & (255 << 8)) >> 8);
	rgb.push((hex & 255));
	return rgb; 
}

//Taken from http://www.linuxtopia.org/online_books/javascript_guides/javascript_faq/rgbtohex.htm
function ToHex(N)
{
	 if (N==null) 
		return "00";
	 N = parseInt(N); 
	 if (N==0 || isNaN(N)) 
		return "00";
	 N = Clamp(N, 0, 255);
	 N = Math.round(N);
	 return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
}

function RgbToHex(rgb)
{
	return "#" + ToHex(rgb[0]) + ToHex(rgb[1]) + ToHex(rgb[2]);
}

function LerpColors(c1, c2, t)
{
	if(typeof(c1) == "string")
		c1 = HexToRgb(c1);
	if(typeof(c2) == "string")
		c2 = HexToRgb(c2);
		
	var res = [0, 0, 0];
	
	res[0] = LerpNumbers(c1[0], c2[0], t, true);
	res[1] = LerpNumbers(c1[1], c2[1], t, true);
	res[2] = LerpNumbers(c1[2], c2[2], t, true);
	
	return RgbToHex(res);
}

function AnimateOpacity(object, time)
{
	object.animate({
		"30%":{opacity:1},
		"80%":{opacity:1},
		"100%":{opacity:0},
	}, time);
}

function AnimateOpacityDown(object, time)
{
	object.attr({opacity:1});
	object.animate({opacity:1}, time - 500, function(){
		this.animate({opacity:0}, 500);
	});
}

//Function meant to make it easy to trigger events in the timing of the audio
function TimeUpdate(event)
{
	context.paused = event.jPlayer.status.paused;
	context.playedPercent = event.jPlayer.status.currentPercentAbsolute;
	if(!context.timeUpdates)
		return;
		
	var curr = event.jPlayer.status.currentTime;
	
	var e;
		
	//Find closest time to current
	for(var i = 0; i < context.timeUpdates.length; ++i)
	{
		if(Math.abs(curr - context.timeUpdates[i].t) < 1 && !context.timeUpdates[i].done)
		{
			e = context.timeUpdates[i];
			break;
		}
	}
	
	if(e)
	{
		e.done = true;
		e.action();
	}
}

function PlaceCircle(object, r, cursor)
{
	var set = paper.set();
	set.push(paper.circle(object.attrs.x + object.attrs.width / 2, object.attrs.y + object.attrs.height / 2, r).attr({opacity:.7}));
	if(cursor)
		set.push(paper.image("mod3/Cursor.png", object.attrs.x + object.attrs.width / 2, object.attrs.y + object.attrs.height / 2, 22, 21));
	return set;
}

function DepthGlow(object)
{
	object.animate({
		"30%":{stroke:"#F00", "stroke-width": 4},
		"80%":{stroke:"#F00", "stroke-width": 4},
		"100%":{stroke:"#001783", "stroke-width": 1},
	}, 4000);
}

function HandGlow(object, target, drag, addTo)
{
	//object.animate({
		//"30%":{opacity: 1},
		//"80%":{opacity: 1},
		//"100%":{opacity: 0},
	//}, 4000);
	//AnimateOpacityDown(object, 4000);
	
	var circle = PlaceCircle(target, 15, true).attr({fill:themeColorCircle, "stroke-opacity":0});
	circle.animate({"stroke-opacity":0}, 3500, function(){
		circle.animate({opacity:0}, 500);
	});
	
	if(drag && drag.move && drag.start && drag.up)
		circle.drag(drag.move, drag.start, drag.up);
		
	if(addTo)
		addTo.push(circle);
}

function CleanExpiredTimers()
{
	var time = new Date().getTime();
	for(var i = context.timers.length - 1; i >= 0; --i)
	{
		var timer = context.timers[i];
		if(time > timer.t + timer.total && !timer.paused)
			context.timers.splice(i, 1);
	}
}

function SetTimeout(f, t)
{
	var timer = {t: 0, timer: null, total: 0, f: null, id: 0, paused: false};
	timer.t = new Date().getTime();
	timer.timer = context.pause.isPaused ? null : setTimeout(f, t);
	timer.total = t;
	timer.f = f;
	timer.id = new Date().getTime();
	timer.paused = context.pause.isPaused;
	context.timers.push(timer);
	CleanExpiredTimers();
	return timer.id;
}

function ClearTimeout(t)
{
	for(var i = 0; i < context.timers.length; ++i)
	{
		if(context.timers[i].id == t)
		{
			clearTimeout(context.timers[i].timer);
			context.timers.splice(i, 1);
		}
	}
	CleanExpiredTimers();
}

function SetInterval(f, t)
{
	var interval = {interval: null, f: null, id: 0, paused: false};
	interval.interval = context.pause.isPaused ? null : setInterval(f, t);
	interval.f = f;
	interval.id = new Date().getTime();
	interval.paused = context.pause.isPaused;
	context.intervals.push(interval);
	CleanExpiredTimers();
	return interval.id;
}

function ClearInterval(t)
{
	for(var i = 0; i < context.intervals.length; ++i)
	{
		if(context.intervals[i].id == t)
		{
			clearInterval(context.intervals[i].interval);
			context.intervals.splice(i, 1);
		}
	}
	CleanExpiredTimers();
}

function PlayHandler()
{
	if(context.pauseRect)
		context.pauseRect.remove();
		
	$('#jPlayer').jPlayer("play");
	
	var time = new Date().getTime();
	CleanExpiredTimers();
	
	if(context.pause.isPaused)
	{
		context.pause.isPaused = false;
		context.pause.play = time;
		for(var i = 0; i < context.timers.length; ++i)
		{
			var timer = context.timers[i];
			if(timer.total > 0 && timer.f && timer.paused)
			{
				timer.timer = setTimeout(timer.f, timer.total);
				timer.t = time;
				timer.paused = false;
			}
		}
		for(var i = 0; i < context.intervals.length; ++i)
		{
			var interval = context.intervals[i];
			if(interval.f && interval.paused)
			{
				interval.interval = setInterval(interval.f, interval.total);
				interval.paused = false;
			}
		}
		slinkAway();
	}
}

function PauseHandler()
{
	if(!context.pause.isPaused)
	{
		context.pause.isPaused = true;
		var w = $('#canvas').width();
		var h = $('#canvas').height();
		context.pauseRect = paper.rect(0, 0, w, h).attr({fill:"#000", opacity: 0.7});
		//map['PlayerControls'].toFront();
		
		$('#jPlayer').jPlayer("pause");
		CleanExpiredTimers();
		for(var i = 0; i < context.timers.length; ++i)
		{
			var timer = context.timers[i];
			if(timer.timer && !timer.paused)
			{
				clearTimeout(timer.timer);
				var dt = new Date().getTime() - timer.t;
				timer.total -= dt;
				timer.t = new Date().getTime();
				timer.paused = true;
			}
		}
		for(var i = 0; i < context.intervals.length; ++i)
		{
			var interval = context.intervals[i];
			if(interval.interval && !interval.paused)
			{
				clearInterval(interval.interval);
				interval.paused = true;
			}
		}

		snapTo();
	}
}

function ToggleMuteHandler()
{
	if(context.isMuted)
	{
		context.isMuted = false;
		$('#jPlayer').jPlayer("unmute");
		$('#mute').removeClass();
		map['SoundWaves'].attr({opacity:0});
	}
	else
	{
		context.isMuted = true;
		$('#jPlayer').jPlayer("mute");
		$('#mute').addClass('muted');
		map['SoundWaves'].attr({opacity:1});
	}
	CleanExpiredTimers();
}

var playerControlColor = "#3B3939";
var slinkTime = 2000;
var snapTime = 300;
var snapTo = function(){
	//var ty = $('#canvas').height() - 30;
	//var toGo = map['PlayerRect'].attrs.y - ty;
	//var total = $('#canvas').height() + 1 - ty;
	//var dxy = "0, " + (ty - map['PlayerRect'].attrs.y);
	//map['PlayerControls'].stop();
	//map['PlayerControls'].animate({translation: dxy}, snapTime * (toGo / total));
	if(context.hider)
	{
		ClearTimeout(context.hider);
		context.hider = null;
	}
	//map['PlayerControls'].show();
		
};
var slinkAway = function(){
	//if(!context.pause || !context.pause.isPaused)
	//{
		//var ty = $('#canvas').height() - 30;
		//var toGo = $('#canvas').height() + 1 - map['PlayerRect'].attrs.y;
		//var total = $('#canvas').height() + 1 - ty;
		//var dxy = "0, " + toGo;
		//map['PlayerControls'].stop();
		//map['PlayerControls'].animate({translation: dxy}, (toGo / total) * slinkTime); 
	//}
	
	/*var hideIt = function(){
		if(map['PlayerControls'])
			map['PlayerControls'].hide();
	};
	context.hider = SetTimeout(hideIt, slinkTime);*/
};

function LoadAudioControls()
{
	/*var ty = $('#canvas').height() - 30;
	map['PlayerRectTarget'] = paper.rect(0, ty, $('#canvas').width(), 30).attr({fill:"#FFF", opacity:0});
	map['PlayerRectTarget'].mouseover(snapTo);
	$.ajax({
		url: 'player.xml',
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			$.extend(map, ms[1]);
			map['Play'].attr({opacity:0});
			map['PlayToggleTarget'].mouseover(function(e){
				this.attr({fill:"#666"});
				map['PlayToggle'].attr({fill:"#666"});

			});
			map['PlayToggleTarget'].mouseout(function(e){
				map['PlayToggle'].attr({fill:audioControllerColor});
			});
			map['PlayToggleTarget'].click(function(e){
				if(context.pause.isPaused)
					PlayHandler();
				else
					PauseHandler();
					
				if(context.pause.isPaused)
				{
					map['Play'].attr({opacity:1});
					map['Pause'].attr({opacity:0});
				}
				else
				{
					map['Play'].attr({opacity:0});
					map['Pause'].attr({opacity:1});
				}
			});
			
			map['SoundWaves'].hide();
			map['MuteToggleTarget'].mouseover(function(e){
				map['SpeakerProper'].attr({fill:"#666"});
				map['SoundWaves'].attr({stroke: "#666"});
			});
			map['MuteToggleTarget'].mouseout(function(e){
				map['SpeakerProper'].attr({fill:audioControllerColor});
				map['SoundWaves'].attr({stroke: audioControllerColor});
			});
			map['MuteToggleTarget'].click(function(e){
				ToggleMuteHandler();
			});
			
			//map['PlayerControls'].mouseover(snapTo);
			//map['PlayerControls'].mouseout(slinkAway);
			slinkAway();
			
			//kind of hacky but not really.  it's to set all the state right.
			ToggleMuteHandler();
			ToggleMuteHandler();
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}
	});	*/
	
}

$(function(){
	//This prototype is provided by the Mozilla foundation and
	//is distributed under the MIT license.
	//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license

	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisp*/)
	  {
		var len = this.length;
		if (typeof fun != "function")
		  throw new TypeError();

		var res = new Array();
		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
		  if (i in this)
		  {
			var val = this[i]; // in case fun mutates this
			if (fun.call(thisp, val, i, this))
			  res.push(val);
		  }
		}

		return res;
	  };
	}
	
	// pause controller
	$('#controls #play[class!="paused"]').live('click', function() { 
		PauseHandler();
		//console.log('play');	
		$(this).addClass('paused');
	});
	
	// play controller
	$('#controls #play.paused').live('click', function() { 
		PlayHandler();	
		//console.log('paused');
		$(this).removeClass();
	});
	
	// mute controller
	$('#mute').live('click', function() {
		ToggleMuteHandler()
	});
});