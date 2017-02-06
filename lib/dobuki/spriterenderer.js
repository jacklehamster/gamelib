(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';

    var mesh;
    
    var vertices = new Float32Array([
         0, 1, 0,
         0, 0, 0,
         1, 1, 0,
         1, 0, 0,
    ]);
    
    var uvs = new Float32Array([
        0, 1, 
        0, 0,
        1, 1,
        1, 0,
    ]);    
    
    var indices = new Uint16Array([
        0, 1, 2, 
        1, 3, 2,
    ]);
    
    var images = [], imageCount = 0, shift = { x:0, y:0 };

    function getMesh() {
        if(!mesh) {
            var geometry = new THREE.BufferGeometry();
            var material = new THREE.ShaderMaterial( {
                uniforms: {
                    texture:  { 
                        type: 'tv',
                        get value() { return DOK.getTextures() }
                    },
                },
                vertexShader: document.getElementById('vertex-shader').textContent,
                fragmentShader: document.getElementById('fragment-shader').textContent,
                transparent:true,
            } );
            
            mesh = new THREE.Mesh(geometry, material);
            mesh.frustumCulled = false;
        }
        return mesh;
    }
    
    function collectImages(spriteContainer) {
        var numSprites = spriteContainer.length;    
        var minZindex = Number.MAX_VALUE, maxZindex= Number.MIN_VALUE;
        imageCount = 0;
        for(var i=0;i<numSprites;i++) {
            var sprite = spriteContainer.at(i);
            var cut = core.getCut(sprite.url);
            if(cut) {
                if(!images[imageCount]) {
                    images[imageCount] = {
                         position:[0,0,0],
                         size:[0,0,1],
                         texture:0,
                         light:1,
                         uv:null,
                         zIndex:0,
                         level:0,
                    };
                }
            
                var image = images[imageCount];
                var offsetX = sprite.offset?sprite.offset[0]:0;
                var offsetY = sprite.offset?sprite.offset[1]:0;
                image.position[0] = Math.round(sprite.pos[0] + offsetX - shift.x);
                image.position[1] = Math.round(sprite.pos[1] + offsetY - shift.y);
                image.level = sprite.pos[2];
                image.zIndex = -sprite.pos[1];
                minZindex = Math.min(minZindex, image.zIndex);
                maxZindex = Math.max(maxZindex, image.zIndex);
                
                if(cut.size) {
                    image.size[0] = cut.size[0];
                    image.size[1] = cut.size[1];
                } else {
                    image.size[0] = image.size[1] = 1;
                }
                
                image.texture = cut.tex;
                image.uv = cut.uv;
                
                image.light = sprite.light ? sprite.light : 1;
                
                imageCount++;
            }
        }
        
        var diffZindex = maxZindex - minZindex;
        for(var i=0;i<imageCount;i++) {
            images[i].zIndex += images[i].level * diffZindex;
            maxZindex = Math.max(maxZindex, images[i].zIndex);
            minZindex = Math.min(minZindex, images[i].zIndex);
        }
        
        for(var i=0;i<imageCount;i++) {
            images[i].position[2] = 100 * (images[i].zIndex-minZindex) / (maxZindex - minZindex+1);
        }
        
        for(var i=imageCount;i<images.length;i++) {
            images[i].zIndex =  Number.MAX_VALUE;
        }
        
        images.sort(imageCompare);
    }
    
    function imageCompare(a,b) {
        return a.zIndex - b.zIndex;
    }
    
    function displaySprites(spriteContainer) {
        var geometry = getMesh().geometry;    
        collectImages(spriteContainer);
        
        if(!geometry.attributes.position || geometry.attributes.position.count < imageCount*4) {
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * vertices.length), 3
            );
        }
        if(!geometry.attributes.uv || geometry.attributes.uv.count < imageCount*4) {
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * uvs.length), 2
            );
        }
        if(!geometry.attributes.tex || geometry.attributes.tex.count < imageCount*4) {
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * 4), 1
            );
        }
        if(!geometry.attributes.light || geometry.attributes.light.count < imageCount*4) {
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * 4), 1
            );
        }
        if(!geometry.index || geometry.index.count < imageCount*indices.length) {
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            for(var i=0; i<geometry.index.array.length; i++) {
                var index = Math.floor(i/indices.length);
                geometry.index.array[i] = indices[i%indices.length] + index*4;
            }
            geometry.index.needsUpdate = true;
        }
        
        for(var i=0;i<imageCount;i++) {
            var image = images[i];
            var pos = image.position;
            var size = image.size;
            var texture = image.texture;
            var light = image.light;
            var uv = image.uv ? image.uv : uvs;
            for(var v=0; v<12; v++) {
                geometry.attributes.position.array[i*12+v] = pos[v%3] + vertices[v] * size[v%3];
            }
            
            for(var t=0; t<4; t++) {
                geometry.attributes.tex.array[i*4 + t] = texture;
            }
            
            for(var l=0; l<4; l++) {
                geometry.attributes.light.array[i*4 + l] = light;
            }
            
            for(var u=0; u<8; u++) {
                geometry.attributes.uv.array[u + i*8] = uv[u];
            }
        }
        
        //  clear remaining sprites
        for(var i=imageCount*vertices.length; i<geometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i] = 0;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.tex.needsUpdate = true;
        geometry.attributes.light.needsUpdate = true;
        geometry.attributes.uv.needsUpdate = true;
    }

    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'spritesheet.js',
        'utils.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
        if(mesh) {
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        mesh = null;
        images = [];
        imageCount = 0;
        shift = { x:0, y:0 };

    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.shift = shift;
    core.getMesh = getMesh;
    core.displaySprites = displaySprites;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    
     
 })));