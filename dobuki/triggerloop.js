(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var count = 0;
    var triggers = [];
    
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
        if (!triggers.length) {
            DOK.addLoop(triggerLoop);
        }
        if (triggers.indexOf(cell)<0) {
            triggers.push(cell);
        }
    }

    function untrigger(cell) {
        var index = triggers.indexOf(cell);
        if (index>=0) {
            triggers[index] = null;
        }
    }

    function triggered(cell) {
        return triggers.indexOf(cell) >= 0;
    }
    
    function clearTriggers() {
        triggers.length = 0;
    }
    
    function triggerLoop() {
        var removed = false;
        for(var i = 0; i < triggers.length; i++) {
            if(triggers[i] && triggers[i].loop) {
                if(triggers[i].loop() === false) {
                    delete triggers[i];
                    removed = true;
                }
            }
        }
        if (removed) {
            var j = 0;
            for(i=0; i<triggers.length;i++) {
                if(triggers[j]) {
                    triggers[j] = triggers[i];
                    j++;
                }
            }
            triggers.length = j;
            if (!triggers.length) {
                DOK.removeLoop(triggerLoop);
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

 })));