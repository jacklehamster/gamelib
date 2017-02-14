(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var spot = {x:0,y:0};
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
    function onDown(e) {
        var touches = e.changedTouches;
        if(touches) {
            spot.x = touches[0].pageX;
            spot.y = touches[0].pageY;
        } else {
            spot.x = e.pageX;
            spot.y = e.pageY;
        }
        e.preventDefault();
    }
    
    function onUp(e) {
        e.preventDefault();        
    }
    
    function onMove(e) {
        var touches = e.changedTouches;
        if(e.buttons & 1 || touches) {
            var dx = (touches ? touches[0].pageX : e.pageX) - spot.x;
            var dy = (touches ? touches[0].pageY : e.pageY) - spot.y;
        }
        e.preventDefault();
    }    

    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove);    
     
 })));