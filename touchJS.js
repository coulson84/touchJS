(function(touchIdentifier){

var touch = {};

touch.invoke = function (element, obj) {
	var o = touch,
		core = o.core,
		vars = o.vars,
		funcs = o.funcs,
		listeners = o.listeners,
		el = core.setTarget(element),
		e, i, j, h, temp,
		place = 0;

	vars.addMomentum = obj.addMomentum || false;
	/*deals with the functions or objects passed to the invoke method*/
	funcs.start = obj.start || funcs.start;
	funcs.multitouch = obj.multitouch || funcs.multitouch;
	funcs.multiend = obj.multiend ||funcs.multiend;
	funcs.momentum = obj.momentum || funcs.momentum;

	for(i in o.funcs) {
		if (obj.types[0] === 'all' && i == 'end') {
			if (typeof obj.end == 'function') {
				funcs[i] = {
					click: obj.end,
					horizontal: obj.end,
					vertical: obj.end,
					twoD: obj.end
				};
				obj.end = o.funcs[i];
			} else if (typeof obj.end == 'object') {
				funcs[i] = {
					click: obj.end.click || funcs.end.click,
					horizontal: obj.end.horizontal || funcs.end.horizontal,
					vertical: obj.end.vertical || funcs.end.vertical,
					twoD: obj.end.twoD || funcs.end.twoD
				};
			} else {
				funcs[i] = funcs[i];
			}
		} else if (obj.types[0] === 'all' && i == 'move') {
			if (typeof obj.move == 'function') {
				funcs[i] = {
					horizontal: obj.move,
					vertical:  obj.move,
					twoD:  obj.move
				};
				obj.move = o.funcs[i];
			} else if (typeof obj.move == 'object') {
				funcs[i] = {
					click: obj.move.click || funcs.move.click,
					horizontal:obj.move.horizontal || funcs.move.horizontal,
					vertical: obj.move.vertical || funcs.move.vertical,
					twoD: obj.move.twoD || funcs.move.twoD
				};
			} else {
				funcs[i] = funcs[i];
			}
		}else if(obj.types.length >= 1 && i == 'move') {
			for(j = obj.types.length - 1; j >= 0; j --) {
				funcs[i][obj.types[j]] = obj.move;
			}
		} else if(obj.types.length >= 1 && 'end') {
			for(j = obj.types.length - 1; j >= 0; j --) {
				funcs[i][obj.types[j]] = obj.end;
			}
		} else if (obj.types === undefined || typeof obj.types !== "object" || (typeof obj.types === "object" && obj.types[0] === undefined)) {
			console.log('Check the types array in your invocation object');
		}
	}

	if(typeof el === 'string' || el[0] == 'undefined') {
		console.log('event listeners not set - your element "' + el + '" was not a valid CSS class or ID selector');
	} else if (typeof el === 'object' && el.length === undefined) {
		if (typeof listeners[el.id] == 'undefined') {
			el.addEventListener('touchstart', function(e){
				core.touchStart(e);
			});
			el.addEventListener('touchmove', function(e){
				core.touchMove(e);
			});
			el.addEventListener('touchend', function(e){
				core.touchEnd(e);
			});
			
			listeners[el.id] = {
				start: funcs.start,
				move: funcs.move,
				end: funcs.end,
				multitouch: funcs.multitouch,
				multiend: funcs.multiend,
				startA: [],
				moveA: [],
				endA: [],
				multitouchA: [],
				multiendA: []
			};

			console.log('event listeners set on element "' + el.id +'"');
			listeners[el.id].startA.push(funcs.start);
			listeners[el.id].moveA.push(funcs.move);
			listeners[el.id].endA.push(funcs.end);
			listeners[el.id].multitouchA.push(funcs.multitouch);
			listeners[el.id].multiendA.push(funcs.multiend);
		} else if (typeof el === 'object' && el.length >= 1) {
			for (i = 0; i < el.length; i++) {
				console.log('event listener set on element No. '+i+' of class "' + el[i].className + '"');
				el[i].addEventListener('touchstart', function(e){
					core.touchStart(e);
				});
				el[i].addEventListener('touchmove', function(e){
					core.touchMove(e);
				});
				el[i].addEventListener('touchend', function(e){
					core.touchEnd(e);
				});
			}
		} else {
			console.log("There are event listeners already set on this element - checking for duplicates and conflicts......");
			for (i in listeners[el.id]) {
				if(typeof listeners[el.id][i] == 'function') {
					if (!obj[i]) {
						continue;
					} else {
						for (h = listeners[el.id][i + 'A'].length - 1; h >= 0; h--) {
							if (listeners[el.id][i + 'A'][h].toString() == obj[i].toString()) { /*Need to compare functions as string to ensure matching works*/
								console.log('    Attempt to apply duplicate ' + i + ' function to "' + el.id + '" - Duplicate event listener not set');
								funcs[i] = listeners[el.id][i];
							} else {
								/*augment function object to add new function to the element*/
								listeners[el.id][i + 'A'].push(obj[i]);
							}
						}
					}
				} else if (typeof listeners[el.id][i] == 'object') {
					if (!obj[i]) {
						continue;
					} else {
						console.log('\n    Attempt to apply ' + i + ' object to an existing event listener. Checking if functions within the object are duplicates......');
						place = listeners[el.id][i + 'A'].length;
					for (j in listeners[el.id][i]) {
						if(listeners[el.id][i][j].toString() == obj[i][j].toString()) { /*Need toString to compare functions to ensure matching works*/
							console.log('        Attempt to apply duplicate ' + j + ' function to ' + i + ' object function to "' + el.id + '" - Duplicate event listener not set');
							funcs[i][j] = listeners[el.id][i][j];
						} else {
							console.log('        No duplicate ' + j + ' function detected in ' + i + ' object on element "'+ el.id + '"  (there may now be two different ' + i + ' functions assigned)');
							/*augment function object to add new function to the element*/
							listeners[el.id][i + 'A'][place] = obj[i];
						}
					}
				}
			}
		}
	}
}

touch.funcs = {
	start: function(e) {console.log('No Start Function Set');},
	move: {
		click: function(e) {console.log('No touch hold move functions set');},
		horizontal: function(e) {console.log('No horizontal move functions set');},
		vertical: function(e) {console.log('No vertical move functions set');},
		twoD: function(e) {console.log('No 2D move functions set');}
	},
	end: {
		click: function(e) {console.log('No click touch functions set');},
		horizontal: function(e) {console.log('No horizontal end functions set');},
		vertical: function(e) {console.log('No vertical end functions set');},
		twoD: function(e) {console.log('No 2D end functions set');}
	},
	multitouch: function(e) {console.log('No multitouch function set');},
	multiend: function(e) {console.log('No multitouch end function set');},
	momentum: function(e) {console.log('No momentum function set');}
};

touch.listeners = {
	findTarget: function(e) {
		var o = this,
		eT = e.target,
		targetClass = eT.className,
		targetID = eT.id,
		target = "",
		i;

		for (i in o) {
			if (i == eT.id) {
				target = eT.id;
			} else if (i == eT.className) {
				target= eT.className;
			} else if (i != eT.id || i != eT.className) {
				if (i == eT.parentElement.id) {
					target = eT.parentElement.id;
				} else if (i == eT.parentElement.className) {
					target= eT.parentElement.className;
				} else if (i != eT.parentElement.id || i != eT.parentElement.className) {
					if (i == eT.parentElement.parentElement.id) {
						target = eT.parentElement.parentElement.id;
					} else if (i == eT.parentElement.parentElement.className) {
						target= eT.parentElement.parentElement.className;
					}
				}
			}
		}
		return target;
	}
};

touch.vars = {		/*core variables*/
	timeStamps: {},
	xPos: {},
	yPos: {},
	xPosNow: {},
	yPosNow: {},
	speed: {},
	dispX: {},
	dispY: {},
	isTouching: 0,
	e: {},
	deleteFingerInfo: function(e) {
		var len = e.changedTouches.length - 1,
		id;

		for (i = len; i >= 0; i--) {
			id = e.changedTouches[i].identifier;
			delete touch.vars.timeStamps[id];
			delete touch.vars.xPos[id];
			delete touch.vars.xPosNow[id];
			delete touch.vars.yPos[id];
			delete touch.vars.yPosNow[id];
		}
	}
};

touch.options = {
	xFriction: 0.05,
	yFriction: 0.05,
	xMovThreshold: 20,
	yMovThreshold: 20
};

touch.getFingerIDs = function() {
	"use strict";
	//console.log("getFingerIDs");
	var xP = touch.vars.xPos,
	id = [],
	i;

	for (i in xP) {
		if (xP.hasOwnProperty(i) && typeof(i) !== 'function') {
			id.push(i);
		}
	}
	id.sort(function(a,b){return b-a;});
	return id;
};
touch.core = {
	setTarget: function (el) {
		"use strict";
		if (el.charAt(0) === "#") {
			el = document.querySelectorAll(el)[0];
		} else if (el.charAt(0) === ".") {
			el = document.querySelectorAll(el);
		} else {
			el = el;
		}
		return el;
	},
	touchStart: function(e) {
		"use strict";
		//console.log('touchStart');
		var vars = touch.vars,
		ev = touch.vars.e,
		id = 0,
		listeners = touch.listeners,
		target = listeners.findTarget(e),
		i;

		e.preventDefault();
		e.stopPropagation();
		vars.isTouching = 1;

		for (i = 0; i < e.touches.length; i++) {
			id = e.touches[i].identifier;
			vars.xPos[id] = [e.touches[i].clientX];
			vars.yPos[id] = [e.touches[i].clientY];
			vars.timeStamps[id] = [e.timeStamp];
			//console.log(target)
			//console.log('finger ' + id + ' touchStart @ X: ' +vars.xPos[id][0] + '  Y: ' + vars.yPos[id][0]);
		}

		ev.systemInfo = e;
		ev.ids = touch.getFingerIDs(e);
		ev.xPos = vars.xPos;
		ev.yPos = vars.yPos;
		ev.timeStamps = vars.timeStamps;
		ev.touchesLength = e.touches.length;
		ev.changedTouchesLength = e.changedTouches.length;

		if(listeners[target].startA.length == 1) {
			listeners[target].startA[0](ev);
		} else {
			for (i = listeners[target].startA.length - 1; i >= 0; i--) {
				listeners[target].startA[i](ev);
			}
		}
	},
	touchMove: function(e) {
		"use strict";
		//console.log("touchMove");
		var tVars = touch.vars,
		ev = touch.vars.e,
		xP = tVars.xPos,
		yP = tVars.yPos,
		xPN = tVars.xPosNow,
		yPN = tVars.yPosNow,
		v = touch.vars,
		cT = e.changedTouches,
		len = cT.length - 1,
		i, id, target,
		listeners = touch.listeners,
		xLimit = touch.options.xMovThreshold,
		yLimit = touch.options.yMovThreshold,
		funcs = touch.listeners,
		x = 0,
		y = 0,
		tS = tVars.timeStamps;

		e.preventDefault();
		e.stopPropagation();

		/*loop through changed touches and add new values to the id of each occurrence*/
		for (i = len; i >= 0; i--) {
			id = cT[i].identifier;
			xP[id].push(cT[i].clientX);
			yP[id].push(cT[i].clientY);
			xPN[id] = cT[i].clientX;
			yPN[id] = cT[i].clientY;
			tVars.timeStamps[id].push(e.timeStamp);
			v.dispX[id] = xPN[id]- xP[id][0];
			v.dispY[id] = yPN[id]- yP[id][0];
			//console.log('Finger ' + id + ' moved to X:' + cT[i].clientX + ' Y:' + cT[i].clientY);
		}

		ev.systemInfo = e;
		ev.displacementX = v.dispX;
		ev.displacementY = v.dispY;
		ev.ids = touch.getFingerIDs(e);
		ev.xPos = xP;
		ev.yPos = yP;
		ev.timeStamps = tVars.timeStamps;
		ev.xPosNow = xPN;
		ev.yPosNow = yPN;
		ev.touchesLength = e.touches.length;
		ev.changedTouchesLength = e.changedTouches.length;

		if (e.touches.length == 1) {
			x = Math.abs(xP[id][0] - xPN[id]);
			y = Math.abs(yP[id][0] - yPN[id]);
			target = touch.listeners.findTarget(e);
			if (touch.listeners[target].move.length === 1) {
				if (x > xLimit && y > yLimit) {		/*2d swipe*/
					//console.log("2d");
					funcs[target].move[0].twoD(ev);
				} else {
					if (x < xLimit && y >= yLimit) {			/*vertical swipe*/
						//console.log("Vert");
						funcs[target].move[0].vertical(ev);
					} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
						//console.log("Hori");
						funcs[target].move[0].horizontal(ev);
					} else {
						//console.log("click");
						/*click - do nothing*/
					}
				}
			} else {
				for (i = touch.listeners[target].moveA.length - 1; i >=0; i--) {
					if (x > xLimit && y > yLimit) {		/*2d swipe*/
						//console.log("2d");
						touch.listeners[target].moveA[i].twoD(ev);
					} else {
						if (x < xLimit && y >= yLimit) {			/*vertical swipe*/
							//console.log("Vert");
							touch.listeners[target].moveA[i].vertical(ev);
						} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
							//console.log("Hori");
							touch.listeners[target].moveA[i].horizontal(ev);
						} else {
							//console.log("click");
							/*click - do nothing*/
						}
					}
				}
			}
		} else {
			touch.core.multitouch(ev);
		}
	},
	multitouch: function(e) {
		"use strict";
		//console.log("multitouch");
		var vars = touch.vars,
		ev = touch.vars.ev,
		startX = 0,
		startY = 0,
		start = 0,
		currX = 0,
		currY = 0,
		now = 0,
		i, id1, id2,
		target = "HTMLElement",
		len = 0,
		max = 0,
		xP = 0,
		yP = 0;

		e.preventDefault();
		e.stopPropagation();
		vars.isTouching = 2;

		if (e.touches.length == 2) {
			if (e.ids[0] < e.ids[1]) {	/*need this if/else statement as can't be sure what order the for/in loop (above) will run through the object*/
				id1 = e.ids[0];
				id2 = e.ids[1];
				len = vars.xPos[id2].length - 1;
				max = vars.xPos[id1].length - 1;
			} else {
				id1 = e.ids[1];
				id2 = e.ids[0];
				len = vars.xPos[id2].length - 1;
				max = vars.xPos[id1].length - 1;
			}
			startX = vars.xPos[id1][max - len] - vars.xPos[id2][0];	/*calculates difference between the two fingers in x and y then uses pythag to get hypotenuse*/
			startY = vars.yPos[id1][max - len] - vars.yPos[id2][0];
			start = Math.sqrt(startX * startX + startY * startY);
			currX = vars.xPos[id1][max] - vars.xPos[id2][len];
			currY = vars.yPos[id1][max] - vars.yPos[id2][len];
			now = Math.sqrt(currX * currX + currY * currY);
			ev.difference = start - now;
			//ev.target = touch.listeners.findTarget(e);
		}

		ev.systemInfo = e;
		ev.ids = touch.getFingerIDs(e);
		ev.xPos = xP;
		ev.yPos = yP;
		ev.timeStamps = vars.timeStamps;
		ev.xPosNow = vars.xPosNow;
		ev.yPosNow = vars.yPosNow;
		ev.touchesLength = e.touches.length;
		ev.changedTouchesLength = e.changedTouches.length;
		ev.target = touch.listeners.findTarget(e);

		if (touch.listeners[ev.target].multitouchA.length === 1) {
			touch.listeners[ev.target].multitouchA[0](ev);
		} else {
			for (i = touch.listeners[target].multitouchA.length - 1; i >= 0; i--) {
				touch.listeners[ev.target].multitouchA[i](ev);
			}
		}
	},
	touchEnd: function(e) {
		"use strict";
		var vars = touch.vars,
		ev = touch.vars.e,
		cT = e.changedTouches,
		len = cT.length - 1,
		id = [],
		x = 0,
		y = 0,
		xLimit = touch.options.xMovThreshold,
		yLimit = touch.options.yMovThreshold,
		i,
		target = "HTMLElement",
		funcs = touch.listeners,
		removed = [];

		e.preventDefault();
		e.stopPropagation();
		vars.isTouching = 0;

		for (i = len; i>= 0; i--) {
			id = cT[i].identifier;
			vars.timeStamps[id].push(e.timeStamp);
			vars.xPos[id].push(cT[i].clientX);
			vars.yPos[id].push(cT[i].clientY);
			//console.log('Finger ' + id + ' removed from X:' + cT[i].clientX + ' Y:' + cT[i].clientY);
		}

		if(e.changedTouches.length > 0) {
			for (i = e.changedTouches.length - 1; i >= 0; i--) {
				removed.push(e.changedTouches[i].identifier);
			}
		}

		if (e.touches.length === 0 && cT.length === 1) { //if one finger has been touching and is removed
			id = cT[0].identifier;
			ev.systemInfo = e;
			ev.ids = touch.getFingerIDs(e);
			ev.xPos = vars.xPos;
			ev.yPos = vars.yPos;
			ev.timeStamps = vars.timeStamps;
			ev.xPosNow = vars.xPosNow;
			ev.yPosNow = vars.yPosNow;
			ev.touchesLength = e.touches.length;
			ev.removedFingers = removed;
			ev.speedX = touch.vars.speed.X;
			ev.speedY = touch.vars.speed.Y;
			x = Math.abs(vars.xPos[id][0] - vars.xPosNow[id]);
			y = Math.abs(vars.yPos[id][0] - vars.yPosNow[id]);
			ev.target = touch.listeners.findTarget(e);
			ev.changedTouchesLength = e.changedTouches.length;
			touch.core.getSpeed(ev);
		} else if (cT.length >= 1 && e.touches.length > 0) {	/*if more than on finger is touching but not all fingers have been removed from the screen*/
			for (i = len; i >= 0; i--) {
				id = cT[i].identifier;
				ev.systemInfo = e;
				ev.ids = touch.getFingerIDs(e);
				ev.xPos = vars.xPos;
				ev.yPos = vars.yPos;
				ev.timeStamps = vars.timeStamps;
				ev.xPosNow = vars.xPosNow;
				ev.yPosNow = vars.yPosNow;
				ev.touchesLength = e.touches.length;
				ev.removedFingers = removed;
				ev.speedX = touch.vars.speed.X;
				ev.speedY = touch.vars.speed.Y;
				x = Math.abs(vars.xPos[id][0] - vars.xPosNow[id]);
				y = Math.abs(vars.yPos[id][0] - vars.yPosNow[id]);
				ev.changedTouchesLength = e.changedTouches.length;
				ev.target = touch.listeners.findTarget(e);
			}
		} else {	/*if more than one finger has been touching and all have been removed at once*/
			for (i = len; i >= 0; i--) {
				id = cT[i].identifier;
				ev.systemInfo = e;
				ev.ids = touch.getFingerIDs(e);
				ev.xPos = vars.xPos;
				ev.yPos = vars.yPos;
				ev.timeStamps = vars.timeStamps;
				ev.xPosNow = vars.xPosNow;
				ev.yPosNow = vars.yPosNow;
				ev.touchesLength = e.touches.length;
				ev.removedFingers = removed;
				ev.speedX = touch.vars.speed.X;
				ev.speedY = touch.vars.speed.Y;
				x = Math.abs(vars.xPos[id][0] - vars.xPosNow[id]);
				y = Math.abs(vars.yPos[id][0] - vars.yPosNow[id]);
				ev.changedTouchesLength = e.changedTouches.length;
				ev.target = touch.listeners.findTarget(e);
			}
		}

		if (e.touches.length === 0 && cT.length <= 1) {
			if(touch.listeners[ev.target].endA.length === 1) {
				if (x > xLimit && y > yLimit) {					/*2d swipe*/
					//console.log("2d");
					funcs[ev.target].endA[0].twoD(ev);
					if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
				} else if (x < xLimit && y >= yLimit) {			/*Vertical swipe*/
					//console.log("Vert");
					funcs[ev.target].endA[0].vertical(ev);
					if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
				} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
					//console.log("Hori");
					funcs[ev.target].endA[0].horizontal(ev);
					if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
				} else {										/*click*/
					//console.log("click");
					funcs[ev.target].endA[0].click(ev);
					if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
				}
			} else {
				for (i = funcs[ev.target].endA.length - 1; i >= 0; i--) {
					if (x > xLimit && y > yLimit) {					/*2d swipe*/
						//console.log("2d");
						funcs[ev.target].endA[i].twoD(ev);
						if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
					} else if (x < xLimit && y >= yLimit) {			/*Vertical swipe*/
						//console.log("Vert");
						funcs[ev.target].endA[i].vertical(ev);
						if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
					} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
						//console.log("Hori");
						funcs[ev.target].endA[i].horizontal(ev);
						if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
					} else {										/*click*/
						//console.log("click");
						funcs[ev.target].endA[i].click(ev);
						if(vars.addMomentum === false)
						vars.deleteFingerInfo(e);
					}
				}
			}
		} else {
			funcs[target].multiendA[0](e);
			if(vars.addMomentum === false)
				vars.deleteFingerInfo(e);
		}
	},
	getSpeed: function(e) {
		"use strict";
		//console.log("getSpeed");
		var xP = e.xPos,
		yP = e.yPos,
		tS = e.timeStamps,
		speed = touch.vars.speed,
		timeDiff = 0,
		movementX = 0,
		movementY = 0,
		max = 0,
		id = e.systemInfo.changedTouches[0].identifier,
		i;

		max = xP[id].length - 1;

		if (max <= 5) {
			timeDiff = (tS[id][max] - tS[id][0])/20;
			movementX = xP[id][max] - xP[id][0];
			movementY = yP[id][max] - yP[id][0];
			speed.X = parseFloat((movementX / timeDiff).toFixed(10));
			speed.Y = parseFloat((movementY / timeDiff).toFixed(10));
		} else {
			timeDiff = (tS[id][max] - tS[id][max - 4])/20;
			movementX = xP[id][max] - xP[id][max - 4];
			movementY = yP[id][max] - yP[id][max - 4];
			speed.X = parseFloat((movementX / timeDiff).toFixed(10));
			speed.Y = parseFloat((movementY / timeDiff).toFixed(10));
		}

		if (touch.vars.addMomentum.toString().toLowerCase() === "true") {
			if ((speed.X > 4 || speed.X < -4) || (speed.Y > 4 || speed.Y < -4)) {
				e.speedX = speed.X;
				e.speedY = speed.Y;
				e.ids = touch.getFingerIDs(e);
				e.xPos = xP;
				e.yPos = yP;
				e.timeStamps = tS;
				e.xPosNow = touch.vars.xPosNow;
				e.yPosNow = touch.vars.yPosNow;
				e.touchesLength = e.systemInfo.touches.length;
				touch.core.addMomentum(e);
			} else {
				setTimeout(function(){
					delete touch.vars.timeStamps[id];
					delete xP[id];
					delete yP[id];
				}, 15);
			}
		}
	},
	addMomentum: function(e) {
		"use strict";
		//console.log("addMomentum");
		e.speedX = touch.vars.speed.X;
		e.speedY = touch.vars.speed.Y;
		innerMomentum(e);

		/*function editEvent(e) {
			e.ids = [];
			e.xPos = xP;
			e.yPos = yP;
			e.timeStamps = touch.vars.timeStamps;
			e.xPosNowow = xPN;
			e.yPosNowow = yPN;
			e.touchesLength = 0;
			return e;
		}*/

		function innerMomentum(e) {
			//console.log("innerMomentum");
			var	xFriction = touch.options.xFriction,
			yFriction = touch.options.yFriction,
			max,
			id,
			last;

			for (var i in e.xPos) {
				if (e.xPos.hasOwnProperty(i) && typeof(i) !== 'function') {
					id = i;
					last = e.xPos[id].length - 1;
					break;
				}
			}
			switch (true) {
				case touch.vars.isTouching == (1 || 2):
					delete touch.vars.timeStamps[id];
					delete e.xPos[id];
					delete e.yPos[id];
					break;
				case (e.speedX <-0.2 && e.speedY < -0.2):
					e.speedX = e.speedX + Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.speedY = e.speedY + Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedX > 0.2 && e.speedY > 0.2):
					e.speedX = e.speedX - Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.speedY = e.speedY - Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedX > 0.2 && e.speedY < -0.2):
					e.speedX = e.speedX - Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.speedY = e.speedY + Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedX < -0.2 && e.speedY > 0.2):
					e.speedX = e.speedX + Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.speedY = e.speedY - Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedX < -0.2 && (e.speedY < 0.2 && e.speedY > -0.2)):
					e.speedX = e.speedX + Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.yPos[id][last + 1] = e.yPos[id][last];
					e.speedY = 0;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedX > 0.2 && (e.speedY < 0.2 && e.speedY > -0.2)):
					e.speedX = e.speedX - Math.abs(e.speedX * xFriction);
					e.xPos[id][last + 1] = e.xPos[id][last] + e.speedX;
					e.yPos[id][last + 1] = e.yPos[id][last];
					e.speedY = 0;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedY > 0.2 && (e.speedX < 0.2 && e.speedX > -0.2)):
					e.speedY = e.speedY - Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPos[id][last + 1] = e.xPos[id][last];
					e.speedX = 0;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				case (e.speedY < -0.2 && (e.speedX < 0.2 && e.speedX > -0.2)):
					e.speedY = e.speedY + Math.abs(e.speedY * yFriction);
					e.yPos[id][last + 1] = e.yPos[id][last] + e.speedY;
					e.xPos[id][last + 1] = e.xPos[id][last];
					e.speedX = 0;
					e.xPosNow[id] = e.xPos[id][last + 1];
					e.yPosNow[id] = e.yPos[id][last + 1];
					e.displacementX[id] = e.xPosNow[id]- e.xPos[id][0];
					e.displacementY[id] = e.yPosNow[id]- e.yPos[id][0];
					touch.funcs.momentum(e);
					setTimeout(function(){innerMomentum(e);}, 20);
					break;
				default:
					e.speedX = 0;
					e.speedY = 0;
					delete touch.vars.timeStamps[id];
					delete e.xPos[id];
					delete e.yPos[id];
					break;
			}
		}
	}
};

if(typeof window[touchIdentifier] !== 'undefined'){
	touch.oldTouch = window[touchIdentifier];
}
window[touchIdentifier] = touch.invoke;

touch.invoke.noConflict = function(){
	window[touchIdentifier] = touch.oldTouch;

	return touch.invoke;
};

}('touch'));