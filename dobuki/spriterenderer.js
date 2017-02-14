(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(window, (function (core) { 'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var defaultQuaternion = new THREE.Quaternion();
    var spriteRenderers = [];
    var tempVector = new THREE.Vector3(), tempQuaternion = new THREE.Quaternion();

    /**
     *  HEADER
     */
    core.requireScripts([
        'setup.js',
        'spritesheet.js',
        'utils.js',
    ]);
    core.logScript();
    var currentScript = core.getCurrentScript();

    /**
     *  CLASS DEFINITIONS
     */

    function SpriteRenderer() {
        this.images = [];
        this.imageCount = 0;
        this.shift = { x: 0, y: 0 };
        this.mesh = createMesh();
        this.displaySprites = displaySprites.bind(this);
        this.destroy = destroySprite.bind(this);
        spriteRenderers.push(this);
    }

    /**
     *  FUNCTION DEFINITIONS
     */

    function getPlaneGeometry() {
        return planeGeometry;
    }

    function createMesh() {
        var geometry = new THREE.BufferGeometry();
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

        core.loadAsync(
            [
                currentScript.path + "vertex-shader.glsl",
                currentScript.path + "fragment-shader.glsl",
                currentScript.path + "vertex-shader-common.glsl",
            ],
            function(vertexShader, fragmentShader, vertexShaderCommon) {
                mesh.material = new THREE.ShaderMaterial( {
                    uniforms: {
                        texture:  {
                            type: 'tv',
                            get value() { return DOK.getTextures() }
                        },
                    },
                    vertexShader: vertexShaderCommon + vertexShader,
                    fragmentShader: fragmentShader,
                    transparent:true,
                    depthWrite: false,
//                    alphaTest: 0.95,
                } );
            }
        );

        mesh.frustumCulled = false;
        return mesh;
    }

    function collectImagesOrthographic(spriteContainer, spriteRenderer, camera) {
        var planeGeometry = getPlaneGeometry();
        var minZindex = Number.MAX_VALUE, maxZindex= Number.MIN_VALUE;
        var uvOrder = planeGeometry.attributes.uv.array;
        var i;
        spriteRenderer.imageCount = 0;
        var shift = spriteRenderer.shift;
        var spriteIterator = spriteContainer.entries(), current;
        while(!(current = spriteIterator.next()).done) {
            var sprite = current.value[1];
            var cut = core.getCut(sprite.url);
            if(cut) {
                if(!spriteRenderer.images[spriteRenderer.imageCount]) {
                    spriteRenderer.images[spriteRenderer.imageCount] = {
                        position:[0,0,0],
                        size:[1,1,1],
                        texture:0,
                        light:1,
                        uv:new Array(planeGeometry.attributes.uv.array.length),
                        zIndex:0,
                        level:0,
                    };
                }

                var image = spriteRenderer.images[spriteRenderer.imageCount];
                var offsetX = sprite.offset !== undefined ? sprite.offset[0]:0;
                var offsetY = sprite.offset !== undefined ? sprite.offset[1]:0;
                image.position[0] = Math.round(sprite.pos[0] + offsetX - shift.x);
                image.position[1] = Math.round(sprite.pos[1] + offsetY - shift.y);
                image.level = sprite.pos[2];
                image.zIndex = -sprite.pos[1];
                minZindex = Math.min(minZindex, image.zIndex);
                maxZindex = Math.max(maxZindex, image.zIndex);

                image.size = cut.size;
                image.texture = cut.tex;
                for(var u=0; u<image.uv.length; u+=2) {
                    image.uv[u  ] = cut.cut[uvOrder[u  ]*2  ];
                    image.uv[u+1] = cut.cut[uvOrder[u+1]*2+1];
                }

                image.light = sprite.light !== undefined ? sprite.light : 1;

                spriteRenderer.imageCount++;
            }
        }

        var diffZindex = maxZindex - minZindex;
        for(i=0;i<spriteRenderer.imageCount;i++) {
            spriteRenderer.images[i].zIndex += spriteRenderer.images[i].level * diffZindex;
            maxZindex = Math.max(maxZindex, spriteRenderer.images[i].zIndex);
            minZindex = Math.min(minZindex, spriteRenderer.images[i].zIndex);
        }

        for(i=0;i<spriteRenderer.imageCount;i++) {
            spriteRenderer.images[i].position[2] = 100 * (spriteRenderer.images[i].zIndex-minZindex) / (maxZindex - minZindex+1);
        }

        for(i=spriteRenderer.imageCount;i<spriteRenderer.images.length;i++) {
            spriteRenderer.images[i].zIndex =  Number.MAX_VALUE;
        }

        DOK.quickSort(spriteRenderer.images,getIndex);
        return spriteRenderer.images;
    }

    function getIndex(a) {
        return a.zIndex;
    }

    function compareIndex(a,b) {
        return a.zIndex - b.zIndex;
    }

    function collectImagesPerspective(spriteContainer, spriteRenderer, camera) {
        var planeGeometry = getPlaneGeometry();
        var numSprites = spriteContainer.length;
        var uvOrder = planeGeometry.attributes.uv.array;
        var i;
        spriteRenderer.imageCount = 0;
        var shift = spriteRenderer.shift;
        var spriteIterator = spriteContainer.entries(), current;

        tempQuaternion.copy(camera.quaternion);
        tempQuaternion.inverse();

        while(!(current = spriteIterator.next()).done) {
            var sprite = current.value[1];
            var cut = core.getCut(sprite.url);
            if(cut) {
                if(!spriteRenderer.images[spriteRenderer.imageCount]) {
                    spriteRenderer.images[spriteRenderer.imageCount] = {
                        position:[0,0,0],
                        rotation:[0,0,0],
                        size:[1,1,1],
                        texture:0,
                        light:1,
                        uv:new Array(planeGeometry.attributes.uv.array.length),
                        zIndex:0,
                    };
                }

                var image = spriteRenderer.images[spriteRenderer.imageCount];
                image.quaternion = sprite.quaternion ? sprite.quaternion : defaultQuaternion;
                var offsetX = sprite.offset !== undefined ? sprite.offset[0]:0;
                var offsetY = sprite.offset !== undefined ? sprite.offset[1]:0;
                image.position[0] = (sprite.pos[0] + offsetX - shift.x);
                image.position[1] = (sprite.pos[1] + offsetY - shift.y);
                image.position[2] = (sprite.pos[2]);

                tempVector.set(image.position[0], image.position[1], image.position[2]);
                tempVector.applyQuaternion(tempQuaternion);
                image.zIndex = tempVector.z;

                image.size = cut.size;
                image.texture = cut.tex;
                for(var u=0; u<image.uv.length; u+=2) {
                    image.uv[u  ] = cut.cut[uvOrder[u  ]*2  ];
                    image.uv[u+1] = cut.cut[uvOrder[u+1]*2+1];
                }

                image.light = sprite.light !== undefined ? sprite.light : 1;
                spriteRenderer.imageCount++;
            }
        }

        DOK.turboSort(spriteRenderer.images,getIndex,compareIndex);
        return spriteRenderer.images;
    }

    function displaySprites(spriteContainer, camera) {
        var i;
        var images = camera.isOrthographic
            ? collectImagesOrthographic(spriteContainer, this)
            : collectImagesPerspective(spriteContainer, this, camera);
        var imageCount = this.imageCount;
        var planeGeometry = getPlaneGeometry();
        var pointCount = planeGeometry.attributes.position.count;

        var mesh = this.mesh;
        var geometry = mesh.geometry;
        if(!geometry.attributes.position || geometry.attributes.position.count < imageCount*pointCount) {
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount*3), 3
            );
            geometry.attributes.position.setDynamic(true);
        }
        if(!geometry.attributes.spot || geometry.attributes.spot.count < imageCount*pointCount) {
            geometry.attributes.spot = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount*3), 3
            );
            geometry.attributes.spot.setDynamic(true);
        }
        if(!geometry.attributes.quaternion || geometry.attributes.quaternion.count < imageCount*pointCount) {
            geometry.attributes.quaternion = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount*4), 4
            );
            geometry.attributes.spot.setDynamic(true);
        }
        if(!geometry.attributes.uv || geometry.attributes.uv.count < imageCount*pointCount) {
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount*2), 2
            );
            geometry.attributes.uv.setDynamic(true);
        }
        if(!geometry.attributes.tex || geometry.attributes.tex.count < imageCount*pointCount) {
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            geometry.attributes.tex.setDynamic(true);
        }
        if(!geometry.attributes.light || geometry.attributes.light.count < imageCount*pointCount) {
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            geometry.attributes.light.setDynamic(true);
        }
        if(!geometry.index || geometry.index.count < imageCount*planeGeometry.index.array.length) {
            var indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            for(i=0; i<geometry.index.array.length; i++) {
                var index = Math.floor(i/indices.length);
                geometry.index.array[i] = indices[i%indices.length] + index*pointCount;
            }
            geometry.index.needsUpdate = true;
        }

        for(i=0;i<imageCount;i++) {
            var vertices = planeGeometry.attributes.position.array;
            var image = images[i];

            image.quaternion.toArray(geometry.attributes.quaternion.array, i*16);
            image.quaternion.toArray(geometry.attributes.quaternion.array, i*16+4);
            image.quaternion.toArray(geometry.attributes.quaternion.array, i*16+8);
            image.quaternion.toArray(geometry.attributes.quaternion.array, i*16+12);
            window.qq = defaultQuaternion;

            for(var v=0; v<vertices.length; v++) {
                geometry.attributes.spot.array[i*12+v] = image.position[v%3];
                geometry.attributes.position.array[i*12+v] = image.position[v%3] + vertices[v] * image.size[v%3];
            }

            for(var t=0; t<4; t++) {
                geometry.attributes.tex.array[i*4 + t] = image.texture;
            }

            for(var l=0; l<4; l++) {
                geometry.attributes.light.array[i*4 + l] = image.light;
            }

            for(var u=0; u<image.uv.length; u++) {
                geometry.attributes.uv.array[u + i*8] = image.uv[u];
            }
        }

        geometry.setDrawRange(0, imageCount*vertices.length);
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.tex.needsUpdate = true;
        geometry.attributes.light.needsUpdate = true;
        geometry.attributes.uv.needsUpdate = true;
        geometry.attributes.spot.needsUpdate = true;
        geometry.attributes.quaternion.needsUpdate = true;
    }

    function destroyEverything() {
        for(var i=0; i<spriteRenderers.length; i++) {
            spriteRenderers[i].destroy();
        }
        spriteRenderers.length = 0;
    }

    function destroySprite() {
        if(this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.mesh = null;
        this.images.length = 0;
        this.imageCount = 0;
        this.shift = { x:0, y:0 };
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.SpriteRenderer = SpriteRenderer;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */


 })));