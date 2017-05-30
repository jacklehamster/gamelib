(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
 
    var coreLoops = null;
    var frame = 0;
    var fps = 0;
    var period = Math.floor(1000/60);
    var nextTime = 0;
    var lastCount = 0;

    var frameCount = 0;

    /**
    *  FUNCTION DEFINITIONS
    */
    function loop(time) {
        if(coreLoops) {
            var loops = coreLoops;
            requestAnimationFrame( loop );
            if(time<=core.time + period) {
                return;
            }
            core.time = Math.floor(time/period)*period;
            for(var i=0;i<loops.length;i++)  {
                loops[i]();
            }
            frameCount ++;
            if(time-lastCount>1000) {
                fps = frameCount;
                frameCount = 0;
                lastCount = time;
            }
        }
    }

    function addLoop(callback) {
        if(coreLoops===null) {
            coreLoops = [];
            beginLoop();
        }
        coreLoops.push(callback);
    }

    function removeLoop(callback) {
        if(coreLoops) {
            var index = coreLoops.indexOf(callback);
            coreLoops.splice(index, 1);
            if(coreLoops.length===0) {
                coreLoops = null;
            }
        }
    }

    function beginLoop() {
        loop(0);
    }

    function loopTime() {
        return performance.now() - core.time;
    }

    function destroyEverything() {
        coreLoops = null;
        frame = 0;
        fps = 0;
        period = Math.floor(1000/60);
        nextTime = 0;
        lastCount = 0;
        frameCount = 0;
    }

    /**
    *  PUBLIC DECLARATIONS
    */
    core.addLoop = addLoop;
    core.removeLoop = removeLoop;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    Object.defineProperty(core, "fps", {
        enumerable: false,
        configurable: false,
        get: function () {
            return fps;
        },
        set: function(value) {
            period = Math.floor(1000/value);
        }
    });


    /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
    core.time = 0;

 })));