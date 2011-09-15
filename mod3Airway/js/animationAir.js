//globals
var debug = false;
var map = {};
var curr = 0;
var endings = [];
var paper;
var rotationVal;

function Choice(message, audio)
{
	var continueFunc = function(){
		paper.clear();
		if(parent.allTogether) {
			window.location = context.a3Complete;
			paper.text($('#canvas').width() / 2, $('#canvas').height() / 2, "Continue to next module.").attr({'font-size':14});
		}
		else
			location.reload(true);
	}
	
	var retryFunc = function(e){
		curr = 4;
		//paper.clear();
		var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());
		$.ajax({
			url: context.m305c1Svg,
			type: 'GET',
			dataType: 'xml',
			success: function(data){
				var ms = paper.importSVG(data, map);
				map = ms[1];
				map['Global'] = ms[0];
				//init graphics
				map['Slice'] = createPie(116, 130, 90, 0, 30);
	
				map['dline'].attr({opacity:1});
				map['dlineHigh'].attr({opacity:0});
				map['CircGuide'].attr({opacity:1});
				map['dragCue'].attr({opacity:1});
				//cursor
				map['gCursor'] = paper.image(context.thecursor, 75, 149, 25, 24);
				map['gCursor'].attr({opacity:0});
				
				//bot throat
				map['bThroat'] = paper.image(context.thethroat, 162, 184, 58, 26);
				map['bThroat'].attr({opacity:1});
				
				//down arrow
				map['dArrow'] = paper.image(context.darrow, 65, 124, 24, 55);
				map['dArrow'].attr({opacity:0});
				
				map['CircGuide'].animate({opacity:1}, 800);
	
				//currently delay circle guide fade
				context.timeUpdates = context.c1TimeUpdates;
								
				LoadAudioControls();
				quitSpin[0](quitSpin[1], quitSpin[2]);
				endings[curr++]();
			}
		});	
	};
	
	DoneScreen(message, continueFunc, retryFunc, audio);
}

var drag = {x:0, y:0};

function done(){
	context.timeUpdates = null;
	$('#jPlayer').jPlayer("setMedia",{
		mp3:"", 
		oga: ""
	});
	endings[curr++]();
}

$(function(){
	var urlVars = GetUrlVars();
	if(urlVars.debug)
		debug = true;
	
    paper = Raphael("canvas");

	endings[curr++]();
});

function createPie(x, y, r, a1, a2) {
	
	paper.customAttributes.segment = function (x, y, r, a1, a2) {
	    var flag = (a2 - a1) > 180,
	    a1 = (a1 % 360) * Math.PI / 180;
	    a2 = (a2 % 360) * Math.PI / 180;
	    return {
	        path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]],
	        //fill: "hsb(" + clr + ", .75, .8)"
			fill: "hsb(196, 100, 93)"
	    };
	};
	
	  var slice = paper.path(); 
	  slice.attr({segment: [x, y, r, -a2, a1], stroke: "#00ADEE", opacity: .7});
	
	return slice;
}

function modifySlice(slice, a1, a2) {
	var seg = slice.attrs.segment;
	seg[3] = -a2;
	seg[4] = a1;
	slice.attr("segment", seg);
}

