var context = {
	timers: [],
	intervals: [],
	isMuted: false,
	pause: {rect: null, isPaused: false, play: 0},
	thecursor: "/cursor.png",
	thethroat: "mod3Airway/mod3/throatBottom.png",
	darrow: "mod3Airway/mod3/downArrow.png",
	m305c1Svg: "mod3Airway/mod3/m307a1.xml",
	m307a1Mp3: "mod3Airway/mod3/Audio/M3.07.a1.mp3",
	m307a1Ogg: "mod3Airway/mod3/Audio/M3.07.a1.ogg",
	m307a2Mp3: "mod3Airway/mod3/Audio/M3.07.a2.mp3",
	m307a2Ogg: "mod3Airway/mod3/Audio/M3.07.a2.ogg",
	m307b4Mp3: "mod3Airway/mod3/Audio/M3.07.b4.mp3",
	m307b4Ogg: "mod3Airway/mod3/Audio/M3.07.b4.ogg",
	m307b5Mp3: "mod3Airway/mod3/Audio/M3.07.b5.mp3",
	m307b5Ogg: "mod3Airway/mod3/Audio/M3.07.b5.ogg",
	c1TimeUpdates: [{t: 6, done: false, action: function(){
		map['CircGuide'].animate({opacity:1}, 800);
	}},	
	{t: 6, done: false, action: function(){
			map['gCursor'].animate({opacity:1}, 800);
	}},	
	{t: 11.2, done: false, action: function(){
			map['dlineHigh'].animate({opacity:1}, 300);
	}},	
	{t: 11.5, done: false, action: function(){
			map['dlineHigh'].animate({opacity:0}, 300);
	}},	
	{t: 11.5, done: false, action: function(){
			map['dline'].animate({opacity:1}, 800);
	}},	
	{t: 12, done: false, action: function(){
			map['dArrow'].animate({opacity:1, y:165}, 800);
	}}],
	a3Instructions: {text: "Click on the forehead\nand drag to tilt the\nhead.", x:420, y:75},
	a3Fail: "Sorry, you did not find the correct\nlocation. Would you like\nto try again or continue on?",
	a3Success: "That's right. Would you\nlike to try again\nor continue on?",
	a3FailMp3: "mod3Airway/mod3/Audio/3c3Fail.mp3",
	a3FailOgg: "mod3Airway/mod3/Audio/3c3Fail.ogg",
	a3SuccessMp3:  "mod3Airway/mod3/Audio/3c3Success.mp3",
	a3SuccessOgg:  "mod3Airway/mod3/Audio/3c3Success.ogg",
	a3Complete: "../three.html"
};