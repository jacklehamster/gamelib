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
        'jsgif',
    ]);
    core.logScript();

    var currentScript = core.getCurrentScript();
    var gifWorker;
    var gifWorkerCallbacks = {};
    var gifs = {};

    /**
     *  CLASS DEFINITIONS
     */

    /**
     *  FUNCTION DEFINITIONS
     */
    function isGif(src) {
        return gifs[src] && gifs[src].block || src.split("?")[0].slice(-4).toLowerCase() === ".gif" || src.indexOf("data:image/gif;") === 0;
    }

    function getGif(src) {
        if (!gifs[src]) {
            gifs[src] = createGif(src);
        }
        return gifs[src];
    }

    function createGif(src) {
        var renderTime = 0;
        var currentFrame = 0;

        var gifInfo = {
            framesProcessed: 0,
            header: null,
            frameInfos: [],
            block: null,
            canvases: [],
            callbacks: [],
            processNextFrame: function() {
                var frame = this.framesProcessed;
                var frameInfo = this.frameInfos[frame];

                if(frameInfo && frameInfo.gce && frameInfo.img && this.header) {
                    var canvas = document.createElement("canvas");
                    canvas.style.position = "absolute";
                    canvas.style.left = 0;
                    canvas.style.top = 0;
                    canvas.width = this.header.width;
                    canvas.height = this.header.height;
                    var ctx = canvas.getContext("2d");
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;

                    this.canvases[frame] = canvas;
                    if(frame>0) { //  copy previous frame. That's how gifs work
                        ctx.drawImage(this.canvases[frame-1], 0, 0);
                    }

                    var cData = ctx.getImageData(0,0,canvas.width,canvas.height);

                    var self = this;
                    var processNext = this.processNextFrame.bind(this);
                    sendToGifWorker(frameInfo, cData, this.header, function(cData, frameInfo) {
                        ctx.putImageData(cData, 0, 0);
                        if(self.callbacks[frameInfo.frame]) {
                            self.callbacks[frameInfo.frame]();
                        }
                        self.frameInfos[frameInfo.frame].ready = true;
                        processNext();
                    });
                    currentFrame = this.framesProcessed;
                    this.framesProcessed++;
//                    document.body.appendChild(canvas);
                }
            },
            hdr: function (hdr) {
                this.header = hdr;
            },
            gce: function (gce) {
                if(this.frameInfos.length==0 || this.frameInfos[this.frameInfos.length-1].gce) {
                    this.frameInfos.push({
                        gce:null,
                        cycleTime:null,
                        img:null,
                        frame: this.frameInfos.length,
                        ready: false,
                    });
                }
                var currentIndex = this.frameInfos.length-1;
                this.frameInfos[currentIndex].gce = gce;
                if(!gce.delayTime) {
                    gce.delayTime = 1;
                }
                this.frameInfos[currentIndex].cycleTime = gce.delayTime * 10
                    + (currentIndex === 0 ? 0 : this.frameInfos[currentIndex-1].cycleTime);
                this.processNextFrame();
            },
            img: function(img) {
                if(this.frameInfos.length==0 || this.frameInfos[this.frameInfos.length-1].img) {
                    this.frameInfos.push({});
                }
                this.frameInfos[this.frameInfos.length-1].img = img;
                this.processNextFrame();
            },
            getFrame: function() {
                if(this.block && core.time > renderTime) {
                    currentFrame = (currentFrame+1) % this.frameInfos.length;
                    var totalAnimationTime = this.frameInfos[this.frameInfos.length-1].cycleTime;
                    renderTime = Math.floor(core.time / totalAnimationTime) * totalAnimationTime + this.frameInfos[currentFrame].cycleTime;
                }
                return currentFrame;
            },
            eof: function(block) {
                this.block = block;
                this.processNextFrame();
            }
        };
        
        core.loadAsync(src, function(content) {
            parseGIF(new Stream(content), gifInfo);
        }, true);

        return gifInfo;
    }
    
    function initializeGifWorker() {
        gifWorker = new Worker(currentScript.path + "workers/gifworker.js");
        gifWorker.onmessage = function(e) {
           gifWorkerCallbacks[e.data.id] (e.data.response.cData, e.data.response.frameInfo);
           delete gifWorkerCallbacks[e.data.id];
        }
    }
    
    function sendToGifWorker(frameInfo, cData, header, callback) {
        if(!gifWorker) {
            initializeGifWorker();
        }
        var id = md5(Math.random()+""+core.time);
        gifWorkerCallbacks[id] = callback;
        gifWorker.postMessage({
            frameInfo: frameInfo,
            cData: cData,
            header: header,
            id: id
        }, [cData.data.buffer]);
    }
                 
    function destroyEverything() {
        if(gifWorker) {
            gifWorker.terminate();
        }
        gifWorker = null;
        gifWorkerCallbacks = null;
        gifs = {};
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getGif = getGif;
    core.isGif = isGif;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
     
     
 })));