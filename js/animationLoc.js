var ResetContext = function(context)
{
	map = {};
	
	for(var i = 0; i < context.c2TimeUpdates.length; ++i)
		context.c2TimeUpdates[i].done = false;
		
	return context;
}

function StylizeText(text, size)
{
	text.attr({"text-anchor":"start", "font-size":size, "font-weight":"regular", "font-family":"Lucida Sans Unicode, Lucida Grande", fill:"#000000" });
}

function Dist(x1, y1, x2, y2)
{
	dx = x2 - x1;
	dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

var endings = [];
var map = {};
var debug = false;
var curr = 0;
var paper;

var drag = {x:0, y:0};

function done()
{
	context.timeUpdates = null;
	$('#jPlayer').jPlayer("setMedia",{
		mp3:"",
		oga:""
	});
	endings[curr++]();
}

$(function(){
	var urlVars = GetUrlVars();
	if(urlVars.debug)
		debug = true;
	if(urlVars.compressions)
		curr = 6;
	if(urlVars.arrow == "false")
		context.showArrow = false;
	
    paper = Raphael("canvas");
	
	$('#jPlayer').jPlayer({
	ready: function () {
		endings[curr++]();
	},
	solution:"flash, html",
	swfPath:"http://jgreer.zymichost.com/js",
	warningAlerts:false,
	errorAlerts:false,
	supplied:"mp3, oga",
	backgroundColor:"#FFFFFF",
	timeupdate: TimeUpdate,
	ended: done,
	});
});

endings.push(function(){
	paper.clear();
	var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
	$.ajax({
		url: context.c1Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);
			$('#jPlayer').jPlayer("setMedia", {
			  mp3:Audio(context.c1Mp3),
			  oga:Audio(context.c1Ogg)
			 }).jPlayer("play");
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}
	});	
});

endings.push(function(){
	paper.clear();
	var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
	$.ajax({
		url: context.c2Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);
			map['Hand'].attr({opacity:0});
			map['NippleLine'].attr({opacity:0});
			context.timeUpdates = context.c2TimeUpdates;
			$('#jPlayer').jPlayer("setMedia", {
				 mp3:Audio(context.c2Mp3),
				 oga:Audio(context.c2Ogg)
			}).jPlayer("play");
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}
	});	
});

endings.push(function(){
	map['ChestCircle'] = PlaceCircle(map['CompressionsTarget'], 15).attr({fill:themeColorCircle, "stroke-opacity":0});
	if(!map['FingersCircle'])
	{
		map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15).attr({fill:themeColorCircle, "stroke-opacity":0});
		map['Hand'].push(map['FingersCircle']);
	}
	
	map['NippleLine'].attr({opacity:1});
	map['Hand'].toFront();
	map['Fingers'].attr({opacity:1});
	//AnimateOpacityDown(map['FingersGlow'], 1000);
	map['FingersCircle'].animate({"stroke-opacity": 0}, 750, function(){
		map['FingersCircle'].animate({opacity:0}, 250);
	});
	var dx = map['CompressionsTarget'].attrs.x + map['CompressionsTarget'].attrs.width / 2 - (map['FingersTarget'].attr('x') + map['FingersTarget'].attrs.width / 2);
	var dy = map['CompressionsTarget'].attrs.y + map['CompressionsTarget'].attrs.height / 2 - (map['FingersTarget'].attr('y') + map['FingersTarget'].attrs.height / 2);
	Translate(map['Hand'], dx, dy, 2000, function(){
		map['ChestCircle'].animate({opacity:0}, 500);
		SetTimeout(endings[curr++], 1000);
	}, true);
});

endings.push(function(){
	var dx = map['FingersTargetFixed'].attr('x') + map['FingersTargetFixed'].attrs.width / 2 - (map['FingersTarget'].attr('x') + map['FingersTarget'].attrs.width / 2);
	var dy = map['FingersTargetFixed'].attr('y') + map['FingersTargetFixed'].attrs.height / 2 - (map['FingersTarget'].attr('y') + map['FingersTarget'].attrs.height / 2);
	
	Translate(map['Hand'], dx, dy, 1000, endings[curr++], true);
});

