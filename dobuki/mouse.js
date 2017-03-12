(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var spot = {x:0,y:0}, callbacks = [];
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
            for(var i=0;i<callbacks.length;i++) {
                callbacks[i](dx,dy);
            }
        }
        e.preventDefault();
    }

    function setOnTouch(func) {
        deactivateTouch();
        activateTouch();
        callbacks.push(func);
    }

    function activateTouch() {
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchend", onUp);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove);
    }

    function deactivateTouch() {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("touchstart", onDown);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
    }

    function destroyEverything() {
        callbacks = [];
        deactivateTouch();
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.setOnTouch = setOnTouch;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */

 })));