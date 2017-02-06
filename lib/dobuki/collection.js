(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'utils.js',
    ]);
    core.logScript();

    function Collection() {
        if(core.checkParams(arguments,"array")) {
            var array = arguments[0];
            Object.defineProperty(this, "length", {
                get: function() { 
                    return array.length; 
                }
            });
            this.at = array.at;
        } else if(core.checkParams(arguments,"function","function")) {
            var countFunction = arguments[0];
            var atFunction = arguments[1];
            Object.defineProperty(this, "length", {get: countFunction});
            this.at = atFunction;
        } else if(core.checkParams(arguments,"number","function")) {
            var count = arguments[0];
            var atFunction = arguments[1];
            this.length = count;
            this.at = atFunction;
        } else {
            core.handleError("Invalid parameters for Collection.", arguments);
        }
    }
    
    function GridCollection() {
        if(core.checkParams(arguments,"object","function")) {
            var dimensions = arguments[0];
            var cellFunction = arguments[1];
            
            Object.defineProperty(this, "length", {
                get: function() {
                    return dimensions.width * dimensions.height;
                }
            })
            this.at = function(index) {
                return cellFunction(
                    index%dimensions.width + dimensions.x, 
                    Math.floor(index/dimensions.width) + dimensions.y
                );
            };
            this.cell = cellFunction;
            
        } else {
            core.handleError("Invalid parameters for GridCollection.", arguments);
        }
    }
    
    function FlatCollection(collection, options) {
        var version = -1, updateVersion = 0;
        var updateTime = 0;
        var array = [];
        options = options || {};
        
        this.dynamic = options.dynamic;
        
        var self = this;
        function checkUpdate() {
            if(self.dynamic && updateTime<core.time) {
                self.needsUpdate = true;
            }
            if(self.needsUpdate) {
                updateTime = core.time;
                self.needsUpdate = false;
                array.length = 0;
                aggregate(collection, array);
            }
        }
        
        function aggregate(collection, array) {
            var length = collection.length;
            for(var i=0; i<length; i++) {
                var elem = collection.at(i);
                if(elem.visible===false) {
                    continue;
                }
                if(elem && typeof(elem)==='object' 
                    && typeof(elem.length)==='number'
                    && typeof(elem.at)==='function') {
                        aggregate(elem, array);
                } else if(elem!==null && elem!==undefined) {
                    array.push(elem);
                }
            }
        }
        
        Object.defineProperty(this, "length", {
            get: function() {
                checkUpdate();
                return array.length;
            },
        });
        
        this.at = function(index) {
            checkUpdate();
            return array[index];
        }
        
        Object.defineProperty(this, "needsUpdate", {
            get: function() { return version<updateVersion; },
            set: function(value) {
                if(value) {
                    updateVersion = version + 1;
                } else {
                    version = updateVersion;
                }
            },
        });        
    }
    
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