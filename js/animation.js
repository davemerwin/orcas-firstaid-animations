function Choice(message, audio)
{
	var continueFunc = function(){
		paper.clear();
		if(parent.allTogether) {
			window.location = context.b3Complete;
			paper.text($('#canvas').width() / 2, $('#canvas').height() / 2, "Continue to next module.").attr({'font-size':14});
		}
		else
			location.reload(true);
	}
	
	var retryFunc = function(e){
		curr = 7;
		paper.clear();
		var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
		$.ajax({
			url: context.b2Svg,
			type: 'GET',
			dataType: 'xml',
			success: function(data){
				map = {};
				var ms = paper.importSVG(data, map);
				map = ms[1];
				map['Global'] = ms[0];
				map['HeadBlow'].hide();
				map['ChestOutlineExpanded'].hide();
				map['ChestMainExpanded'].hide();
				if(map['Cursor'])
					map['Cursor'].attr({opacity:0});
					
				map['Global'].scale(context.scale.kx, context.scale.ky, context.scale.x, context.scale.y);
				LoadAudioControls();
				quitSpin[0](quitSpin[1], quitSpin[2]);
				InitTween();
				endings[curr++]();
			},
			error: function(request, status, error){
				alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
			}	
		});
	};
	
	DoneScreen(message, continueFunc, retryFunc, audio);
}

function InitTween()
{
	map['ChestOutlineInflated'] = SerializePath(map['ChestOutlineExpanded']);
	map['ChestOutlineDeflated'] = SerializePath(map['ChestOutline']);
	map['ChestMainInflated'] = SerializePath(map['ChestMainExpanded']);
	map['ChestMainDeflated'] = SerializePath(map['ChestMain']);
}

function HeadDown()
{
	map['Head'].hide();
	map['HeadBlow'].show();
	Translate(map['HeadBlow'], context.headTranslate.x, context.headTranslate.y, context.headTranslate.t, function(){
		map['ChestOutline'].animate({path:map['ChestOutlineInflated']}, 1000);
		map['ChestMain'].animate({path:map['ChestMainInflated']}, 1000);		
		$('#jPlayer').jPlayer("setMedia", {
			 mp3:Audio("mod3/Audio/breath.mp3"),
			 oga:Audio("mod3/Audio/breath.ogg")
		}).jPlayer("play");
	});
}

function HeadUp(next)
{
	var orig = map['HeadBlowTargetFixed'].attrs;
	var moved = map['HeadBlowTarget'].attrs;
	var deltaX = parseInt(orig.x) - parseInt(moved.x);
	var deltaY = parseInt(orig.y) - parseInt(moved.y);
	map['ChestOutline'].animate({path:map['ChestOutlineDeflated']}, 500);
	map['ChestMain'].animate({path:map['ChestMainDeflated']}, 500);
	Translate(map['HeadBlow'], deltaX, deltaY, context.headTranslate.t, function(){
		map['HeadBlow'].hide();
		map['Head'].show();
		next();
	});
}

var debug = false;
var map = {};
var curr = 0;
var endings = [];
var paper;

function done(){
	context.timeUpdates = null;
	$('#jPlayer').jPlayer("setMedia", { 
		mp3:"", 
		oga:""
	});
	endings[curr++]();
}

$(function(){
	var urlVars = GetUrlVars();
	if(urlVars.debug)
		debug = true;
	
    paper = Raphael("canvas", "100%", "100%");
	
	endings[curr++]();
});

endings.push(function(){
	var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
	$.ajax({
		url: context.b1Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);


			$('#jPlayer').jPlayer({
				ready: function () {
					$(this).jPlayer("setMedia", {
					  mp3:Audio(context.b1Mp3),
					  oga:Audio(context.b1Ogg)
					 });
					 $(this).jPlayer("play");
				},
				solution:"flash, html",
				swfPath:"http://jgreer.zymichost.com/js",
				warningAlerts:false,
				errorAlerts:false,
				supplied:"mp3, oga",
				backgroundColor:"#FFFFFF",
				ended: done,
				timeupdate: TimeUpdate,
			});
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
		url: context.b2Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			map = {};
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			map['HeadBlow'].hide();
			map['ChestOutlineExpanded'].hide();
			map['ChestMainExpanded'].hide();
			if(map['Cursor'])
				map['Cursor'].attr({opacity:0});
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);
			
			$('#jPlayer').jPlayer("setMedia", {
				 mp3:Audio(context.b2Mp3),
				 oga:Audio(context.b2Ogg)
			}).jPlayer("play");
		},
		error: function(request, status, error){
			alert(status + ', ' + error + ', ' + request.getAllResponseHeaders());
		}
	});	
});

