var context = {
	showArrow: false,
	timeUpdates: null,
	timers: [],
	intervals: [],
	isMuted: false,
	pause: {rect: null, isPaused: false, play: 0},
	compressionsCounter: {circle: null, count: null},
	c1Svg: "mod3/3c1.xml",
	c1Mp3: "mod3/Audio/3c1.mp3",
	c1Ogg: "mod3/Audio/3c1.ogg",
	c2Svg: "mod3/3c2.xml",
	c2Mp3: "mod3/Audio/3c2.mp3",
	c2Ogg: "mod3/Audio/3c2.ogg",
	c2TimeUpdates: [{t: 4, done: false, action: function(){
		map['NippleLine'].animate({opacity:1}, 1200);
	}}, 
	{t: 5, done:false, action: function(){
		map['Fingers'].attr({opacity:1});
		map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15, true).attr({fill:themeColorCircle, "stroke-opacity":0});
		map['Hand'].push(map['FingersCircle']);
		//map['FingersGlow'].attr({opacity:1});
	}}],
	c3Mp3: "mod3/Audio/3c3.mp3",
	c3Ogg: "mod3/Audio/3c3.ogg",
	c3Instructions: {text: "Put the cursor over\nthe fingers and\nclick to drag them\nto the correct position", x:420, y:200},
	c3Fail: "Sorry, you did not find the correct\nlocation. Would you like\nto try again or continue on?",
	c3Success: "That's right. Would you\nlike to try again\nor continue on?",
	c3Complete: "threeComp.html",
	c3FailMp3: "mod3/Audio/3c3Fail.mp3",
	c3FailOgg: "mod3/Audio/3c3Fail.ogg",
	c3SuccessMp3:  "mod3/Audio/3c3Success.mp3",
	c3SuccessOgg:  "mod3/Audio/3c3Success.ogg",
};