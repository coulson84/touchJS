(function(){
	var touchInfo = {};
	var mousedown = false;
	var isTouching = false;
	var passTouch = function(e) {
		if(!/ip(ad|hone|od)/i.test(navigator.userAgent) && e.preventDefault && e.type === 'touchmove') {
			e.preventDefault();
		}
		isTouching = true;
		touchBase.touching.call(touchBase, e);
	};
	var passTouchEnd = function(e) {
		touchBase.touchEnd.call(touchBase, e);
		isTouching = true;
	};
	var passMouseDown = function(e) {
		if(isTouching) {
			return;
		}
		mousedown = true;
		e['touches'] = [e];
		touchBase.touching.call(touchBase, e);
	};
	var passMouseMove = function(e) {
		if(mousedown && !isTouching) {
			e['touches'] = [e];
			touchBase.touching.call(touchBase, e);
		}
	};

	var passMouseOut = function(e) {
		if(mousedown && e.toElement === null && !isTouching) {
			mousedown = false;
			e['touches'] = [e];
			touchBase.touchEnd.call(touchBase, e);
		}
	};

	var passMouseUp = function(e) {
		mousedown = false;
		e['touches'] = [];
		touchBase.touchEnd.call(touchBase, e);
	};
	var pointerStart = function(e) {
		if(e.isPrimary) {
			pointerTouches = [];
			touchInfo.singleSwipe = undefined;
			touchInfo.doubleSwipe = undefined;
			touchBase.maxTouches = 0;
		}
		pointerTouches.push({
			'pointerId': e['pointerId'],
			'target': e.target,
			'pageX': e.pageX,
			'pageY': e.pageY,
			'clientX': e.clientX,
			'clientY': e.clientY,
			'screenX': e.screenX,
			'screenY': e.screenY,
			'offsetX': e.offsetX,
			'offsetY': e.offsetY,
			'layerX': e.layerX,
			'layerY': e.layerY,
			'x': e.x,
			'y': e.y,
			'originalEvent': e
		});
		e.touches = pointerTouches;
		touchBase.touching.call(touchBase, e);
	};
	var pointerMove = function(e){
		var i = pointerTouches.length;
		var match = false;
		var pointerId = e['pointerId'];
		while(i--) {
			if(pointerTouches[i]['pointerId'] == pointerId) {
				pointerTouches[i] = {
					'pointerId': e['pointerId'],
					'target': e.target,
					'pageX': e.pageX,
					'pageY': e.pageY,
					'clientX': e.clientX,
					'clientY': e.clientY,
					'screenX': e.screenX,
					'screenY': e.screenY,
					'offsetX': e.offsetX,
					'offsetY': e.offsetY,
					'layerX': e.layerX,
					'layerY': e.layerY,
					'x': e.x,
					'y': e.y,
					'originalEvent': e
				}
				match = true;
				break;
			}
			if(pointerTouches[i]['isPrimary'] && e['isPrimary'] && pointerTouches[i]['pointerId'] !== pointerId) {
				pointerTouches = [];
				match = false;
				touchInfo.singleSwipe = undefined;
				touchInfo.doubleSwipe = undefined;
				touchBase.maxTouches = 0;
				break;
			}
		}
		if(!match) {
			if(e['isPrimary']) {
				pointerTouches = [];
			}

			// this below was causing the touch api to always think we were touching the screen
			// only commented out for now - can't see that I would have put it in without
			// a reason in the first place!?

			// pointerTouches.push({
			//     pointerId: e.pointerId,
			//     target: e.target,
			//     pageX: e.pageX,
			//     pageY: e.pageY,
			//     clientX: e.clientX,
			//     clientY: e.clientY,
			//     screenX: e.screenX,
			//     screenY: e.screenY,
			//     offsetX: e.offsetX,
			//     offsetY: e.offsetY,
			//     layerX: e.layerX,
			//     layerY: e.layerY,
			//     x: e.x,
			//     y: e.y,
			//     originalEvent: e
			// });
		}
		e['touches'] = pointerTouches;
		touchBase.touching.call(touchBase, e);
	};
	var lastPointerOut = {};
	var lastMouseOut = {};
	var pointerEnd = function(e) {
		var i = pointerTouches.length;
		while(i--) {
			if(pointerTouches[i]['pointerId'] == e['pointerId']) {
				pointerTouches.splice(i, 1);
				break;
			}
		}
		e['touches'] = pointerTouches;
		touchBase.touchEnd.call(touchBase, e);
	};
	var pointerOut = function(e) {
		if(e.type==='mouseout' && e.toElement === null && e.relatedTarget === null) {
			lastMouseOut = {
				'clientX': e.clientX,
				'clientY': e.clientY
			}
			if(e.clientX === lastPointerOut.clientX && e.clientY === lastPointerOut.clientY && ((e.pageX <= 0 || e.pageX >= window.innerWidth) || (e.pageY <= 0 || e.pageY >= window.innerHeight))) {
				pointerEnd(lastPointerOut.e);
			}
		} else if (/pointerout/i.test(e.type)) {
			lastPointerOut = {
				'e': e,
				'pointerId': e['pointerId'],
				'clientX': e.clientX,
				'clientY': e.clientY
			}
		}
	};
	var pointerTouches = [];
	var touchBase = {
		isTouchable: typeof window['ontouchstart'] !== 'undefined' || window.navigator['msPointerEnabled'] === true,
		msPointerEnabled: (window.navigator['msPointerEnabled'] === true || window.navigator['pointerEnabled']),
		xThreshold: 20,
		yThreshold: 20,
		xEndThreshold: 40,
		yEndThreshold: 40,
		dThreshold: 25,
		pThreshold: 15,
		gradThreshold: 3,
		maxTouches: 0,
		dispatchEvent: function(type, info, e) {
			var touchEvent;
			var i = type.length;
			info['originalEvent'] = e;
			info['preventDefault'] = e['preventDefault'];
			info['cancelBubble'] = e['cancelBubble'];
			while (i--) {
				touchEvent = document.createEvent('HTMLEvents');

				for (var j in info) {
					if(/(x|y)displacement$/i.test(j)) {
						touchEvent[j] = 0 - info[j];
					} else {
						touchEvent[j] = info[j];
					}
				}

				touchEvent.initEvent(type[i], true, true);
				e.target.dispatchEvent(touchEvent);
			}
		},

		overLimit: function(change, limit) {
			return Math.abs(change) > limit;
		},

		gradCheck: function(grad, swipeDir) {
			grad = Math.abs(grad);
			return swipeDir === 'v' ? grad > this.gradThreshold : grad < (1/this.gradThreshold);
		},

		touching: function(e) {
			var o = this;
			var focus = o.getTouchInfo(e['touches']);
			var events = [];

			if (focus) {
				events = o.checkForEvents(focus);
				o.dispatchEvent(events, focus, e);
			}

			if (events.length > 1) {
				focus['xDisplacement'] = focus['startCenterX'] - focus['centerX'];
				focus['yDisplacement'] = focus['startCenterY'] - focus['centerY'];
				focus['xTravelDistance'] += Math.abs(focus['lastEvent']['centerX'] - focus['centerX']);
				focus['yTravelDistance'] += Math.abs(focus['lastEvent']['centerY'] - focus['centerY']);
				focus['lastEvent']['distance'] = focus['distance'];

				//reassign
				focus['lastEvent']['fingers'][0]['y'] = focus['fingers'][0]['y'];
				focus['lastEvent']['fingers'][0]['x'] = focus['fingers'][0]['x'];
				focus['lastEvent']['centerY'] = focus['centerY'];
				focus['lastEvent']['centerX'] = focus['centerX'];
				focus['lastEvent']['distance'] = focus['distance'];
				if (focus['fingers'][1]) {
					focus['lastEvent']['fingers'][1]['y'] = focus['fingers'][1]['y'];
					focus['lastEvent']['fingers'][1]['x'] = focus['fingers'][1]['x'];
				}
			}
		},

		getTouchInfo: function(touches) {
			var o = this;
			var focus, one, two;

			this.maxTouches = Math.max(touches.length, this.maxTouches);
			if (o.maxTouches === 1) {

				focus = touchInfo.singleSwipe = touchInfo.singleSwipe || {
					'fingers': [{
						'startX': touches[0].pageX,
						'startY': touches[0].pageY
					}],
					'lastEvent': {
						'fingers': [{
							'x': touches[0].pageX,
							'y': touches[0].pageY
						}]
					}
				};

				one = focus['fingers'][0];
				focus['centerX'] = one.x = touches[0].pageX;
				focus['centerY'] = one.y = touches[0].pageY;
				focus['distance'] = focus['startDistance'] = focus['lastEvent']['distance'] = 0;
				if (focus['startCenterX'] === undefined) {
					focus['lastEvent']['centerX'] = focus['startCenterX'] = focus['centerX'];
					focus['lastEvent']['centerY'] = focus['startCenterY'] = focus['centerY'];
					focus['lastEvent']['distance'] = focus['startDistance'] = focus['distance'];
					focus['xDisplacement'] = 0;
					focus['yDisplacement'] = 0;
					focus['xTravelDistance'] = 0;
					focus['yTravelDistance'] = 0;
				}

			} else if (o.maxTouches === 2 && touches.length === 2) {

				focus = touchInfo.doubleSwipe = touchInfo.doubleSwipe || {
					'fingers': [{
						'startX': touches[0].pageX,
						'startY': touches[0].pageY
					}, {
						'startX': touches[1].pageX,
						'startY': touches[1].pageY
					}],
					'lastEvent': {
						'fingers': [{
							'x': touches[0].pageX,
							'y': touches[0].pageY
						}, {
							'x': touches[1].pageX,
							'y': touches[1].pageY
						}]
					}
				};

				one = focus['fingers'][0];
				two = focus['fingers'][1];

				one.x = touches[0].pageX;
				one.y = touches[0].pageY;
				two.x = touches[1].pageX;
				two.y = touches[1].pageY;

				focus['centerX'] = one.x + ((one.x - two.x) / 2);
				focus['centerY'] = one.y + ((one.y - two.y) / 2);
				focus['distance'] = Math.sqrt(((one.x - two.x) * (one.x - two.x)) + ((one.y - two.y) * (one.y - two.y)));

				if (focus['startCenterX'] === undefined) {
					focus['lastEvent']['centerX'] = focus['startCenterX'] = focus['centerX'];
					focus['lastEvent']['centerY'] = focus['startCenterY'] = focus['centerY'];
					focus['lastEvent']['distance'] = focus['startDistance'] = focus['distance'];
					focus['xDisplacement'] = 0;
					focus['yDisplacement'] = 0;
					focus['xTravelDistance'] = 0;
					focus['yTravelDistance'] = 0;
				}
			}
			return focus;
		},

		checkForEvents: function(focus) {
			var o = this;
			var eventType = [];
			var chiny = 0;
			var chinx = 0;
			var chinDist = 0;
			var gradient = 0;
			var one = focus['fingers'][0];
			var two;

			if (o.maxTouches === 1) {
				chiny = focus['lastEvent']['fingers'][0].y - one.y;
				chinx = focus['lastEvent']['fingers'][0].x - one.x;
				gradient = chiny / chinx;
				if (o.overLimit(chiny, o.yThreshold) && o.gradCheck(gradient, 'v')) {
					eventType.push(chiny > 0 ? 'swipingUp' : 'swipingDown');
				} else if (o.overLimit(chinx, o.xThreshold) && o.gradCheck(gradient, 'h')) {
					eventType.push(chinx > 0 ? 'swipingLeft' : 'swipingRight');
				}
				if (one.y !== focus['startCenterY'] || one.x !== focus['startCenterX']) {
					eventType.push('swiping');
				}

			} else if (o.maxTouches === 2) {
				two = focus['fingers'][1] ? focus['fingers'][1] : null;

				chinDist = focus['lastEvent']['distance'] - focus['distance'];

				if (o.overLimit(chinDist, o.pThreshold)) {
					eventType.push(chinDist < 0 ? 'pinchingOut' : 'pinchingIn');
					focus['pinched'] = true;
				} else {
					chiny = focus['lastEvent']['centerY'] - focus['centerY'];
					chinx = focus['lastEvent']['centerX'] - focus['centerX'];
					gradient = chiny / chinx;
				}

				if (focus['pinched']) {
					eventType.push('pinching');
				}

				if (!focus['pinched']) {
					if (o.overLimit(chiny, o.yThreshold) && o.gradCheck(gradient, 'v')) {
						focus['dragged'] = true;
						eventType.push(chiny > 0 ? 'draggingUp' : 'draggingDown');
					} else if (o.overLimit(chinx, o.xThreshold) && o.gradCheck(gradient, 'h')) {
						focus['dragged'] = true;
						eventType.push(chinx > 0 ? 'draggingLeft' : 'draggingRight');
					}
					if (o.overLimit((Math.sqrt((chiny*chiny) + (chinx*chinx))), o.dThreshold)) {
						eventType.push('dragging');
					}
				}
			}
			return eventType;

		},

		touchEnd: function(e) {
			var o = this;
			var focus;
			var chiny = 0;
			var chinx = 0;
			var gradient = 0;
			var chinDist = 0;
			var xDispVsDist = 0;
			var yDispVsDist = 0;
			var singleDirection = true;
			var gestured = false;
			var reset = function() {
				o.maxTouches = 0;
				touchInfo.singleSwipe = undefined;
				touchInfo.doubleSwipe = undefined;
			};
			var eventType = [];

			if (o.maxTouches === 1 && e.touches.length === 0) {
				focus = touchInfo.singleSwipe;

				focus['xDisplacement'] = focus['startCenterX'] - focus['centerX'];
				focus['yDisplacement'] = focus['startCenterY'] - focus['centerY'];
				focus['xTravelDistance'] += Math.abs(focus['lastEvent']['centerX'] - focus['centerX']);
				focus['yTravelDistance'] += Math.abs(focus['lastEvent']['centerY'] - focus['centerY']);
				xDispVsDist = Math.abs(focus['xDisplacement']) - focus['xTravelDistance'];
				yDispVsDist = Math.abs(focus['yDisplacement']) - focus['yTravelDistance'];

				chiny = focus['fingers'][0]['startY'] - focus['fingers'][0]['y'];
				chinx = focus['fingers'][0]['startX'] - focus['fingers'][0]['x'];

				gradient = chiny / chinx;

				singleDirection = !(o.overLimit(yDispVsDist, o.yEndThreshold) || o.overLimit(xDispVsDist, o.xEndThreshold));

				if (o.overLimit(chiny, o.yThreshold) && o.gradCheck(gradient, 'v') && !o.overLimit(yDispVsDist, o.yThreshold) && singleDirection) {
					eventType.push(chiny > 0 ? 'swipeUp' : 'swipeDown');
				} else if (o.overLimit(chinx, o.xThreshold) && o.gradCheck(gradient, 'h') && !o.overLimit(xDispVsDist, o.xThreshold) && singleDirection) {
					eventType.push(chinx > 0 ? 'swipeLeft' : 'swipeRight');
				} else if (!o.overLimit(chiny, o.yThreshold) && !o.overLimit(chinx, o.xThreshold)) {
					eventType.push('tap');
				}

				if(eventType[0] !== 'tap') {
					eventType.push('swipe');
				}

			} else if (o.maxTouches === 2 && e.touches.length === 0) {
				focus = touchInfo.doubleSwipe;
				chinDist = focus['startDistance'] - focus['distance'];

				focus['xDisplacement'] = focus['startCenterX'] - focus['centerX'];
				focus['yDisplacement'] = focus['startCenterY'] - focus['centerY'];
				focus['xTravelDistance'] += Math.abs(focus['lastEvent']['centerX'] - focus['centerX']);
				focus['yTravelDistance'] += Math.abs(focus['lastEvent']['centerY'] - focus['centerY']);
				xDispVsDist = Math.abs(focus['xDisplacement']) - focus['xTravelDistance'];
				yDispVsDist = Math.abs(focus['yDisplacement']) - focus['yTravelDistance'];

				singleDirection = !(o.overLimit(yDispVsDist, o.yEndThreshold) || o.overLimit(xDispVsDist, o.xEndThreshold));

				if (o.overLimit(chinDist, o.pThreshold)) {
					eventType.push(chinDist < 0 ? 'pinchOut' : 'pinchIn');
					gestured = true;
				} else {
					chiny = focus['startCenterY'] - focus['centerY'];
					chinx = focus['startCenterX'] - focus['centerX'];
					gradient = chiny / chinx;
				}

				if (!gestured) {
					if (o.overLimit(chiny, o.yThreshold) && o.gradCheck(gradient, 'v') && singleDirection) {
						eventType.push(chiny > 0 ? 'dragUp' : 'dragDown');
					} else if (o.overLimit(chinx, o.xThreshold) && o.gradCheck(gradient, 'h') && singleDirection) {
						eventType.push(chinx > 0 ? 'dragLeft' : 'dragRight');
					}

					if(!o.overLimit(chiny, o.yThreshold) && !o.overLimit(chinx, o.xThreshold)) {
						eventType.push('twoTap');
					} else {
						eventType.push('drag');
					}
				}
			}

			if (eventType.length) {
				o.dispatchEvent(eventType, focus, e);
			}
			if(e['touches'].length === 0) {
				reset();
			}
		},

		changeTouchBase: function(newBase){
			var needsMSprefix;
			if(this.isTouchable) {
				if(this.msPointerEnabled) {
					needsMSprefix = typeof window['onpointercancel'] === 'undefined';
					if(this.oldBase) {
						this.oldBase.removeEventListener(needsMSprefix ? 'MSPointerDown' : 'pointerdown', pointerStart, false);
						this.oldBase.removeEventListener(needsMSprefix ? 'MSPointerMove' : 'pointermove', pointerMove, false);
						this.oldBase.removeEventListener(needsMSprefix ? 'MSPointerUp' : 'pointerup', pointerEnd, false);
						this.oldBase.removeEventListener(needsMSprefix ? 'MSPointerCancel' : 'pointercancel', pointerEnd, false);
						this.oldBase.removeEventListener(needsMSprefix ? 'MSPointerOut' : 'pointerout', pointerEnd, false);
						this.oldBase.removeEventListener('mouseout', pointerOut, false);
					} else {
						this.oldBase = newBase;
					}
					newBase.addEventListener(needsMSprefix ? 'MSPointerDown' : 'pointerdown', pointerStart, false);
					newBase.addEventListener(needsMSprefix ? 'MSPointerMove' : 'pointermove', pointerMove, false);
					newBase.addEventListener(needsMSprefix ? 'MSPointerUp' : 'pointerup', pointerEnd, false);
					newBase.addEventListener(needsMSprefix ? 'MSPointerCancel' : 'pointercancel', pointerEnd, false);
					newBase.addEventListener(needsMSprefix ? 'MSPointerOut' : 'pointerout', pointerOut, false);
					newBase.addEventListener('mouseout', pointerOut, false);
				} else {
					if(this.oldBase) {
						this.oldBase.removeEventListener('touchstart', passTouch, false);
						this.oldBase.removeEventListener('touchmove', passTouch, false);
						this.oldBase.removeEventListener('touchend', passTouchEnd, false);
						this.oldBase.removeEventListener('touchcancel', passTouchEnd, false);
					} else {
						this.oldBase = newBase;
					}
					newBase.addEventListener('touchstart', passTouch, false);
					newBase.addEventListener('touchmove', passTouch, false);
					newBase.addEventListener('touchend', passTouchEnd, false);
					newBase.addEventListener('touchcancel', passTouchEnd, false);
				}
			}
			if(this.oldBase) {
				this.oldBase.removeEventListener('mousedown', passMouseDown, false);
				this.oldBase.removeEventListener('mousemove', passMouseMove, false);
				this.oldBase.removeEventListener('mouseup', passMouseOut, false);
				this.oldBase.removeEventListener('mouseout', passMouseUp, false);
			} else {
				this.oldBase = newBase;
			}
			newBase.addEventListener('mousedown', passMouseDown, false);
			newBase.addEventListener('mousemove', passMouseMove, false);
			newBase.addEventListener('mouseup', passMouseUp, false);
			newBase.addEventListener('mouseout', passMouseOut, false);
		}
	};

	window['TOUCHJS'] = {
		'changeTouchBase': function(newBase) {
			touchBase.changeTouchBase.call(touchBase, newBase);
		},
		'setThresholds': function(props) {
			// thresholds = {
			//     swiping: {x:number, y:number},
			//     swipe: {x:number, y:number},
			//     pinch: number,
			//     gradient: number
			// }
			if(props['swiping']) {
				touchBase.xThreshold = props['swiping'].x || 20;
				touchBase.yThreshold = props['swiping'].y || 20;
			}
			if(props['swipe']) {
				touchBase.xEndThreshold = props['swipe'].x || 40;
				touchBase.yEndThreshold = props['swipe'].y || 40;
			}
			if(props['pinch']) {
				touchBase.pThreshold = props['pinch'];
			}
			if(props['gradient']) {
				touchBase.gradThreshold = props['gradient'];
			}
		}
	};

	//backwards compatibility
	window['changeTouchBase'] = window['TOUCHJS']['changeTouchBase'];

	changeTouchBase(window);
	//debug aid
	//window['touchBase'] = touchBase;
}());