endings.push(function(){
	Scale(map['Global'], context.scale.kx, context.scale.ky, context.scale.x, context.scale.y, 1500, function(){
		map['HeadBlow'].translate(10, 50);
		map['HeadBlow'].translate(-10, -50);
		SetTimeout(endings[curr++], 1000);
	});
});

endings.push(function(){
	var circ = PlaceCircle(map['MouthTarget'], 15, true).attr({fill:themeColorCircle, "stroke-opacity":0});
	circ.animate({"stroke-opacity":0}, 1000, function(){
		circ.animate({opacity:0}, 400, function(){
			InitTween();
			HeadDown();
		});
	});
});

endings.push(function(){
	HeadUp(function(){
		SetTimeout(endings[curr++], 1000);
	});
});

endings.push(function(){
	HeadDown();
});

endings.push(function(){
	HeadUp(function(){
		SetTimeout(endings[curr++], 300);
	});
});

endings.push(function(){
	$('#jPlayer').jPlayer("setMedia", {
		 mp3:Audio(context.b3Mp3),
		 oga:Audio(context.b3Ogg),
	}).jPlayer("play");
	
	map['MouthCircle'] = PlaceCircle(map['MouthTarget'], 15, false).attr({opacity: 0, fill:themeColorCircle, "stroke-opacity":0});
	var over = function(){ map['MouthCircle'].attr({opacity:.7}); };
	var out = function(){ map['MouthCircle'].attr({opacity:0}); };
	
	var failTimer;
	var t1 = [-1, -1];
	var t2 = [-1, -1];
	var downSecond = function(e){
		map['MouthCircle'].animate({opacity:0}, 100);
		t2[0] = new Date().getTime();
		this.unmousedown(downSecond);
		HeadDown();
	};
	var down = function(e){
		ClearTimeout(failTimer);		
		t1[0] = new Date().getTime();
		map['MouthCircle'].animate({opacity:0}, 100);
		failTimer = SetTimeout(Fail, 15000);
			
		this.unmousedown(down);
		this.mousedown(downSecond);
		HeadDown();
	};
	var upSecond = function(e){
		t2[1] = new Date().getTime();
		this.unmouseup(upSecond);
		map['HeadBlow'].stop();
		map['ChestOutline'].stop();
		map['ChestMain'].stop();
		$('#jPlayer').jPlayer("stop");
		var finished = (function(){
			return function(){
				curr = curr + 2;
				endings[curr - 1]();
			};
		})();
		HeadUp(function(){
			ClearTimeout(failTimer);
			var Success = (function(){
				return function(){
					text.remove();
					var message;
					var audio;
					
					//check that they hold the mouse down long enough
					if(t1[1] - t1[0] > 1500 && t2[1] - t2[0] > 1500 && t1[1] - t1[0] < 3000 && t2[1] - t2[0] < 3000)
					{
						message = context.b3Success;
						audio = context.b3SuccessMp3;
					}
					else	
					{
						message = context.b3Fail;
						audio = context.b3FailMp3;
					}
						
					Choice(message, audio);
				};
			})();
			SetTimeout(Success, 1000);
		});
	};
	var up = function(e){
		t1[1] = new Date().getTime();
		this.unmouseup(up);
		this.mouseup(upSecond);
		map['HeadBlow'].stop();
		map['ChestOutline'].stop();
		map['ChestMain'].stop();
		$('#jPlayer').jPlayer("stop");
		HeadUp(function(){
			var Fail = (function(){
				return function(){
					text.remove();
					var message = context.b3Fail;
					Choice(message, context.b3FailMp3);
				};
			})();
			return;
		});
	};
	
	var text = paper.text(context.b3Instructions.x, context.b3Instructions.y, context.b3Instructions.text).attr({"text-anchor":"start", "font-size":16, "font-family":"Lucida Sans Unicode, Lucida Grande", fill:"#000000", opacity:1});
	
	map['MouthCircle'].mousedown(down);
	map['MouthCircle'].mouseup(up);
	map['MouthCircle'].mouseover(over);
	map['MouthCircle'].mouseout(out);
	
	var Fail = (function(){
		return function(){
			text.remove();
			var message = context.b3Fail;
			Choice(message, context.b3FailMp3);
		};
	})();
	failTimer = SetTimeout(Fail, 30000);
	map['MouthTarget'].mousedown(down);
	map['MouthTarget'].mouseup(up);
	map['MouthTarget'].mouseover(over);
	map['MouthTarget'].mouseout(out);
});

//dummy function for when audio finishes.
endings.push(function(){
	curr -= 1;
});