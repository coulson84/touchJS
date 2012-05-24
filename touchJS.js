/*touch.invoke({
        element: "somediv",
        types: ["twoD"],
        start: function(e) {},
        move: function(e) {},
        end: function(e) {}     
});
*/

(function(touchIdentifier){

var touch = {};

touch.invoke = function (obj) {
	var o = touch,
	core = o.core,
	vars = o.vars,
	funcs = o.funcs,
	listeners = o.listeners,
	el = /*(obj.element.charAt(0) === "#") ? document.querySelectorAll(obj.element)[0] : document.querySelectorAll(obj.element),*/ core.setTarget(obj.element),
	e, i, j, h, temp,
	place = 0;

	vars.addMomentum = (typeof obj.addMomentum == "undefined") ? false : obj.addMomentum;
	/*deals with the functions or objects passed to the invoke method*/
	funcs.touchStartF = (typeof obj.touchStartF == 'undefined') ? funcs.touchStartF : obj.touchStartF;
	funcs.multitouchF = (typeof obj.multitouchF == 'undefined') ? funcs.multitouchF : obj.multitouchF;
	funcs.multitouchEndF = (typeof obj.multitouchEndF == 'undefined') ? funcs.multitouchEndF : obj.multitouchEndF; /*might not be necessary*/
	funcs.momentumF = (typeof obj.momentumF == 'undefined') ? funcs.momentumF : obj.momentumF;

	for(i in o.funcs) {
		if (obj.types[0] === 'all' && i == 'touchEndF') {
			if (typeof obj.touchEndF == 'function') {
				funcs[i] = {
					click: obj.touchEndF,
					horizontal: obj.touchEndF,
					vertical: obj.touchEndF,
					twoD: obj.touchEndF,
				};
				obj.touchEndF = o.funcs[i];
			} else if (typeof obj.touchEndF == 'object') {
				funcs[i] = {
					click: (typeof obj.touchEndF.click == "undefined" ) ? funcs.touchEndF.click : obj.touchEndF.click,
					horizontal: (typeof obj.touchEndF.horizontal == "undefined" ) ? funcs.touchEndF.horizontal : obj.touchEndF.horizontal,
					vertical: (typeof obj.touchEndF.vertical == "undefined" ) ? funcs.touchEndF.vertical : obj.touchEndF.vertical,
					twoD: (typeof obj.touchEndF.twoD == "undefined" ) ? funcs.touchEndF.twoD : obj.touchEndF.twoD
				}
			} else {
				funcs[i] = funcs[i];
			}
		} else if (obj.types[0] === 'all' && i == 'touchMoveF') {
			if (typeof obj.touchMoveF == 'function') {
				funcs[i] = {
					horizontal: obj.touchMoveF,
					vertical:  obj.touchMoveF,
					twoD:  obj.touchMoveF,
				};
				obj.touchMoveF = o.funcs[i];
			} else if (typeof obj.touchMoveF == 'object') {
				funcs[i] = {
					click: (typeof obj.touchMoveF.click == "undefined" ) ? funcs.touchMoveF.click : obj.touchMoveF.click,
					horizontal: (typeof obj.touchMoveF.horizontal == "undefined" ) ? funcs.touchMoveF.horizontal : obj.touchMoveF.horizontal,
					vertical: (typeof obj.touchMoveF.vertical == "undefined" ) ? funcs.touchMoveF.vertical : obj.touchMoveF.vertical,
					twoD: (typeof obj.touchMoveF.twoD == "undefined" ) ? funcs.touchMoveF.twoD : obj.touchMoveF.twoD
				}
			} else {
				funcs[i] = funcs[i];
			}
		}else if(obj.types.length >= 1 && i == 'touchMoveF') {
			for(j = obj.types.length - 1; j >= 0; j --) {
				funcs[i][obj.types[j]] = obj.touchMoveF;
			}
		} else if(obj.types.length >= 1 && 'touchEndF') {
			for(j = obj.types.length - 1; j >= 0; j --) {
				funcs[i][obj.types[j]] = obj.touchEndF;
			}
		} else if (obj.types == undefined || typeof obj.types != "object" || (typeof obj.types == "object" && obj.types[0] == undefined)) {
			console.log('Check the types array in your invocation object')
		}
	}


	console.log(typeof el); /*safari currently passing back the function that el is assigned to rather than the array of class elements!?
	set event listeners on element(s) passed in to the invoke method.*/
	if(typeof el === 'string' || el[0] == 'undefined') {
		console.log('event listeners not set - your element "' + el + '" was not a valid CSS class or ID selector')
	} else if (typeof el == 'object' && el.length == undefined) {
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
			console.log('event listeners set on element "' + el.id +'"');
			listeners[el.id] = {
				touchStartF: funcs.touchStartF,
				touchMoveF: funcs.touchMoveF,
				touchEndF: funcs.touchEndF,
				multitouchF: funcs.multitouchF,
				multitouchEndF: funcs.multitouchEndF,
				touchStartFA: [],
				touchMoveFA: [],
				touchEndFA: [],
				multitouchFA: [],
				multitouchEndFA: []
			};

			listeners[el.id].touchStartFA.push(funcs.touchStartF);
			listeners[el.id].touchMoveFA.push(funcs.touchMoveF);
			listeners[el.id].touchEndFA.push(funcs.touchEndF);
			listeners[el.id].multitouchFA.push(funcs.multitouchF);
			listeners[el.id].multitouchEndFA.push(funcs.multitouchEndF);
		} else {
			/*check functions currently set against functions to be assigned - log if changed or overwrites occur*/
			console.log("There are event listeners already set on this element - checking for duplicates and conflicts......")
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
					} else 
					console.log('\n    Attempt to apply ' + i + ' object to an existing event listener. Checking if functions within the object are duplicates......')
					place = listeners[el.id][i + 'A'].length;
					for (j in listeners[el.id][i]) {
						if(listeners[el.id][i][j].toString() == obj[i][j].toString()) { /*Need toString to compare functions to ensure matching works*/
							console.log('        Attempt to apply duplicate ' + j + ' function to ' + i + ' object function to "' + el.id + '" - Duplicate event listener not set')
							funcs[i][j] = listeners[el.id][i][j];
						} else {
							console.log('        No duplicate ' + j + ' function detected in ' + i + ' object on element "'+ el.id + '"  (there may now be two different ' + i + ' functions assigned)')
							/*augment function object to add new function to the element*/
							listeners[el.id][i + 'A'][place] = obj[i];
						}
					}
				}
			}
		}
	} else if (typeof el == 'object' && el.length >= 1) {
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
	}
};

