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
    ]);
    core.logScript();

    function nop() {
    }

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : nop;
        if(forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch(this.options.type) {
                case "grid":
                    this.forEach = Grid_forEach.bind(this);
                    break;
                default:
                    core.handleError('Collection type not recognized');
                    break;
            }
        }
    }
    Collection.prototype.pos = null;
    Collection.prototype.size = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.forEach = nop;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.isCollection = true;

    /**
     *  FUNCTION DEFINITIONS
     */
    function Grid_forEach(callback) {
        var count = this.options.count || 1;
        var gridCount = this.options.width*this.options.height;
        var length = gridCount*count;
        for(var i=0; i<length; i++) {
            var x = this.options.x + i%this.options.width;
            var y = this.options.y + Math.floor(i/this.options.width) % this.options.height;
            var c = Math.floor(i / gridCount);
            var obj = this.getSprite(x,y,c);
            if(obj) {
                if(obj.forEach) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    }

    function destroyEverything() {
    }

    function spriteFace(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = cellSize;
        var light = 1;
        var img = DOK.spritesheet.sprite[index];

        return DOK.create(DOK.SpriteObject).init(
            x*cellSize,y*cellSize,size/2,
            size,size,
            null,
            light,
            img
        );
    }

    var cubeFaces = [];
    function spriteCube(spriteInfo) {
        cubeFaces.length = 0;

        cube.faces.push(
            DOK.create(DOK.SpriteObject).init(
                x*cellSize,y*cellSize,size/2,
                size,size,
                DOK.southQuaternionArray,
                light,
                img
            )
        );


        return cubeFaces;
    }

    function createSpriteCollection(options) {
        var spriteHash = [];
        var areaSize = 50;
        var spriteRegistry = {};
        var cellSize = 64;

        var spriteFunction = function(spriteInfo) {
            switch(spriteInfo.type) {
                case 'face':
                    return spriteFace(spriteInfo);
                    break;
                case 'cube':
                    return spriteCube(spriteInfo);
                    break;
            }
        };
        if(options.spriteFunction) {
            spriteFunction = options.spriteFunction;
        }

        var spriteCount = 0;
        function SpriteInfo(x,y,index) {
            this.uid = 'uid'+spriteCount++;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x,y);
        }
        SpriteInfo.prototype.leaveArea = function() {
            var areaId = getAreaId(this.x,this.y);
            var area = spriteHash[areaId];
            if(area) {
                delete area[this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function(x,y) {
            this.x = x; this.y = y;
            var areaId = getAreaId(this.x,this.y);
            var area = spriteMap[areaId] || (spriteMap[areaId] = {});
            area[this.uid] = this;
        };
        SpriteInfo.prototype.move = function(x,y) {
            this.leaveArea();
            this.enterArea(x,y);
        };


        function getAreaId(x,y) {
            x = Math.floor(x/areaSize);
            y = Math.floor(y/areaSize);
            return x+"_"+y;
        }

        var spriteCollection = new DOK.Collection(
            options,
            spriteFunction,
            function(callback) {
                var camPos = getCamPos();
                var xArea = Math.floor(camPos.x / areaSize);
                var yArea = Math.floor(camPos.y / areaSize);
                var range = 1;
                for(var y=yArea-range;y<=yArea+range;y++) {
                    for(var x=xArea-range;x<=xArea+range;x++) {
                        var area = spriteMap[x+"_"+y];
                        if(area) {
                            for(var a in area) {
                                var sprites = area[a];
                                for(var s in sprites) {
                                    var obj = this.getSprite(sprites[s]);
                                    if(Array.isArray(obj)) {
                                        obj.forEach(callback);
                                    } else {
                                        callback(obj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        );
        spriteCollection.create = function(x,y,index) {
            return new SpriteInfo(x,y,index);
        };

        spriteCollection.get = function(x,y) {
            var areaId = getAreaId(x,y);
            var area = spriteMap[areaId];
            var posId = Math.floor(x) + "_" + Math.floor(y);
            return area?area[posId]:null;
        };
        spriteCollection.find = function(uid) {
            return spriteRegistry[uid];
        }
        return spriteCollection;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.Collection = Collection;
    core.createSpriteCollection = createSpriteCollection;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
})));