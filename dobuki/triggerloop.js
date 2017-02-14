(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var count = 0;
    var triggers = {};
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'loop.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
    function trigger(cell) {
        var id = cell.id ? cell.id : cell.x+"_"+cell.y;
        if(!triggers[id]) {
            count++;
        }
        triggers[id] = cell;
        if(count===1) {
            DOK.addLoop(triggerLoop);
        }
    }
    function untrigger(cell) {
        var id = cell.id ? cell.id : cell.x+"_"+cell.y;
        if(trigger[id]) {
            count--;
        }
        delete triggers[id];
        if(!count) {
            DOK.removeLoop(triggerLoop);
        }
    }
    function triggered(cell) {
        var id = cell.id ? cell.id : cell.x+"_"+cell.y;
        return triggers[id];
    }
    
    function clearTriggers() {
        for(var i in triggers) {
            delete triggers[i];
        }
    }
    
    function triggerLoop() {
        for(var i in triggers) {
            if(triggers[i].loop) {
                triggers[i].loop();
            }
        }
    }
    
    function destroyEverything() {
        clearTriggers();
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.trigger = trigger;
    core.untrigger = untrigger;
    core.triggered = triggered;
    core.clearTriggers = clearTriggers;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    DOK.addLoop(triggerLoop);
     
 })));