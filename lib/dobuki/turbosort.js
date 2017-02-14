(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';

    var buckets;
    var counts;
    var SIZE = 1000;
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
    function initArray(size) {
        buckets = new Array(size+1);
        counts = new Array(size);
    }


    function turbosort(array, offset, length, indexFunction) {
        var i, index;
        for(i=0; i<SIZE;i++) {
            buckets[i] = 0;
            counts[i] = 0;
        }
        for(i=0; i<length;i++) {
            index = indexFunction(array[i]);
            counts[index]++;
        }
        for(i=1; i<SIZE; i++) {
            buckets[i] = buckets[i-1] + counts[i-1];
        }
        buckets[SIZE] = length;
        console.log(buckets);
        console.log(counts);
        var voyager = 0;
        for(i=0;i<length;i++) {
            index = indexFunction(array[i]);
            swap(array,i,buckets[index] + --counts[index]);
        }
        console.log(buckets);
        console.log(counts);
    }

    function swap(array, a, b) {
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }

    function destroyEverything() {
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.turbosort = turbosort;
    core.swap = swap;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    initArray(SIZE);

})));