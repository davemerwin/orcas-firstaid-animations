var context = {
	showArrow: false,
	timeUpdates : null,
	timers: [],
	intervals: [],
	isMuted: false,
	pause: {rect: null, isPaused: false, play: 0},
	compressionsCounter: {circle: null, count: null},
	c1Svg: "mod4/4c1.xml",
	c1Mp3: "mod4/Audio/4c1.mp3",
	c1Ogg: "mod4/Audio/4c1.ogg",
	c2Svg: "mod4/4c2.xml",
	c2Mp3: "mod4/Audio/4c2.mp3",
	c2Ogg: "mod4/Audio/4c2.ogg",
	c2TimeUpdates: [{t: 3, done:false, action: function(){
		map['Fingers'].attr({opacity:1});
		map['FingersCircle'] = PlaceCircle(map['FingersTarget'], 15, true).attr({fill:themeColorCircle, "stroke-opacity":0});
		map['Hand'].push(map['FingersCircle']);
		//map['FingersGlow'].attr({opacity:1});
	}},
	{t: 5, done: false, action: function(){
		map['NippleLine'].animate({opacity:1}, 1200);
	}},],
	c3Mp3: "mod4/Audio/4c3.mp3",
	c3Ogg: "mod4/Audio/4c3.ogg",
	c3Instructions: {text:"Put the cursor over\nthe hand and click\nto drag it to\nthe correct position", x:170, y:75 },
	c3Fail: "Sorry, you did not find the correct\nlocation. Would you like\nto try again or continue on?",
	c3Success: "That's right. Would you\nlike to try again\nor continue on?",
	c3Complete: "fourComp.html",
	c3FailMp3: "mod4/Audio/4c3Fail.mp3",
	c3FailOgg: "mod4/Audio/4c3Fail.ogg",
	c3SuccessMp3:  "mod4/Audio/4c3Success.mp3",
	c3SuccessOgg:  "mod4/Audio/4c3Success.mp3",
};