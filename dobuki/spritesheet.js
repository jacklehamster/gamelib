(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(window, (function (core) { 'use strict';

    var canvases = {};
    var cuts = {};
    var textures = [null];
    var slots = {};
    var SPRITE_SHEET_SIZE = 2048;

    /**
     *  HEADER
     */
    core.requireScripts([
        'setup.js',
        'threejs',
        'packer.js',
        'imageloader.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCanvas(url) {
        if(!canvases[url]) {
            var canvas = canvases[url] = document.createElement('canvas');
            canvas.setAttribute("url", url);
            if(url.indexOf("tex-")===0) {
                canvas.width = canvas.height = SPRITE_SHEET_SIZE;
                var index = parseInt(url.split("-").pop());
                var tex = new THREE.Texture(canvas);
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.LinearMipMapLinearFilter;
                canvas.addEventListener("update", updateTextureEvent);
                textures[index] = tex;
                canvas.setAttribute("texture", index.toString());

//                document.body.appendChild(canvas);
                canvas.style.position = "absolute";
                canvas.style.left = 0;
                canvas.style.top = 0;
            } else {
                canvas.width = canvas.height = 1;
            }
            initCanvas(canvas);
        }
        return canvases[url];
    }

    function initCanvas(canvas) {
        var context = canvas.getContext("2d");
        context.webkitImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
    }

    function fetchCanvas(urlpipe) {
        var canvas;
        if(canvases[urlpipe.join("|")]) {
            canvas = getCanvas(urlpipe.join("|"));
            return canvas;
        }

        if(urlpipe.length > 1) {
            canvas = getCanvas(urlpipe.join("|"));
            var subpipe = urlpipe.slice(0,urlpipe.length-1);
            var processString = urlpipe[urlpipe.length-1];
            var subCanvas = fetchCanvas(subpipe);
            processCanvas(subCanvas, processString,canvas);
            subCanvas.addEventListener("update", function(event) {
                var subCanvas = event.currentTarget;
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(new CustomEvent("update"));
            });
            return canvas;
        } else {
            var url = urlpipe[0];
            canvas = getCanvas(url);
            var image = core.loadImage(url,
                function() {
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    initCanvas(canvas);
                    canvas.getContext("2d").drawImage(image,0,0);
                    canvas.dispatchEvent(new CustomEvent("update"));
                }
            );
            return canvas;
        }
    }

    function processCanvas(canvas, processString, outputCanvas) {
        //  check size split
        var outputCtx = outputCanvas.getContext("2d");
        var splits = processString.split(",");
        if(splits.length===4 && splits.every(function(num) { return !isNaN(num); })) {
            splits = splits.map(function(o) { return parseInt(o); });
            var drawWidth = Math.min(canvas.width, splits[2]);
            var drawHeight = Math.min(canvas.height, splits[3]);
            outputCanvas.width = drawWidth;
            outputCanvas.height = drawHeight;
            initCanvas(outputCanvas);
            outputCtx.drawImage(canvas,
                splits[0], splits[1], drawWidth, drawHeight,
                0,0,drawWidth,drawHeight
            );
        } else if(processString.indexOf("scale:")===0) {
            if(canvas.width>1 && canvas.height>1) {
                var scale = processString.split(":")[1].split(",");
                outputCanvas.width = Math.ceil(canvas.width * Math.abs(scale[0]));
                outputCanvas.height = Math.ceil(canvas.height * Math.abs(scale[1%scale.length]));
                initCanvas(outputCanvas);
                if(scale[0]<0 || scale[1%scale.length]<0) {
                    var sign = [
                        scale[0]<0?-1:1,
                        scale[1%scale.length]<0?-1:1,
                    ];
                    outputCtx.translate(
                        sign[0]<0?outputCanvas.width:0,
                        sign[1]<0?outputCanvas.height:0);
                    outputCtx.scale(sign[0], sign[1]);
                }
                outputCtx.drawImage(canvas,
                    0,0,canvas.width,canvas.height,
                    0,0,outputCanvas.width,outputCanvas.height
                );
                outputCtx.restore();
            }
        } else if(processString.indexOf("border")===0) {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            outputCtx.drawImage(canvas,0,0);
            outputCtx.rect(0,0,canvas.width-1,canvas.height-1);
            outputCtx.stroke();
        }
    }

    function getCut(url) {
        if(cuts[url]) {
            return cuts[url];
        }
        var canvas = fetchCanvas(url.split("|"));
        var slot = core.getSlot(canvas);
        if(slot) {
            slots[canvas.getAttribute("url")] = slot;
            canvas.addEventListener("update", updateSpritesheetEvent);
            canvas.dispatchEvent(new CustomEvent("update"));

            var uvX = slot.x / SPRITE_SHEET_SIZE;
            var uvY = slot.y / SPRITE_SHEET_SIZE;
            var uvW = canvas.width / SPRITE_SHEET_SIZE;
            var uvH = canvas.height / SPRITE_SHEET_SIZE;
            var cut = {
                tex:slot.tex,
                cut:[
                    uvX, 1-uvY-uvH, uvX+uvW, 1-uvY,
                ],
                size: [ canvas.width, canvas.height, 1 ],
            };
            cuts[url] = cut;
            return cut;
        } else {
            return null;
        }
    }

    function preLoad(images) {
        if(typeof(images)==="string") {
            getCut(images);
        } else {
            for(var prop in images) {
                if(images.hasOwnProperty(prop))
                    core.preLoad(images[prop]);
            }
        }
    }

    function updateSpritesheetEvent(event) {
        var canvas = event.currentTarget;
        var slot = slots[canvas.getAttribute("url")];
        var spritesheet = getCanvas("tex-"+slot.tex);
        spritesheet.getContext("2d").drawImage(canvas,slot.x,slot.y);
        spritesheet.dispatchEvent(new CustomEvent("update"));
    }

    function updateTextureEvent(event) {
        var canvas = event.currentTarget;
        textures[parseInt(canvas.getAttribute("texture"))].needsUpdate = true;
    }

    function destroyEverything() {
        textures.forEach(function(tex) { if(tex)tex.dispose() });
        canvases = {};
        cuts = {};
        slots = {};
        textures = [null];
    }

    function getTextures() {
        return textures;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.getCut = getCut;
    core.getTextures = getTextures;
    core.preLoad = preLoad;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */


 })));