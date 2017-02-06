(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
    function definePrototypes() {
        if(typeof(String.prototype.trim) === "undefined")
        {
            String.prototype.trim = function() {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }    
        
        if(typeof(Array.prototype.at) === 'undefined') {
            Array.prototype.at = function(index) {
                return this[index];
            };
        }
        
        Array.prototype.sort = function(compare) {
            quickSort(this, 0, this.length-1, compare);
            return this;
        }
    }
   
    function loadAsync(src, callback, binary, method, data) {
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

 })));
