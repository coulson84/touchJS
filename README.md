touchJS
=======

A touchscreen API that goes hand-in-hand with [transformJS](https://github.com/coulson84/transformJS)

Usage
-------

**the interface of this library is subject to change - while every attempt will be made to keep documentation up to date, we can't guarantee that the documentation is 100% accurate**

To listen for touch events on an elements simply pass an object to the touch function with the following properties:

* element - a css selector string referring to the id or class of an element
* types - an array of strings listing the types of events you are interested in
* touchStartF - callback function for starting a touch gesture
* touchMoveF - callback function for touch gesture moves
* touchEndF - callback function for ending a touch gesture

E.g.
	touch({
		element:'#box',
		types:['all'],
		touchStartF:function(e){
			console.log(e);
		},
		touchMoveF:function(e){
			console.log(e);
		}
	});