touch.funcs = {
	touchStartF: function(e) {console.log('No Start Function Set')},
	touchMoveF: {
		click: function(e) {console.log('No touch hold move functions set')},
		horizontal: function(e) {console.log('No horizontal move functions set')},
		vertical: function(e) {console.log('No vertical move functions set')},
		twoD: function(e) {console.log('No 2D move functions set')},
	},
	touchEndF: {
		click: function(e) {console.log('No click move functions set')},
		horizontal: function(e) {console.log('No horizontal end functions set')},
		vertical: function(e) {console.log('No vertical end functions set')},
		twoD: function(e) {console.log('No 2D end functions set')},
	},
	multitouchF: function(e) {console.log('No multitouch function set')},
	multitouchEndF: function(e) {console.log('No multitouch end function set')},
	momentumF: function(e) {console.log('No momentum function set')}
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
	isTouching: 0,
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
	yMovThreshold: 20,
};

touch.getFingerIDs = function() {
	"use strict";
	//console.log("getFingerIDs");
	var xP = touch.vars.xPos,
	id = [],
	i;

	for (var i in xP) {
		if (xP.hasOwnProperty(i) && typeof(i) !== 'function') {
    		id.push(i);
    		//break;
		}
	}
	id.sort(function(a,b){return b-a});
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
			console.log(target)
			//console.log('finger ' + id + ' touchStart @ X: ' +vars.xPos[id][0] + '  Y: ' + vars.yPos[id][0]);
		}

		if(listeners[target].touchStartFA.length == 1) {
			listeners[target].touchStartFA[0](e);
		} else {
			for (i = listeners[target].touchStartFA.length - 1; i >= 0; i--) {
				listeners[target].touchStartFA[i]();
			};
		}
	},
	touchMove: function(e) {
		"use strict";
		//console.log("touchMove");
		var tVars = touch.vars,
		xP = tVars.xPos,
		yP = tVars.yPos,
		xPN = tVars.xPosNow,
		yPN = tVars.yPosNow,
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
			//console.log('Finger ' + id + ' moved to X:' + cT[i].clientX + ' Y:' + cT[i].clientY);
		}

		if (e.touches.length == 1) {
			x = Math.abs(xP[id][0] - xPN[id]);
			y = Math.abs(yP[id][0] - yPN[id]);
			target = touch.listeners.findTarget(e);
			if (touch.listeners[target].touchMoveF.length === 1) {
				if (x > xLimit && y > yLimit) {		/*2d swipe*/
					//console.log("2d");
					funcs[target].touchMoveF[0].twoD(e);
				} else {
					if (x < xLimit && y >= yLimit) {			/*vertical swipe*/
						//console.log("Vert");
						funcs[target].touchMoveF[0].vertical(e);
					} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
						//console.log("Hori");
						funcs[target].touchMoveF[0].horizontal(e);
					} else {
						//console.log("click");				
						/*click - do nothing*/
					}
				}
			} else {
				for (i = touch.listeners[target].touchMoveFA.length - 1; i >=0; i--) {
					if (x > xLimit && y > yLimit) {		/*2d swipe*/
						//console.log("2d");
						touch.listeners[target].touchMoveFA[i].twoD(e);
					} else {
						if (x < xLimit && y >= yLimit) {			/*vertical swipe*/
							//console.log("Vert");
							touch.listeners[target].touchMoveFA[i].vertical(e);
						} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
							//console.log("Hori");
							touch.listeners[target].touchMoveFA[i].horizontal(e);
						} else {
							//console.log("click");				
							/*click - do nothing*/
						}
					}
				}
			}
		} else {
			touch.core.multitouch(e);
		}
	},
	multitouch: function(e) {
		"use strict";
		//console.log("multitouch");
		var vars = touch.vars,
		startX = 0,
		startY = 0,
		start = 0,
		currX = 0,
		currY = 0,
		now = 0,
		i, id1, id2,
		target = "HTMLElement",
		id = touch.getFingerIDs(),
		len = 0,
		max = 0;

		e.preventDefault();
		e.stopPropagation();
		vars.isTouching = 2;

		if (e.touches.length == 2) {
			if (id[0] < id[1]) {	/*need this if/else statement as can't be sure what order the for/in loop (above) will run through the object*/
				id1 = id[0];
				id2 = id[1];
				len = vars.xPos[id2].length - 1;
				max = vars.xPos[id1].length - 1;
			} else {
				id1 = id[1];
				id2 = id[0];
				len = vars.xPos[id2].length - 1;
				max = vars.xPos[id1].length - 1;
			}
			startX = vars.xPos[id1][max - len] - vars.xPos[id2][0];	/*calculates difference between the two fingers in x and y then uses pythag to get hypotenuse*/
			startY = vars.yPos[id1][max - len] - vars.yPos[id2][0];
			start = Math.sqrt(startX * startX + startY * startY);
			currX = vars.xPos[id1][max] - vars.xPos[id2][len];
			currY = vars.yPos[id1][max] - vars.yPos[id2][len];
			now = Math.sqrt(currX * currX + currY * currY);
			e.difference = start - now;
			target = touch.listeners.findTarget(e);
		}

		target = touch.listeners.findTarget(e);
		if (touch.listeners[target].multitouchFA.length === 1) {
			touch.listeners[target].multitouchFA[0](e);
		} else {
			for (i = touch.listeners[target].multitouchFA.length - 1; i >= 0; i--) {
				touch.listeners[target].multitouchFA[i](e);
			}
		}
	},
	touchEnd: function(e) {
		"use strict";
		var vars = touch.vars,
		cT = e.changedTouches,
		len = cT.length - 1,
		id = [],
		x = 0,
		y = 0,
		xLimit = touch.options.xMovThreshold,
		yLimit = touch.options.yMovThreshold,
		i,
		target = "HTMLElement",
		funcs = touch.listeners;

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



		if (e.touches.length == 0 && cT.length == 1) { /*if one finger has been touching and is removed*/
			touch.core.getSpeed(e);
			for (i = len; i >= 0; i--) {
				id = cT[i].identifier;
				x = (typeof vars.xPos[id] == 'undefined')? 0 : Math.abs(vars.xPos[id][0] - vars.xPosNow[id]);
				y = (typeof vars.yPos[id] == 'undefined')? 0 : Math.abs(vars.yPos[id][0] - vars.yPosNow[id]);
				target = touch.listeners.findTarget(e);
			}
		} else if (cT.length >= 1 && e.touches.length > 0) {	/*if more than on finger is touching but not all fingers have been removed from the screen*/
			for (i = len; i >= 0; i--) {
				id = cT[i].identifier;
				target = touch.listeners.findTarget(e);
			}
		} else {	/*if more than one finger has been touching and all have been removed at once*/
			for (i = len; i >= 0; i--) {
				id = cT[i].identifier;
				target = touch.listeners.findTarget(e);
			}
		}

		if (e.touches.length == 0 && cT.length <= 1) {
			if(touch.listeners[target].touchEndFA.length === 1) {
				if (x > xLimit && y > yLimit) {					/*2d swipe*/
					//console.log("2d");
					funcs[target].touchEndFA[0].twoD(e);
					if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
				} else if (x < xLimit && y >= yLimit) {			/*Vertical swipe*/
					//console.log("Vert");
					funcs[target].touchEndFA[0].vertical(e);
					if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
				} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
					//console.log("Hori");
					funcs[target].touchEndFA[0].horizontal(e);
					if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
				} else {										/*click*/
					//console.log("click");
					funcs[target].touchEndFA[0].click(e);
					if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
				}
			} else {
				for (i = funcs[target].touchEndFA.length - 1; i >= 0; i--) {
					if (x > xLimit && y > yLimit) {					/*2d swipe*/
						//console.log("2d");
						funcs[target].touchEndFA[i].twoD(e);
						if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
					} else if (x < xLimit && y >= yLimit) {			/*Vertical swipe*/
						//console.log("Vert");
						funcs[target].touchEndFA[i].vertical(e);
						if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
					} else if (x >= xLimit && y < yLimit) {			/*horizontal swipe*/
						//console.log("Hori");
						funcs[target].touchEndFA[i].horizontal(e);
						if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
					} else {										/*click*/
						//console.log("click");
						funcs[target].touchEndFA[i].click(e);
						if(vars.addMomentum == false) 
						vars.deleteFingerInfo(e);
					}
				}
			}
		} else {
			funcs[target].multitouchEndFA[0](e);
			if(vars.addMomentum == false) 
				vars.deleteFingerInfo(e);
		}
	},
	getSpeed: function(e) {
		"use strict";
		//console.log("getSpeed");
		var xP = touch.vars.xPos,
		yP = touch.vars.yPos,
		tS = touch.vars.timeStamps,
		speed = touch.vars.speed,
		timeDiff = 0,
		movementX = 0,
		movementY = 0,
		max = 0,
		id = e.changedTouches[0].identifier,
		i;

		max = xP[id].length - 1;

		if (max <= 5) {
			timeDiff = (tS[id][max] - tS[id][0])/20;
			movementX = xP[id][max] - xP[id][0];
			movementY = yP[id][max] - yP[id][0];
			speed.X = parseFloat((movementX / timeDiff).toFixed(10));
			speed.Y = parseFloat((movementY / timeDiff).toFixed(10));
		} else {
			timeDiff = (tS[id][max] - tS[id][max-4])/20;
			movementX = xP[id][max] - xP[id][max - 4];
			movementY = yP[id][max] - yP[id][max - 4];
			speed.X = parseFloat((movementX / timeDiff).toFixed(10));		
			speed.Y = parseFloat((movementY / timeDiff).toFixed(10));
		}

		if (touch.vars.addMomentum.toString().toLowerCase() === "true") {
			if ((speed.X > 4 || speed.X < -4) || (speed.Y > 4 || speed.Y < -4)) {
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
		innerMomentum();

		function innerMomentum(e) {
			"use strict";
			//console.log("innerMomentum");
			var xP = touch.vars.xPos,
			yP = touch.vars.yPos,
			speed = touch.vars.speed,
			xPN = touch.vars.xPosNow,
			yPN = touch.vars.yPosNow,
			xFriction = touch.options.xFriction,
			yFriction = touch.options.yFriction,
			max,
			id,
			last;

			for (var i in xP) {
    			if (xP.hasOwnProperty(i) && typeof(i) !== 'function') {
        			id = i;
        			last = xP[id].length - 1;
        			break;
    			}
			}
			switch (true) {
				case touch.vars.isTouching == (1 || 2):
					delete touch.vars.timeStamps[id];
					delete xP[id];
					delete yP[id];
					break;
				case (speed.X <-0.2 && speed.Y < 0.2):
					speed.X = speed.X + Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					speed.Y = speed.Y + Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.X > 0.2 && speed.Y > 0.2):
					speed.X = speed.X - Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					speed.Y = speed.Y - Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.X > 0.2 && speed.Y < -0.2):
					speed.X = speed.X - Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					speed.Y = speed.Y + Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.X < -0.2 && speed.Y > 0.2):
					speed.X = speed.X + Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					speed.Y = speed.Y - Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.X < -0.2 && (speed.Y < 0.2 && speed.Y > -0.2)):
					speed.X = speed.X + Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					yP[id][last + 1] = yP[id][last];
					speed.Y = 0;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.X > 0.2 && (speed.Y < 0.2 && speed.Y > -0.2)):
					speed.X = speed.X - Math.abs(speed.X * xFriction);
					xP[id][last + 1] = xP[id][last] + speed.X;
					yP[id][last + 1] = yP[id][last];
					speed.Y = 0;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.Y > 0.2 && (speed.X < 0.2 && speed.X > -0.2)):
					speed.Y = speed.Y - Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xP[id][last + 1] = xP[id][last];
					speed.X = 0;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				case (speed.Y < -0.2 && (speed.X < 0.2 && speed.X > -0.2)):
					speed.Y = speed.Y + Math.abs(speed.Y * yFriction);
					yP[id][last + 1] = yP[id][last] + speed.Y;
					xP[id][last + 1] = xP[id][last];
					speed.X = 0;
					xPN[id] = xP[id][last + 1];
					yPN[id] = yP[id][last + 1];
					touch.funcs.momentumF(e);
					setTimeout(function(){innerMomentum();}, 20);
					break;
				default:
					delete touch.vars.timeStamps[id];
					delete xP[id];
					delete yP[id];
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