endings.push(function(){
	$('#jPlayer').jPlayer("setMedia", {
		 mp3:Audio(context.c3Mp3),
		 oga:Audio(context.c3Ogg)
	}).jPlayer("play");
	
	var text = paper.text(context.c3Instructions.x, context.c3Instructions.y, context.c3Instructions.text);
	StylizeText(text, 16);
	map['Hand'].toFront();
	
	if(map['FingersCircle'])
		map['FingersCircle'].remove();
		
	map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15).attr({opacity:0, fill:themeColorCircle, "stroke":0});
	map['Hand'].push(map['FingersCircle']);
	
	var failTimer;
	
	var retry = function(){
		context = ResetContext(context);
		curr = 4;
		paper.clear();
		var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
		$.ajax({
			url: context.c2Svg,
			type: 'GET',
			dataType: 'xml',
			success: function(data){
				var ms = paper.importSVG(data, map);
				map = ms[1];
				map['Global'] = ms[0];
				map['FingersGlow'].attr({opacity:0});
				map['ChestCircle'] = PlaceCircle(map['CompressionsTarget'], 15).attr({opacity:0, fill:themeColorCircle, "stroke":0});
				map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15).attr({opacity:0, fill:themeColorCircle, "stroke":0});
				map['Hand'].push(map['FingersCircle']);
				map['Hand'].toFront();
				LoadAudioControls();
				quitSpin[0](quitSpin[1], quitSpin[2]);
				endings[curr++]();
			},
			error: function(request, status, error){
				alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
			}
		});	
	};
	
	var continueFunc = function(){
		paper.clear();
		if(parent.allTogether) {
			window.location = context.c3Complete;
			paper.text($('#canvas').width() / 2, $('#canvas').height() / 2, "Continue to next module.").attr({'font-size':14});
		}
		else
			location.reload(true);
	}
	
	var Dunn = function(message, audio){
		return function(){
			DoneScreen(message, continueFunc, retry, audio);
		};
	};
	
	var over = function(){ map['FingersCircle'].attr({opacity:.7}); };
	var out = function(){ map['FingersCircle'].attr({opacity:0}); };
	
	var start = function(){
		map['FingersCircle'].animate({opacity: 0}, 100, function(){
			map['FingersCircle'].animate({opacity:.7}, 100, function(){
				map['FingersCircle'].animate({opacity:0}, 100);
			});
		});
	};
	
	var up = function(){
		map['FingersGlow'].attr({opacity:0});
		var x = parseFloat(map['FingersTarget'].attr('x'));
		var y = parseFloat(map['FingersTarget'].attr('y'));
		var tx = parseFloat(map['CompressionsTarget'].attr('x'));
		var ty = parseFloat(map['CompressionsTarget'].attr('y'));
		
		drag.x = 0;
		drag.y = 0;
		
		if(Dist(x, y, tx, ty) < 30)
		{
			map['ChestCircle'].attr({opacity:.7});
			$('#jPlayer').jPlayer("stop");
			ClearTimeout(failTimer);
			Dunn(context.c3Success, context.c3SuccessMp3)();
		}
		else
		{
			map['ChestCircle'].attr({opacity:0});
			var dx = map['FingersTargetFixed'].attrs.x - map['FingersTarget'].attrs.x;
			var dy = map['FingersTargetFixed'].attrs.y - map['FingersTarget'].attrs.y;
			map['Hand'].translate(dx, dy);
		}
	};
	
	var move = function(dx, dy){
		map['FingersCircle'].attr({opacity:0});
		var x = parseFloat(map['FingersTarget'].attr('x'));
		var y = parseFloat(map['FingersTarget'].attr('y'));
		var tx = parseFloat(map['CompressionsTarget'].attr('x'));
		var ty = parseFloat(map['CompressionsTarget'].attr('y'));
		
		if(Dist(x, y, tx, ty) < 40)
			map['ChestCircle'].attr({opacity:.7});
		else
			map['ChestCircle'].attr({opacity:0});
			
		map['Hand'].translate(dx - drag.x, dy - drag.y);
		drag.x = dx;
		drag.y = dy;
	};
	
	map['FingersClick'].drag(move, start, up);
	map['FingersClick'].mouseover(over);
	map['FingersClick'].mouseout(out);
	if(map['FingersCircle'])
	{
		map['FingersCircle'].drag(move, start, up);
		map['FingersCircle'].mouseover(over);
		map['FingersCircle'].mouseout(out);
	}
	failTimer = SetTimeout(Dunn(context.c3Fail, context.c3FailMp3), 30000);
});

endings.push(function(){
	curr -= 1;
});
