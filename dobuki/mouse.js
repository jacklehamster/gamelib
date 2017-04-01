(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var spot = {x:0,y:0}, callbacks = [];
    var touchSpotX = {}, touchSpotY = {};
    var mdown = false;
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
    function onDown(e)
    {
        if(e.target.attributes['tap']===undefined) {
            var touches = e.changedTouches;
            if(touches) {
                for(var i=0;i<touches.length;i++) {
                    var touch = touches[i];
                    touchSpotX[touch.identifier] =touch.pageX;
                    touchSpotY[touch.identifier] =touch.pageY;
                }
            } else {
                spot.x = e.pageX;
                spot.y = e.pageY;
            }
            mdown = true;
            for(var i=0;i<callbacks.length;i++) {
                callbacks[i](null,null,true);
            }
        }
        e.preventDefault();
    }
    
    function onUp(e) {

        var hasTouch = false;
        if(e.changedTouches) {
            for(var i=0;i<e.changedTouches.length;i++) {
                delete touchSpotX[touch.identifier];
                delete touchSpotY[touch.identifier];
            }
            for(var i in touchSpotX) {
                hasTouch = true;
            }

        }

        for(var i=0;i<callbacks.length;i++) {
            callbacks[i](null,null, hasTouch);
        }
        mdown = false;
        e.preventDefault();
    }
    
    function onMove(e) {
        var touches = e.changedTouches;
        if(!touches) {
            if(e.buttons & 1 && mdown) {
                var newX = e.pageX;
                var newY = e.pageY;
                var dx = newX - spot.x;
                var dy = newY - spot.y;
                spot.x = newX;
                spot.y = newY;
                for(var i=0;i<callbacks.length;i++) {
                    callbacks[i](dx,dy,true);
                }
            } else {
                mdown = false;
            }
        } else if(mdown) {
            var dx = 0, dy = 0;
            for(var i=0;i<touches.length;i++) {
                var touch = touches[i];
                dx += touch.pageX - touchSpotX[touch.identifier];
                dy += touch.pageY - touchSpotY[touch.identifier];
                touchSpotX[touch.identifier] = touch.pageX;
                touchSpotY[touch.identifier] = touch.pageY;
            }
            for(var i=0;i<callbacks.length;i++) {
                callbacks[i](dx,dy,true);
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
        document.addEventListener("touchcancel", onUp);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove);
    }

    function deactivateTouch() {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("touchstart", onDown);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
        document.removeEventListener("touchcancel", onUp);
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