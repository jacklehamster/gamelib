(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
}(window, (function (core) { 'use strict';

    var canvases = {};
    var cuts = {};
    var cutArray = [];
    var cutCount = 0;
    window.ca = cuts;

    var textures = [null];
    var slots = {};
    var SPRITE_SHEET_SIZE = 2048;
    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);

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
    function getCanvas(url, canCreate) {
        if(!canvases[url] && canCreate) {
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
            } else {
                canvas.width = canvas.height = 1;
            }
            canvas.style.position = "absolute";
            canvas.style.left = 0;
            canvas.style.top = 0;
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

    function fetchCanvas(urlpipe, frame) {
        var canvas = getCanvas(frame+":"+urlpipe.join("|"));
        if (canvas) {
            return canvas;
        }

        if(urlpipe.length > 1) {
            canvas = getCanvas(frame+":"+urlpipe.join("|"), true);
            var subpipe = urlpipe.slice(0,urlpipe.length-1);
            var processString = urlpipe[urlpipe.length-1];
            var subCanvas = fetchCanvas(subpipe, frame);
            processCanvas(subCanvas, processString,canvas);
            subCanvas.addEventListener("update", function(event) {
                var subCanvas = event.currentTarget;
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(new CustomEvent("update"));
            });
            return canvas;
        } else {
            var url = urlpipe[0];
            canvas = getCanvas(frame+":"+url, true);

            //  check for width x height
            var size = url.split("x");
            if(size.length===2 && !isNaN(parseInt(size[0])) && !isNaN(parseInt(size[1]))) {
                canvas.width = parseInt(size[0]);
                canvas.height = parseInt(size[1]);
            } else if(core.isGif(url)) {
                var gif = core.getGif(url);
                canvas.setAttribute("animated", true);
                if(gif.frameInfos[frame] && gif.frameInfos[frame].ready) {
                    drawGif(gif, frame, canvas);
                } else {
                    gif.callbacks[frame] = drawGif.bind(null, gif, frame, canvas);
                }
            } else {
                var image = core.loadImage(url, function() {
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    initCanvas(canvas);
                    canvas.getContext("2d").drawImage(image,0,0);
//                    document.body.appendChild(canvas);
                    canvas.dispatchEvent(new CustomEvent("update"));
                });
            }
            return canvas;
        }
    }

    function drawGif(gif, frame, canvas) {
        canvas.width = gif.header.width;
        canvas.height = gif.header.height;
        initCanvas(canvas);
        canvas.getContext("2d").drawImage(gif.canvases[frame],0,0);
        canvas.dispatchEvent(new CustomEvent("update"));
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

    function getCut(index) {
        var cut = cutArray[index];
        var frame = cut && cut.animated ? DOK.getGif(cut.url).getFrame() : 0;
        if(cut && cut.cut[frame] && cut.cut[frame].ready) {
            return cut.cut[frame];
        }
        if(cut.url) {
            cut = getCutByURL(cut.url, frame);
            return cut.cut[frame];
        }
        return null;
    }

    function getCutByURL(url, frame) {
        if(cuts[url] && cuts[url].cut[frame] && cuts[url].cut[frame].ready) {
            return cuts[url];
        }

        var canvas = fetchCanvas(url.split("|"), frame);
        var slot = core.getSlot(canvas);

        var cut = cuts[url];
        if(!cut) {
            cut = {
                index: cutCount++,
                url: url,
                cut: [],
                animated: false,
            };
            cuts[url] = cut;
            cutArray[cut.index] = cut;
        }
        if(!cut.cut[frame]) {
            cut.cut[frame] = {
                tex: 0, uv: null, ready: false,
            };
        }

        if(slot) {
            slots[canvas.getAttribute("url")] = slot;
            canvas.addEventListener("update", updateSpritesheetEvent);
            canvas.dispatchEvent(new CustomEvent("update"));

            var uvX = slot.x / SPRITE_SHEET_SIZE;
            var uvY = slot.y / SPRITE_SHEET_SIZE;
            var uvW = canvas.width / SPRITE_SHEET_SIZE;
            var uvH = canvas.height / SPRITE_SHEET_SIZE;
            var uvOrder = planeGeometry.attributes.uv.array;

            var cutcut = [ uvX, 1-uvY-uvH, uvX+uvW, 1-uvY ];

            cut.animated = canvas.getAttribute("animated")==="true";
            cut.cut[frame].tex = slot.tex;
            cut.cut[frame].uv = new Float32Array(uvOrder.length);
            for(var u=0; u<uvOrder.length; u++) {
                cut.cut[frame].uv[u] = cutcut[uvOrder[u]*2 + u%2];
            }
            cut.cut[frame].ready = true;
//            console.log(canvas);
            return cut;
        } else {
            return cut;
        }
    }

    function preLoad(images,root) {
        if(root===undefined) {
            root = core.spritesheet;
        }
        if(typeof(images)==="string") {
            var cut = getCutByURL(images, 0);
            if(cut) {
                return cut.index;
            }
        } else {
            for(var prop in images) {
                if(images.hasOwnProperty(prop)) {
                    if(!root[prop]) {
                        root[prop] = [];
                    }
                    var index = core.preLoad(images[prop],root[prop]);
                    if (index!==null) {
                        root[prop] = index;
                    }
                }
            }
            return root;
        }
    }

    function updateSpritesheetEvent(event) {
        var canvas = event.currentTarget;
        var url = canvas.getAttribute("url");
        var slot = slots[url];
        var spritesheet = getCanvas("tex-"+slot.tex, true);
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
    core.fetchCanvas = fetchCanvas;
    core.spritesheet = {};
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */


 })));