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

        function quickSort(arr, left, right, compare){
            var len = arr.length,
                pivot,
                partitionIndex;


            if(left < right){
                pivot = right;
                partitionIndex = partition(arr, pivot, left, right, compare);

                //sort left and right
                quickSort(arr, left, partitionIndex - 1, compare);
                quickSort(arr, partitionIndex + 1, right, compare);
            }
            return arr;
        }

        function partition(arr, pivot, left, right, compare){
            var pivotValue = arr[pivot],
                partitionIndex = left;

            for(var i = left; i < right; i++){
                if(compare(arr[i] , pivotValue)<0){
                    swap(arr, i, partitionIndex);
                    partitionIndex++;
                }
            }
            swap(arr, right, partitionIndex);
            return partitionIndex;
        }



        function swap(arr, i, j){
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }

        Array.prototype.sort = function(compare) {
            quickSort(this, 0, this.length-1, compare);
            return this;
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
    definePrototypes();

    loadAsync("package.json", function(str) {
        try {
            var object = JSON.parse(str);
            document.title = object.window.title;
        } catch(e) {
        }
    });

 })));
