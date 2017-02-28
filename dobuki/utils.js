(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
    function definePrototypes() {
        if(typeof(String.prototype.trim) === "undefined") {
            String.prototype.trim = function() {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }

        if(true || typeof(Array.prototype.entries) === "undefined") {
            Array.prototype.entries = function() {
                return makeIterable(this);
            };
            Array.prototype.it = null;
        }

        var done = {
            value: undefined,
            done: true,
        };
        function makeIterable(array) {
            var it = array.it ? array.it : {
                index: 0,
                array: null,
                obj: {
                    value: [0, 0],
                    done: false,
                },
                next: function next() {
                    if (this.index >= this.array.length) {
                        return done;
                    }
                    var obj = this.obj;
                    obj.value[0] = this.index;
                    obj.value[1] = this.array[this.index];
                    this.index++;
                    return obj;
                }
            };
            array.it = it;
            it.array = array;
            it.index = 0;
            return it;
        }
    }

    function loadAsyncHelper(src, result, index, callback, binary, method, data) {
        loadAsync(src, function(value) {
            result[index] = value;
            for(var i=0; i<result.length; i++) {
                if(result[i]===undefined) {
                    return;
                }
            }
            callback.apply(null, result);
        }, binary, method, data);
    }

    function loadAsync(src, callback, binary, method, data) {
        if(Array.isArray(src)) {
            var result = new Array(src.length);
            for(var i=0; i<src.length; i++) {
                loadAsyncHelper(src[i], result, i, callback);
            }

        } else {
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType(binary ? "text/plain; charset=x-user-defined" : "text/plain; charset=UTF-8");
            xhr.open(method?method:"GET", src, true);
            xhr.addEventListener('load',
                function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            callback(xhr.responseText);
                        } else {
                            core.handleError(xhr.responseText);
                        }
                    }
                }
            );
            xhr.addEventListener('error',
                function (e) {
                    core.handleError(e);
                }
            );
            xhr.send(data);
        }
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.loadAsync = loadAsync;
   
    /**
     *   PROCESSES
     */
    core.requireScripts(['setup.js']);
    core.logScript();
    core.title = "";
    definePrototypes();

    loadAsync("package.json", function(str) {
        try {
            var object = JSON.parse(str);
            document.title = core.title = object.window.title;
            var link = document.createElement("link");
            link.setAttribute("rel", "shortcut icon");
            link.href = object.window.icon;
            document.head.appendChild(link);
        } catch(e) {
        }
    });

 })));
