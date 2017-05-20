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

        if ( !window.requestAnimationFrame ) {
            setupRequestAnimationFrame();
        }

        if (typeof(Float32Array.prototype.fill) === 'undefined') {
            Float32Array.prototype.fill = fill_compat;
        }

        if (typeof(Uint32Array.prototype.fill) === 'undefined') {
            Uint32Array.prototype.fill = fill_compat;
        }

        Array.prototype.getFrame = function (index) {
            index = index|0;
            return this[index % this.length];
        };
        Number.prototype.getFrame = function () {
            return this;
        }

    }

    function fill_compat(value,start,end) {
        start = start||0;
        end = end||this.length;
        for(var i=start;i<end;i++) {
            this[i] = value;
        }
        return this;
    }

    function setupRequestAnimationFrame() {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                requestAnimationFrame_compat;

        } )();

        var timeout, time = 0;
        function requestAnimationFrame_compat( callback) {
            timeout = setTimeout( timeoutCallback, 1000 / 60 , callback);
        }

        function timeoutCallback(callback) {
            clearTimeout(timeout);
            var dt = Date.now() - time;
            callback(dt);
            time = Date.now();
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

    //      C
    //     748
    //    B3019
    //     625
    //      A


    function Roundabout() {
        this.x = 0;
        this.y = 0;
        this.left = -1;
        this.right = 1;
        this.top = -1;
        this.bottom = 1;
        this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up

        var point = [0,0];

        this.reset = function() {
            this.x = 0;
            this.y = 0;
            this.left = -1;
            this.right = 1;
            this.top = -1;
            this.bottom = 1;
            this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up
        };

        this.current = function() {
            point[0] = this.x;
            point[1] = this.y;
            return point;
        };

        this.next = function () {
            var point = this.current();
            switch(this.direction) {
                case 0:
                    this.x++;
                    if(this.x >= this.right) {
                        this.right++;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
                case 1:
                    this.y++;
                    if(this.y >= this.bottom) {
                        this.bottom++;
                        this.direction = (this.direction+1)%4;
                    }
                    break;
                case 2:
                    this.x--;
                    if(this.x <= this.left) {
                        this.left--;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
                case 3:
                    this.y--;
                    if(this.y <= this.top) {
                        this.top--;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
            }
            return point;
        }
    }

    function addLinkToHeadTag(rel, href) {
        var link = document.createElement("link");
        link.setAttribute("rel", rel);
        link.href = href;
        document.head.appendChild(link);
    }

    function setupQuaternionArrays() {
        core.groundQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1,0,0), -Math.PI/2
        ).toArray(new Float32Array(4));
        core.southQuaternionArray =  new THREE.Quaternion().toArray(new Float32Array(4));
        core.northQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), -Math.PI
        ).toArray(new Float32Array(4));
        core.westQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), -Math.PI/2
        ).toArray(new Float32Array(4));
        core.eastQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), Math.PI/2
        ).toArray(new Float32Array(4));
        core.ceilingQuaternionArray = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1,0,0), Math.PI/2
        ).toArray(new Float32Array(4));
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.loadAsync = loadAsync;
    core.Roundabout = Roundabout;
   
    /**
     *   PROCESSES
     */
    core.requireScripts(['setup.js']);
    core.logScript();
    core.title = "";
    definePrototypes();
    setupQuaternionArrays();

    loadAsync("package.json", function(str) {
        try {
            var object = JSON.parse(str);
            var icon = object.window.icon || 'lib/dobuki/images/logo.ico';
            document.title = core.title = object.window.title || 'Dobuki Game';
            addLinkToHeadTag("shortcut icon", icon);
            addLinkToHeadTag("apple-touch-icon", object.window['apple-touch-icon'] || icon);
        } catch(e) {
        }
    });

 })));
