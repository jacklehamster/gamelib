(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var keyboard = {};
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
    function destroyEverything() {
        clearListeners();
        keyboard = {};
    }
    
    function clearListeners() {
        document.removeEventListener("keydown", handleKey);
        document.removeEventListener("keyup", handleKey);
    }
    
    function addListeners() {
        document.addEventListener("keydown", handleKey);
        document.addEventListener("keyup", handleKey);
    }
    
    function handleKey(e) {
        if(e.target===document.body) {
            if(e.type === "keydown") {
                if(!keyboard[e.keyCode]) {
                    keyboard[e.keyCode] = core.time;
                }
            } else {
                delete keyboard[e.keyCode];
            }
            e.preventDefault();
        }
    }
    
    function keyDown(key) {
        return keyboard[key];
    }
    
    function anyKeyPressed(keys) {
        for(var i=0;i<arguments.length;i++) {
            if(keyDown(arguments[i])) {
                return true;
            }
        }
        return false;
    }

    var mov = [0,0];
    function getMove() {
        var dx = 0, dy=0;
        if(DOK.anyKeyPressed(87,38)) {
            dy++;
        }
        if(DOK.anyKeyPressed(83,40)) {
            dy--;
        }
        if(DOK.anyKeyPressed(65,37)) {
            dx--;
        }
        if(DOK.anyKeyPressed(68,39)) {
            dx++;
        }
        mov[0] = dx;
        mov[1] = dy;
        return mov;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.keyDown = keyDown;
    core.getMove = getMove;
    core.anyKeyPressed = anyKeyPressed;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    addListeners();
 })));