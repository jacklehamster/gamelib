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

    var done = {
        value: undefined,
        done: true,
    };

    function Collection(func) {
        var index;
        var obj = {
            value: [0,0],
            done: false,
        };
        var it = {
            next: function() {
                var value = func(index);
                if(!value) {
                    return done;
                }
                obj.value[0] = index;
                obj.value[1] = value;
                index++;
                return obj;
            }
        };
        this.entries = function() {
            index = 0;
            return it;
        };
    }
    Collection.prototype.entries = null;

    function GridCollection(cellFunction, properties) {
        if(properties) {
            var names = Object.getOwnPropertyNames(properties);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                this[name] = properties[name];
            }
        }
        this.cell = cellFunction.bind(this);
        var x = 0, y = 0;
        var obj = {
            value: [0,0],
            done: false,
        };
        var self = this;
        var it = {
            next: function() {
                if (y >= self.height || !self.width) {
                    return done;
                }
                obj.value[0] = x + y * self.width;
                obj.value[1] = self.cell(x+self.x, y+self.y);
                x++;
                if(x >= self.width) {
                    x = 0; y++;
                }
                return obj;
            }
        };
        this.entries = function() {
            x = 0; y = 0;
            return it;
        };
    }
    GridCollection.prototype.cell = null;
    GridCollection.prototype.x = 0;
    GridCollection.prototype.y = 0;
    GridCollection.prototype.width = 0;
    GridCollection.prototype.height = 0;
    GridCollection.prototype.entries = null;

    function FlatCollection(collection) {
        var stack = [];
        var index = 0;
        var obj = {
            value: [0,0],
            done: false,
        };
        var it = {
            next : function() {
                if(stack.length===0) return done;
                do {
                    var topStack = stack[stack.length - 1];
                    var subObj = topStack.next();
                    var keepLooping = false;
                    if(subObj.done) {
                        stack.pop();
                        keepLooping = true;
                    } else if(subObj.value[1] && typeof(subObj.value[1].entries) === "function") {
                        stack.push(subObj.value[1].entries());
                        keepLooping = true;
                    }
                } while(keepLooping && stack.length);
                if(subObj.done) return done;
                obj.value[0] = index;
                obj.value[1] = subObj.value[1];
                index++;
                return obj;
            }
        };
        this.entries = function() {
            index = 0;
            stack.length = 0;
            stack.push(collection.entries());
            return it;
        }
    }
    FlatCollection.prototype.entries = null;
    
    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.Collection = Collection;
    core.GridCollection = GridCollection;
    core.FlatCollection = FlatCollection;
 })));