var ResetContext = function(context)
{
	map = {};
	context.c6_2comp = {begin:0, prev: 0, timer: null, elapsed: 0, max: 10};
	context.c7_comp	= {begin:0, prev: 0, timer: null, elapsed: 0, max: 60};
	context.c8_comp = {arrow: 0, user: 0, descending:true, done:false, started:false};
	
	for(var i = 0; i < context.c6_2TimeUpdates.length; ++i)
		context.c6_2TimeUpdates[i].done = false;
	
	for(var i = 0; i < context.c7TimeUpdates.length; ++i)
		context.c7TimeUpdates[i].done = false;
	
	for(var i = 0; i < context.c8TimeUpdates.length; ++i)
		context.c8TimeUpdates[i].done = false;
		
	return context;
}

function StylizeText(text, size)
{
	text.attr({"text-anchor":"start", "font-size":size, "font-weight":"regular", "font-family":"Lucida Sans Unicode, Lucida Grande", fill:"#000000"});
}

function Dist(x1, y1, x2, y2)
{
	dx = x2 - x1;
	dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

function GradientString(t)
{
	var per = Math.round((1 - t) * 100);
	if(per == 100)
		per = 99;
		
	return "0-" + map['ArrowsFill'] + "-" + map['ArrowsFill'] + ":" + per + "-#7F0000:" + (per + 1) + "-#7F0000";
}

function PerfuseBlood(t)
{
	map['Brain'].attr("fill", LerpColors(map['BrainFill'], "#7F0000", t));
	map['Lungs'].attr("fill", LerpColors(map['LungsFill'], "#7F0000", t));
	map['Arrows'].attr("fill", GradientString(t));
}


function InitTweens()
{
	map['ChestOutlineInflated'] = SerializePath(map['ChestOutlineExpanded']);
	map['ChestOutlineDeflated'] = SerializePath(map['ChestOutline']);
	map['ChestMainInflated'] = SerializePath(map['ChestMainExpanded']);
	map['ChestMainDeflated'] = SerializePath(map['ChestMain']);
	map['LungsFill'] = map['Lungs'].attrs.fill;
	map['BrainFill'] = map['Brain'].attrs.fill;
	map['ArrowsFill'] = map['ArrowOne'].attrs.fill;
	map['Arrows'].attr("fill", GradientString(0));
	map['ChestPaths'] = {
		main: {inflated: StringToPath(map['ChestMainExpanded'].attr('path')), deflated: StringToPath(map['ChestMain'].attr('path'))},
		outline: {inflated: StringToPath(map['ChestOutlineExpanded'].attr('path')), deflated: StringToPath(map['ChestOutline'].attr('path'))},
	};
}

function CreateCompressionCounter()
{
	context.compressionsCounter.circle = paper.path("M80,76.302C80,78.344,78.344,80,76.302,80H23.698C21.656,80,20,78.344,20,76.302V23.698C20,21.656,21.656,20,23.698,20h52.604C78.344,20,80,21.656,80,23.698V76.302z").attr({stroke:'#3A3838', 'stroke-opacity':1, fill:"#B2B2B2"});
	context.compressionsCounter.count = paper.text(50, 50, "" + context.c8_comp.user).attr({"font-size":24, "font-weight":"bold", "font-family":"Lucida Sans Unicode, Lucida Grande", fill:"#000"});
}

function DestroyCompressionCounter()
{
	if(context.compressionsCounter.circle)
		context.compressionsCounter.circle.remove();
	if(context.compressionsCounter.count)
		context.compressionsCounter.count.remove();
		
	context.compressionsCounter.circle = null;
	context.compressionsCounter.count = null;
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
		url: context.c6Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			map['ChestMain'].hide();
			map['ChestOutline'].hide();
			map['Arrow'].attr({opacity:0});
			map['ArrowProper'].attr({opacity:0});
			map['FingersGlow'].attr({opacity:0});
			map['DiagramGlow'].attr({opacity:0});
			map['Hand'].attr({ x:270 });
			InitTweens();
			PerfuseBlood(0);
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);
			$('#jPlayer').jPlayer("setMedia", {
				 mp3:Audio(context.c6_1Mp3),
				 oga:Audio(context.c6_1Ogg)
			}).jPlayer("play");
			context.timeUpdates = context.c6_1TimeUpdates;
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}
	});		
});

endings.push(function(){
	context.timeUpdates = context.c6_2TimeUpdates;
	$('#jPlayer').jPlayer("setMedia", {
		mp3:Audio(context.c6_2Mp3),
		oga:Audio(context.c6_2Ogg)
	}).jPlayer("play");
});

endings.push(function(){
	SetTimeout(endings[curr++], 200);
});

