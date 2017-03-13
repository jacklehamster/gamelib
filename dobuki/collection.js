(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
}(window, (function (core) { 'use strict';
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'utils.js',
    ]);
    core.logScript();

    function nop() {
    }

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : nop;
        if(forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch(this.options.type) {
                case "grid":
                    this.forEach = Grid_forEach.bind(this);
                    break;
                default:
                    core.handleError('Collection type not recognized');
                    break;
            }
        }
    }
    Collection.prototype.pos = null;
    Collection.prototype.size = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.forEach = nop;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.isCollection = true;

    /**
     *  FUNCTION DEFINITIONS
     */
    function Grid_forEach(callback) {
        var count = this.options.count || 1;
        var gridCount = this.options.width*this.options.height;
        var length = gridCount*count;
        for(var i=0; i<length; i++) {
            var x = this.options.x + i%this.options.width;
            var y = this.options.y + Math.floor(i/this.options.width) % this.options.height;
            var c = Math.floor(i / gridCount);
            var obj = this.getSprite(x,y,c);
            if(obj) {
                if(obj.forEach) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    }

    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.Collection = Collection;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
})));