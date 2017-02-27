(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';

    var bucketsStack = [];
    var countsStack = [];
    var SIZE = 500;
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
    function initArray(size, depth) {
        if(!bucketsStack[depth]) {
            bucketsStack[depth] = new Array(size+1);
            countsStack[depth] = new Array(size+1);
        }
    }

    function getMinMax(array, offset, length) {
        var minNum = Number.MAX_VALUE;
        var maxNum = -Number.MAX_VALUE;
        var previousNum = -Number.MAX_VALUE;
        var inOrder = true;
        for(var i=0; i<length; i++) {
            var index = array[offset+i].zIndex;
            if(previousNum > index) {
                inOrder = false;
                if(index < minNum) {
                    minNum = index;
                }
            } else {
                if(index > maxNum) {
                    maxNum = index;
                }
            }
            previousNum = index;
        }
        getMinMax.result.min = minNum;
        getMinMax.result.max = maxNum;
        getMinMax.result.inOrder = inOrder;
        return getMinMax.result;
    }
    getMinMax.result = {
        min: 0,
        max: 0,
        inOrder: false,
    };

    function identity(a) {
        return a;
    }

 //   var indexFunction = null;
    function turboSort(array, size) {
   //     indexFunction = getIndex ? getIndex : identity;
        if(array) {
            size = size ? Math.min(size,array.length) : array.length;
            if(size > 1) {
                turboSortHelper(array, 0, size ? size : array.length, 0);
            }
        }
    }

    function quickSort(array, size) {
//        indexFunction = getIndex ? getIndex : identity;
        quickSortHelper(array, 0, size ? size-1 : array.length-1, compareIndex);
    }

    function compareIndex(a,b) {
        return a.zIndex - b.zIndex;
//        return indexFunction(a)-indexFunction(b);
    }

    function turboSortHelper(array, offset, length, depth) {
        if(length < 1000) {
            quickSortHelper(array, offset, offset+length-1, compareIndex);
            return;
        }
        initArray(SIZE, depth);
        var buckets = bucketsStack[depth];
        var counts = countsStack[depth];
        var arrayInfo = getMinMax(array, offset, length);
        if(arrayInfo.inOrder) {
            return;
        }
        var min = arrayInfo.min;
        var max = arrayInfo.max;
        var range = max-min;
        if(range===0) {
            return;
        }

        var i, index;
        for(i=0; i<SIZE; i++) {
            buckets[i] = 0;
            counts[i] = 0;
        }
        for(i=0; i<length; i++) {
//            index = Math.floor((SIZE-1) * (indexFunction(array[i+offset]) - min)/range);
            index = Math.floor((SIZE-1) * (array[i+offset].zIndex - min)/range);
            counts[index]++;
        }

        buckets[0] = offset;
        for(i=1; i<SIZE; i++) {
            buckets[i] = buckets[i-1] + counts[i-1];
        }
        buckets[SIZE] = length;
        counts[SIZE] = 1;
        var voyager = offset, bucketId = 0;
        while(bucketId<SIZE) {
//            index = Math.floor((SIZE-1) * (indexFunction(array[voyager]) - min)/range);
            index = Math.floor((SIZE-1) * (array[voyager].zIndex - min)/range);
            var newSpot = buckets[index] + --counts[index];
            swap(array,voyager,newSpot);
            while(!counts[bucketId]) {
                bucketId++;
            }
            voyager = buckets[bucketId];
        }
        for(i=0; i<SIZE; i++) {
            var bucketSize = buckets[i+1] - buckets[i];
            if(bucketSize > 1) {
                turboSortHelper(array, buckets[i], bucketSize, depth+1);
            }
        }
    }

    function swap(array, a, b) {
        if(a !== b) {
            var temp = array[a];
            array[a] = array[b];
            array[b] = temp;
        }
    }

    function quickSortHelper(arr, left, right, compare){
        var len = arr.length,
            pivot,
            partitionIndex;


        if(left < right){
            pivot = right;
            partitionIndex = partition(arr, pivot, left, right, compare);

            //sort left and right
            quickSortHelper(arr, left, partitionIndex - 1, compare);
            quickSortHelper(arr, partitionIndex + 1, right, compare);
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

    function destroyEverything() {
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.turboSort = turboSort;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    initArray(SIZE);

})));