function AnimateCompression(compInfo)
{
	var timePrev = Math.max(context.pause.play, compInfo.prev);
	var time = new Date().getTime(); //time
	var elapsedPrev = compInfo.elapsed;
	compInfo.elapsed += time - timePrev;
	var i = Math.floor((compInfo.elapsed) / 300);  //compression count.  300 ms per compression
	var t = ((compInfo.elapsed) % 300) / 300;  //how far into the compression are we?  map to [0, 1]
	
	var iPrev = Math.floor((elapsedPrev) / 300);	//previous compression count.  used for translation of objects
	var tPrev = ((elapsedPrev) % 300) / 300;		//how far into compression was the last one.  used for translation of objects
	
	compInfo.prev = time;  // prev = new for next time
	
	var lerp = t;
	if(i % 2 == 1)
		lerp = 1 - t;  //up
		
	if(i < compInfo.max)
	{
		SetPathData(map['ChestOutlineExpanded'], LerpPaths(map['ChestPaths'].outline.inflated, map['ChestPaths'].outline.deflated, lerp));
		SetPathData(map['ChestMainExpanded'], LerpPaths(map['ChestPaths'].main.inflated, map['ChestPaths'].main.deflated, lerp));
		PerfuseBlood(lerp);
		
		var dt;
		//same direction
		if((i - iPrev) % 2 == 0)
			dt = t - tPrev;
		else
			dt = t - (1 - tPrev);
			
		//headed up or down?
		if(i % 2 == 1) 
			dt = -dt
			
		var dyHand = map['CompressionsTarget'].attrs.y - map['FingersTargetFixed'].attrs.y;			
		var dyArrow = map['CompressionsTarget'].attrs.y - map['FingersTargetFixed'].attrs.y + map['ArrowProper'].attrs.height / 2;
		map['Hand'].translate(0, dyHand * dt);
		map['Arrow'].translate(0, dyArrow * dt);
		
		if(context.compressionsCounter.count)
			context.compressionsCounter.count.attr({text: "" + Math.floor(i / 2)});
			
	}
	else
	{
		DestroyCompressionCounter();
		ClearInterval(compInfo.timer);
		endings[curr++]();
	}
}

endings.push(function(){
	context.c6_2comp.begin = new Date().getTime();
	context.c6_2comp.prev = context.c6_2comp.begin;
	
	var AnimateComp = function(){
		AnimateCompression(context.c6_2comp);
	};
	context.c6_2comp.timer = SetInterval(AnimateComp, 13);	
});

endings.push(function(){
	context.timeUpdates = context.c7TimeUpdates;
	$('#jPlayer').jPlayer("setMedia", {
		mp3:Audio(context.c7Mp3),
		oga:Audio(context.c7Ogg)
	}).jPlayer("play");
	if(debug)
		curr++;
});

endings.push(function(){
	$('#jPlayer').jPlayer("setMedia", {
		mp3:"mod3/Audio/100bpm.mp3",
		oga:"mod3/Audio/100bpm.ogg"
	}).jPlayer("play");
});

function AnimateBasedOnHandPos()
{
	var y0 = map['FingersTargetFixed'].attr('y');
	var y1 = map['CompressionsTarget'].attr('y');
	var y = map['FingersTarget'].attr('y');
	
	if(y > y1)
	{
		map['Hand'].translate(0, y1 - y);
		y = y1;
	}
	else if(y < y0)
	{
		map['Hand'].translate(0, y0 - y);
		y = y0;
	}
	
	var t = (y - y0) / (y1 - y0);
	
	PerfuseBlood(t);
	
	SetPathData(map['ChestOutlineExpanded'], LerpPaths(map['ChestPaths'].outline.inflated, map['ChestPaths'].outline.deflated, t));
	SetPathData(map['ChestMainExpanded'], LerpPaths(map['ChestPaths'].main.inflated, map['ChestPaths'].main.deflated, t));
}