endings.push(function(){
	var quitSpin = spinner(paper, $('#canvas').width(), $('#canvas').height());

	$.ajax({
		url: context.m305c1Svg,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var ms = paper.importSVG(data, map);
			map = ms[1];
			map['Global'] = ms[0];
			//init graphics
			map['Slice'] = createPie(116, 130, 90, 0, 30);

			map['dline'].attr({opacity:0});
			map['dlineHigh'].attr({opacity:0});
			map['CircGuide'].attr({opacity:1});
			map['dragCue'].attr({opacity:1});
			//cursor
			map['gCursor'] = paper.image(context.thecursor, 75, 149, 25, 24);
			map['gCursor'].attr({opacity:0});
			
			//bot throat
			map['bThroat'] = paper.image(context.thethroat, 162, 184, 58, 26);
			map['bThroat'].attr({opacity:1});
			
			//down arrow
			map['dArrow'] = paper.image(context.darrow, 65, 124, 24, 55);
			map['dArrow'].attr({opacity:0});
			
		//	map['gCursor'].animate({opacity:1}, 800);

			//currently delay circle guide fade
			context.timeUpdates = context.c1TimeUpdates;
							
			LoadAudioControls();
			quitSpin[0](quitSpin[1], quitSpin[2]);
				
			//play audio 1
			$('#jPlayer').jPlayer({
				ready: function () {
					$(this).jPlayer("setMedia", {
						mp3:Audio(context.m307a1Mp3),
						oga:Audio(context.m307a1Ogg)
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


var rotateAnim = {start:-1, prev: -1, total: -1, px: -1, py: -1, dir: 1, interval: -1};

function rotateDemo(){

	var time = new Date().getTime();
	
	if(rotateAnim.start > 0 && time - rotateAnim.start > rotateAnim.total){
		ClearInterval(rotateAnim.interval);
		return; 
	}
		
	if(rotateAnim.start < 0){
		rotateAnim.start = time;
		rotateAnim.prev = time;
		return;
	}
	
	var angle;
	var a1, a2;
	if(rotateAnim.dir > 0){
		angle = -15 * ((time - rotateAnim.start) / rotateAnim.total);
		a1 = 0;
		a2 = 30 + 60 * ((time - rotateAnim.start) / rotateAnim.total);
	}
	else{
		a1 = 0;
		a2 = 30 + 60 * ((rotateAnim.total - (time - rotateAnim.start)) / rotateAnim.total);
		angle = -15 * ((rotateAnim.total - (time - rotateAnim.start)) / rotateAnim.total);
	}
	rotateAnim.prev = time;
	map['head'].attr("rotation", angle + ", " + rotateAnim.px + ", " + rotateAnim.py);
	modifySlice(map['Slice'], a1, a2);
	
	
}

endings.push(function(){
	
	rotateAnim.px = map['NPivot'].attrs.cx;
 	rotateAnim.py = map['NPivot'].attrs.cy;
	rotateAnim.total = 3000;
	rotateAnim.dir = 1;

	rotateAnim.interval = SetInterval(rotateDemo, 13);

	//move circle and cursor
	//cursor

	var dx = map['dTarg'].attrs.x + map['dTarg'].attrs.width / 2 - (map['gCursor'].attrs.x + map['gCursor'].attrs.width / 2);
	var dy = map['dTarg'].attrs.y + map['dTarg'].attrs.height / 2 - (map['gCursor'].attrs.y + map['gCursor'].attrs.height / 2);

	Translate(map['gCursor'], 0, dy-4, 3000, function(){
		SetTimeout(endings[curr++], 1000);
	}, true);

	//circle
	map['circ'].animate({"cy": map['dTarg'].attrs.y-15}, 3000);
	//bottom throat
	map['bThroat'].animate({"y": 169}, 3000);

		
});

endings.push(function(){
	
	map['bThroat'].animate({"y": 184}, 3000);
	map['dArrow'].animate({opacity:0}, 500);
	
	var px = map['NPivot'].attrs.cx;
	var py = map['NPivot'].attrs.cy;
	
	rotateAnim.px = map['NPivot'].attrs.cx;
 	rotateAnim.py = map['NPivot'].attrs.cy;
	rotateAnim.total = 3000;
	rotateAnim.start = -1;
	rotateAnim.prev = -1;
	rotateAnim.dir = -1;

	rotateAnim.interval = SetInterval(rotateDemo, 13);
	
	map['gCursor'].animate({opacity:0}, 500);
	map['circ'].animate({opacity:0}, 500);
	
	SetTimeout(endings[curr++], 3000);
		
});

endings.push(function(){
	//now its your turn to try audieo
	//console.log('now it is your turn')
	$('#jPlayer').jPlayer("setMedia", {
		 mp3:Audio(context.m307a2Mp3),
		 oga:Audio(context.m307a2Ogg)
	}).jPlayer("play");
	
	var text = paper.text(context.a3Instructions.x, context.a3Instructions.y, context.a3Instructions.text);
	StylizeText(text, 16);
});

endings.push(function(){
	//put circ off screen
	var failTime = '';
	
	map['circ'].animate({"cy": map['dragCue'].attrs.y-1000}, 0);
	var retry = function(){
		
		//curr = 3;
		//SetTimeout(endings[curr++], 10);
		resetItems();

	};
	var next = (function(){
		return function(){
			//curr = curr + 2;
			//endings[curr - 1]();
			//console.log('next curr '+curr);
		};
	})();
	
		
	var Dunn = function(message, audio, ogg){
		return function(){
			//console.log('odd done screen')
			DoneScreen(message, next, retry, audio, ogg);
		};
	};
	
	var over = function(){ 
		map['circ'].animate({"cy": 150}, 0);
		map['circ'].attr({opacity:.7}); 
	};
	var out = function(){ 
		map['circ'].attr({opacity:0}); 
	};
	var start = function(){
		//start
		//console.log('start')
	};
	var resetItems = function() {
		var px = map['NPivot'].attrs.cx;
		var py = map['NPivot'].attrs.cy;
		
		map['dragCue'].attr({y:136});
		map['bThroat'].attr({y:184});
		map['head'].animate({"rotation": 0 + ", " + px + ", " + py}, 0);
		modifySlice(map['Slice'], 0, 30);
		drag.x = 0;
		drag.y = 0;
	}
	var up = function(){
		var px = map['NPivot'].attrs.cx;
		var py = map['NPivot'].attrs.cy;
		
		if (rotationVal >= -16 && rotationVal <= -14) {
			map['head'].animate({"rotation": -15 + ", " + px + ", " + py}, 0);
			modifySlice(map['Slice'], 0, 90);
			//popup winner
			ClearTimeout(failTimer);
			
			Choice(context.a3Success, context.a3SuccessMp3)
			//DoneScreen(context.a3Success, context.a3SuccessMp3, context.a3SuccessOgg)();
		} else {
			resetItems();
		}

		

	};
	var move = function(dx, dy){
		map['circ'].attr({opacity:0});
		
		//limit upper / lower limits
		if (dy < 0) {dy = 0};
		if (dy > 70) {dy = 70};	
		
		
		var rangePer = drag.y / 35;
		var tamt = 15*rangePer;
		
		

		map['dragCue'].translate(0-drag.x, dy - drag.y);
		
		var curTh = Math.floor(184-tamt)+1;
				
		if (curTh < 161) {
			curTh = 161;	
		}
		map['bThroat'].attr({y:curTh});
		
		
		
		drag.x = 0;
		drag.y = dy;

		var dragPer = dy/35;
		rotationVal = parseInt(15*dragPer)*-1;
		
		var px = map['NPivot'].attrs.cx;
		var py = map['NPivot'].attrs.cy;
		
		
		modifySlice(map['Slice'], 0, 30 + dragPer * 60);
		
		//console.log('rot '+rotationVal)
		
		//limit rotation
		if (rotationVal < -23) { 

			rotationVal = -23;
		}
		if (rotationVal > 5) { 

			rotationVal = 5;
		}
		//modify head turn during drag
		map['head'].animate({"rotation": rotationVal + ", " + px + ", " + py}, 0);
				
	};
	
	if(map['dragCue'])
	{
		map['dragCue'].drag(move, start, up);
		map['dragCue'].mouseover(over);
		map['dragCue'].mouseout(out);
		
	}
	
	failTimer = SetTimeout(function() { DoneScreen(context.a3Fail, context.a3FailMp3, context.a3FailOgg) }, 15000);	
});



//dummy function for when audio finishes.
endings.push(function(){
	curr -= 1;
});

function StylizeText(text, size)
{
	text.attr({"text-anchor":"start", "font-size":size, "font-weight":"regular", "font-family":"Lucida Sans Unicode", fill:"#000000"});
}
function Dist(x1, y1, x2, y2)
{
	dx = x2 - x1;
	dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}