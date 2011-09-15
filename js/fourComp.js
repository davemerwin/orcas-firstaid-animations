var context = {
	showArrow: false,
	timeUpdates : null,
	timers: [],
	intervals: [],
	isMuted: false,
	pause: {rect: null, isPaused: false, play: 0},
	compressionsCounter: {circle: null, count: null},
	c6Svg: "mod4/4c6.xml",
	c6_1Mp3: "mod4/Audio/4c6-1.mp3",
	c6_1Ogg: "mod4/Audio/4c6-1.ogg",
	c6_1TimeUpdates: [{t:2, done:false, action:function(){
		HandGlow(map['FingersGlow'], map['FingersTarget']);
	}}, {t: 6, done:false, action:function(){
		DepthGlow(map['OneThird']);}}],
	c6_2Mp3: "mod4/Audio/4c6-2.mp3",
	c6_2Ogg: "mod4/Audio/4c6-2.ogg",
	c6_2TimeUpdates: [{t:3.5, done: false, action: function(){
		HandGlow(map['FingersGlow'], map['FingersTarget']);
	}}, {t: 6, done: false, action: function(){
		DepthGlow(map['OneThird']);
	}}],
	c6_2comp: {begin:0, prev: 0, timer: null, elapsed: 0, max: 10},
	c7_comp: {begin:0, prev: 0, timer: null, elapsed: 0, max: 60},
	c7Mp3: "mod4/Audio/4c7.mp3",
	c7Ogg: "mod4/Audio/4c7.ogg",
	c7TimeUpdates: [{t:7, done: false, action: function(){
		DepthGlow(map['OneThird']); }}, {t: 8, done: false, action: function(){
		if(context.showArrow)
			map['ArrowProper'].attr({opacity:1});
		context.c7_comp.begin = new Date().getTime();
		context.c7_comp.prev = context.c7_comp.begin;
		
		var AnimateComp = function(){
			AnimateCompression(context.c7_comp);
		};
		CreateCompressionCounter();
		context.c7_comp.timer = SetInterval(AnimateComp, 13);
	}}, {t:11, done: false, action: function(){
		if(context.showArrow)
			AnimateOpacityDown(map['ArrowGlow'], 3500);
	}}],
	c8Mp3: "mod4/Audio/4c8.mp3",
	c8Ogg: "mod4/Audio/4c8.ogg",
	beep:  "mod3/Audio/beep.mp3",
	beepOgg:  "mod3/Audio/beep.ogg",
	c8TimeUpdates: [{t:5, done: false, action: function(){
		//HandGlow(map['FingersGlow'], map['FingersTarget'], context.c8Drag, map['Hand']);
	}}, {t:10, done: false, action: function(){
		if(context.showArrow)
		{
			map['Arrow'].attr({opacity:1});
			AnimateOpacityDown(map['ArrowGlow'], 2000);
		}
	}}, {t: 14, done: false, action: function(){
		AnimateOpacityDown(map['DiagramGlow'], 2500);
	}}],
	c8Drag: {move: null, start: null, up: null},
	c8Instructions: {x:460, y:75, text:"Click and hold\nwhile dragging\nup and down to\ngive compressions."},
	c8_comp: {arrow: 0, user: 0, descending:true, done:false, started:false},
	c8TooFast: 14, //If user does 30 compressions in less than c8TooFast, it's too fast.
	c8Success:  "That's right. Would you like\nto try again or continue on?",
	c8SuccessMp3: "mod4/Audio/4c8Success.mp3",
	c8SuccessOgg: "mod4/Audio/4c8Success.ogg",
	c8Fail: function(problem){
		return "Sorry, you performed the\ncompressions " + problem + ". Would you like to\ntry again or continue on.";
	},
	c8FailAudio: function(problem){
		return "mod4/Audio/4c8Fail" + problem + ".mp3";
	},
};