endings.push(function(){
	$('#jPlayer').jPlayer("stop");
	context.timeUpdates = context.c8TimeUpdates;
	
	$('#jPlayer').jPlayer("setMedia", {
		mp3:Audio(context.c8Mp3),
		oga:Audio(context.c8Ogg)
	}).jPlayer("play");	
	
	var text = paper.text(context.c8Instructions.x, context.c8Instructions.y, context.c8Instructions.text).attr({opacity:1});
	StylizeText(text, 16);
	if(context.showArrow)
		map['ArrowProper'].attr({opacity:1});
		
	if(map['FingersCircle'])
		map['FingersCircle'].remove();
		
	map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15).attr({opacity: 0, fill:themeColorCircle, "stroke-opacity":0});
	map['Hand'].push(map['FingersCircle']);
	
	var failTimer;
	var time;
	var retryFunc = function(){
		context = ResetContext(context);
		curr = 6;
		paper.clear();
		var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
		$.ajax({
			url: context.c6Svg,
			type: 'GET',
			dataType: 'xml',
			success: function(data){
				var ms = paper.importSVG(data, map);
				map = ms[1];
				map['Global'] = ms[0];
				map['ChestMain'].hide();
				map['ChestOutline'].hide();
				map['Arrow'].attr({opacity:0});
				if(context.showArrow)
					map['ArrowProper'].attr({opacity:1});
				map['FingersGlow'].attr({opacity:0});
				map['DiagramGlow'].attr({opacity:0});
				map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15).attr({fill:themeColorCircle, "stroke-opacity":0});
				map['Hand'].push(map['FingersCircle']);
				InitTweens();
				PerfuseBlood(0);
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
		if(parent.allTogether)
			paper.text($('#canvas').width() / 2, $('#canvas').height() / 2, "Continue to next module.").attr({'font-size':14});
		else
		location.reload(true);
	}
	
	CreateCompressionCounter();
	
	var over = function(){ map['FingersCircle'].attr({opacity:.7}); };
	var out = function(){ map['FingersCircle'].attr({opacity:0}); };
	
	var start = function(){
		if(context.c8_comp.done)
			return;
			
		map['FingersCircle'].animate({opacity: 0}, 100, function(){
			map['FingersCircle'].animate({opacity:.7}, 100, function(){
				map['FingersCircle'].animate({opacity:0}, 100);
			});
		});
			
		context.c8_comp.started = true;
		//Is this the user just starting compressions?
		if(!time)
		{
			context.timeUpdates = null;
			$('#jPlayer').jPlayer("stop");
	
			if(context.showArrow)
			{
				$('#jPlayer').jPlayer("setMedia", {
					mp3:context.beep,
					oga:context.beepOgg
				});
			}
			else
			{
				$('#jPlayer').jPlayer("setMedia", {
					mp3:"mod3/Audio/100bpm.mp3",
					oga:"mod3/Audio/100bpm.ogg"
				}).jPlayer("play");
			}
				
			time = (new Date()).getTime();
					
			var TooSlow = function(){
				context.c8_comp.done = true;
				DoneScreen(context.c8Fail("too slow"), continueFunc, retryFunc, context.c8FailAudio("TooSlow"));
			};
			ClearTimeout(failTimer);
			failTimer = SetTimeout(TooSlow, 25000);
			
			ArrowRepeat();
		}
		
		drag.x = 0;
		drag.y = 0;
	};
	
	var up = function(){
		if(context.c8_comp.done)
			return;
		var dy = map['FingersTargetFixed'].attr('y') - map['FingersTarget'].attr('y');
		map['Hand'].translate(0, dy);
		drag.x = 0;
		drag.y = 0;
		
		AnimateBasedOnHandPos();
	};
	
	var move = function(dx, dy){
		if(context.c8_comp.done)
			return;
			
		map['FingersCircle'].attr({opacity:0});
			
		map['Hand'].translate(0, dy - drag.y);
		
		//A compression has happened
		if(dy - drag.y < 0 && context.c8_comp.descending)
		{
			//must be deep enough
			if(map['CompressionsTarget'].attrs.y - map['FingersTargetFixed'].attrs.y - dy < 2)
				context.compressionsCounter.count.attr({text: "" + ++context.c8_comp.user});
				
			context.c8_comp.descending = false;
			
			//Have we done more than 30 compressions?
			if(context.c8_comp.user >= 30)
			{
				ClearTimeout(failTimer);
				DestroyCompressionCounter();
				context.c8_comp.done = true;
				var secs = ((new Date()).getTime() - time) / 1000;
				var message, audio;
				if(secs <= context.c8TooFast)
				{
					message = context.c8Fail("too fast");
					audio = context.c8FailAudio("TooFast");
				}
				else	//Otherwise it was not too slow since timer has not gone off
				{
					message = context.c8Success;
					audio = context.c8SuccessMp3;
				}
					
				DoneScreen(message, continueFunc, retryFunc, audio);
			}
		}
		else if(dy - drag.y >= 0)
		{
			context.c8_comp.descending = true;
		}
			
		drag.x = dx;
		drag.y = dy;
		
		AnimateBasedOnHandPos();
	};
	
	var ArrowRepeat = function(){
		var i = context.c8_comp.arrow++;
		if(context.c8_comp.done || !context.c8_comp.started)
			return;
			
		if(context.showArrow)
		{
			if(i % 2 == 0)
			{
				$('#jPlayer').jPlayer("stop").jPlayer("play");	
				var dy = map['CompressionsTarget'].attrs.y - map['FingersTargetFixed'].attrs.y + map['ArrowProper'].attrs.height / 2;
				Translate(map['Arrow'], 0, dy, 300, ArrowRepeat, true);
			}
			else if(i % 2 == 1)
			{
				var dy = map['FingersTargetFixed'].attrs.y - map['CompressionsTarget'].attrs.y - map['ArrowProper'].attrs.height / 2;
				Translate(map['Arrow'], 0, dy, 300, ArrowRepeat, true);
			}
		}
	};
	map['FingersClick'].drag(move, start, up);
	map['FingersClick'].mouseover(over);
	map['FingersClick'].mouseout(out);
	if(map['FingersCircle'])
	{
		map['FingersCircle'].mouseover(over);
		map['FingersCircle'].mouseout(out);
		map['FingersCircle'].drag(move, start, up);
	}
	context.c8Drag.move = move;
	context.c8Drag.start = start;
	context.c8Drag.up = up
	var failFunc = function(){
		DoneScreen(context.c8Fail("too slow"), continueFunc, retryFunc, context.c8FailAudio("TooSlow"));
	};
	failTimer = SetTimeout(failFunc, 35000);
});

endings.push(function(){
	curr -= 1;
})