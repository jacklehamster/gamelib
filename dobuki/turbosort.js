(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';

    var bucketsStack = [];
    var countsStack = [];
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
    function initArray(size, depth) {
        if(!bucketsStack[depth]) {
            bucketsStack[depth] = new Array(size+1);
            countsStack[depth] = new Array(size+1);
        }
    }

    function getMinMaxOrder(array, offset, length) {
        var minNum = Number.MAX_VALUE;
        var maxNum = -Number.MAX_VALUE;
        var sorted = true;
        var previousIndex = -Number.MAX_VALUE;
        for(var i=0; i<length; i++) {
            var index = indexFunction(array[offset+i]);
            minNum = Math.min(minNum, index);
            maxNum = Math.max(maxNum, index);
            if(sorted && previousIndex > index) {
                sorted = false;
            } else {
                previousIndex = index;
            }
        }
        if(!getMinMaxOrder.result) {
            getMinMaxOrder.result = {
                min: 0,
                max: 0,
                sorted: false,
            };
        }
        getMinMaxOrder.result.min = minNum;
        getMinMaxOrder.result.max = maxNum;
        getMinMaxOrder.result.sorted = sorted;
        return getMinMaxOrder.result;
    }

    function identity(a) {
        return a;
    }

    var indexFunction = null;
    function turboSort(array, getIndex) {
        indexFunction = getIndex ? getIndex : identity;
        turboSortHelper(array, 0, array.length, 0);
    }

    function quickSort(array, getIndex) {
        indexFunction = getIndex ? getIndex : identity;
        quickSortHelper(array, 0, array.length-1, compareIndex);
    }

    function compareIndex(a,b) {
        return indexFunction(a)-indexFunction(b);
    }

    function turboSortHelper(array, offset, length, depth) {
        if(length < 1000) {
            quickSortHelper(array, offset, offset+length-1, compareIndex);
            return;
        }
        initArray(SIZE, depth);
        var buckets = bucketsStack[depth];
        var counts = countsStack[depth];
        var arrayInfo = getMinMaxOrder(array, offset, length);
        if (arrayInfo.sorted) {
            return;
        }
        var min = arrayInfo.min;
        var max = arrayInfo.max;
        var range = max-min;

        var i, index;
        for(i=0; i<SIZE; i++) {
            buckets[i] = 0;
            counts[i] = 0;
        }
        for(i=0; i<length; i++) {
            index = Math.floor((SIZE-1) * (indexFunction(array[i+offset]) - min)/range);
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
            index = Math.floor((SIZE-1) * (indexFunction(array[voyager]) - min)/range);
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
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
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
    core.quickSort = quickSort;
    core.getMinMaxOrder = getMinMaxOrder;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    initArray(SIZE);

})));