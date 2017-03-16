(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
}(window, (function (core) { 'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var spriteRenderers = [];
    var uniforms = null;

    /**
     *  HEADER
     */
    core.requireScripts([
        'setup.js',
        'spritesheet.js',
        'utils.js',
        'objectpool.js',
    ]);
    core.logScript();
    var currentScript = core.getCurrentScript();

    /**
     *  CLASS DEFINITIONS
     */

    function SpriteRenderer() {
        this.images = [];
        this.imageOrder = [];
        this.imageCount = 0;
        this.mesh = createMesh();

        var self = this;
        this.display = function (collection) {
            if(self.lastDisplayTime < core.time) {
                self.lastDisplayTime = core.time;
                clear();
            }
            if(collection.constructor===SpriteObject) {
                addSpritePerspective(collection);
            } else if(collection.forEach) {
                collection.forEach(addSpritePerspective);
            }
        }

        function clear() {
            self.imageCount = 0;
            DOK.recycleAll(SpriteObject);
        }

        function addSpritePerspective(spriteObject) {
            var image = null;
            var cut = spriteObject && spriteObject.visible !== false ? core.getCut(spriteObject.img) : null;
            if(cut && cut.ready) {
                var index = self.imageCount;
                if(!self.images[index]) {
                    self.images[index] = new SpriteImage();
                    self.images[index].index = index;
                }

                image = self.images[index];
                var quat = spriteObject.quaternionArray || core.getCameraQuaternionData().array;
                if(image.quaternionArray[0] !== quat[0]
                    || image.quaternionArray[1] !== quat[1]
                    || image.quaternionArray[2] !== quat[2]
                    || image.quaternionArray[3] !== quat[3]
                ) {
                    image.quaternionArray.set(quat);
                    image.quatDirty = true;
                }
                var pX = (spriteObject.pos[0]);
                var pY = (spriteObject.pos[1]);
                var pZ = (spriteObject.pos[2]);
                if(pX !== image.position.x || pY !== image.position.y || pZ !== image.position.z) {
                    image.position.set(pX, pY, pZ);
                    image.positionDirty = true;
                }

                if(spriteObject.size[0] !== image.size[0] || spriteObject.size[1] !== image.size[1] || spriteObject.size[2] !== image.size[2]) {
                    image.size[0] = spriteObject.size[0]; image.size[1] = spriteObject.size[1]; image.size[2] = spriteObject.size[2];
                    var vertices = planeGeometry.attributes.position.array;
                    for(var v=0; v<vertices.length; v++) {
                        image.vertices[v] = vertices[v] * spriteObject.size[v%3];
                    }
                    image.verticesDirty = true;
                }

                if(image.uv !== cut.uv) {
                    image.uv = cut.uv;
                    image.uvDirty = true;
                }

                if(image.tex !== cut.tex) {
                    image.tex = cut.tex;
                    image.texDirty = true;
                }

                if(image.light !== spriteObject.light) {
                    image.light = spriteObject.light;
                    image.lightDirty = true;
                }
                self.imageOrder[index] = image;
                self.imageCount++;
            }
            return image;
        }

        spriteRenderers.push(this);
    }

    SpriteRenderer.prototype.lastDisplayTime = 0;
    SpriteRenderer.prototype.destroy = destroySprite;
    SpriteRenderer.prototype.render = render;
    SpriteRenderer.prototype.updateGraphics = updateGraphics;

    function SpriteImage() {
        this.position = new THREE.Vector3();
        this.size = new Float32Array(3).fill(0);
        this.vertices = new Float32Array(planeGeometry.attributes.position.array.length);
        this.quaternionArray = new Float32Array(4).fill(0);
    }
    SpriteImage.prototype.index = 0;
    SpriteImage.prototype.position = null;
    SpriteImage.prototype.tex = -1;
    SpriteImage.prototype.size = null;
    SpriteImage.prototype.uv = null;
    SpriteImage.prototype.vertices = null;
    SpriteImage.prototype.light = 1;
    SpriteImage.prototype.zIndex = 0;
    SpriteImage.prototype.quaternionArray = null;
    SpriteImage.prototype.positionDirty = true;
    SpriteImage.prototype.verticesDirty = true;
    SpriteImage.prototype.texDirty = true;
    SpriteImage.prototype.uvDirty = true;
    SpriteImage.prototype.lightDirty = true;
    SpriteImage.prototype.quatDirty = true;

    function SpriteObject() {
        this.pos = new Float32Array(3).fill(0);
        this.size = new Float32Array([0,0,1]);
        this.quaternionArray = new Float32Array(4).fill(0);
    }

    SpriteObject.prototype.init = function(
            x,y,z,
            width, height,
            quaternionArray, light, img) {
        this.pos[0] = x;
        this.pos[1] = y;
        this.pos[2] = z;
        this.size[0] = width;
        this.size[1] = height;
        this.quaternionArray.set(quaternionArray ? quaternionArray : core.getCameraQuaternionData().array);
        this.light = light;
        this.img = img;
        return this;
    };
    SpriteObject.prototype.pos = null;
    SpriteObject.prototype.size = null;
    SpriteObject.prototype.quaternionArray = null;
    SpriteObject.prototype.light = 1;
    SpriteObject.prototype.img = -1;
    SpriteObject.prototype.offset = null;

    /**
     *  FUNCTION DEFINITIONS
     */

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
                    uniforms: uniforms = {
                        texture:  {
                            type: 'tv',
                            get value() { return DOK.getTextures(); }
                        },
                        vCam : {
                            type: "v3",
                            get value() { return DOK.getCamera().position; }
                        },
                    },
                    vertexShader: vertexShaderCommon + vertexShader,
                    fragmentShader: fragmentShader,
                    transparent:true,
                    depthWrite: false,
                } );
            }
        );

        mesh.frustumCulled = false;
        return mesh;
    }

    function sortImages(images,count) {
        var camera = DOK.getCamera();
        for (var i = 0; i < count; i++) {
            images[i].zIndex = -camera.position.distanceToManhattan(images[i].position);
        }
        DOK.turboSort(images,count,indexFunction);
    }

    function indexFunction(a) {
        return a.zIndex;
    }

    function render() {
        var imageCount = this.imageCount;
        var pointCount = planeGeometry.attributes.position.count;
        var previousAttribute;

        var mesh = this.mesh;
        var geometry = mesh.geometry;
        if (!geometry.attributes.position || geometry.attributes.position.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.position;
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.position.copyArray(previousAttribute.array);
            geometry.attributes.position.setDynamic(true);
        }
        if (!geometry.attributes.spot || geometry.attributes.spot.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.spot;
            geometry.attributes.spot = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.spot.copyArray(previousAttribute.array);
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.quaternion || geometry.attributes.quaternion.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.quaternion;
            geometry.attributes.quaternion = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 4), 4
            );
            if(previousAttribute)
                geometry.attributes.quaternion.copyArray(previousAttribute.array);
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.uv || geometry.attributes.uv.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.uv;
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 2), 2
            );
            if(previousAttribute)
                geometry.attributes.uv.copyArray(previousAttribute.array);
            geometry.attributes.uv.setDynamic(true);
        }
        if (!geometry.attributes.tex || geometry.attributes.tex.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.tex;
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.tex.copyArray(previousAttribute.array);
            geometry.attributes.tex.setDynamic(true);
        }
        if (!geometry.attributes.light || geometry.attributes.light.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.light;
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.light.copyArray(previousAttribute.array);
            geometry.attributes.light.setDynamic(true);
        }
        if (!geometry.index || geometry.index.count < imageCount * planeGeometry.index.array.length) {
            previousAttribute = geometry.index;
            var indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            if(previousAttribute)
                geometry.index.copyArray(previousAttribute.array);
            geometry.index.setDynamic(true);
        }

        sortImages(this.imageOrder, imageCount);
    }

    function updateGraphics() {
        this.render();

        var images = this.images;
        var imageOrder = this.imageOrder;
        var imageCount = this.imageCount;
        var geometry = this.mesh.geometry;
        var geo_quaternion = geometry.attributes.quaternion.array;
        var geo_spot = geometry.attributes.spot.array;
        var geo_pos = geometry.attributes.position.array;
        var geo_tex = geometry.attributes.tex.array;
        var geo_light = geometry.attributes.light.array;
        var geo_uv = geometry.attributes.uv.array;
        var geo_index = geometry.index.array;

        var quatChanged = false;
        var positionChanged = false;
        var texChanged = false;
        var verticesChanged = false;
        var uvChanged = false;
        var lightChanged = false;

        for(var i=0;i<imageCount;i++) {
            var image = images[i];
            var index = image.index;

            if (image.quatDirty) {
                var quaternionArray = image.quaternionArray;
                geo_quaternion.set(quaternionArray, index * 16);
                geo_quaternion.set(quaternionArray, index * 16 + 4);
                geo_quaternion.set(quaternionArray, index * 16 + 8);
                geo_quaternion.set(quaternionArray, index * 16 + 12);
                image.quatDirty = false;
                quatChanged = true;
            }

            if (image.positionDirty) {
                image.position.toArray(geo_spot, index * 12);
                image.position.toArray(geo_spot, index * 12 + 3);
                image.position.toArray(geo_spot, index * 12 + 6);
                image.position.toArray(geo_spot, index * 12 + 9);
                image.positionDirty = false;
                positionChanged = true;
            }

            if (image.verticesDirty) {
                geo_pos.set(image.vertices, index * 12);
                image.verticesDirty = false;
                verticesChanged = true;
            }

            if (image.texDirty) {
                geo_tex.fill(image.tex, index * 4, index * 4 + 4);
                image.texDirty = false;
                texChanged = true;
            }

            if (image.uvDirty) {
                geo_uv.set(image.uv, index * 8);
                image.uvDirty = false;
                uvChanged = true;
            }

            if (image.lightDirty) {
                geo_light.fill(image.light, index * 4, index * 4 + 4);
                image.lightDirty = false;
                lightChanged = true;
            }
        }

        var indices = planeGeometry.index.array;
        for(i=0;i<imageCount;i++) {
            var indexBase = imageOrder[i].index * 4;
            for(var j=0; j<6; j++) {
                geo_index[i * 6 + j] = indices[j] + indexBase;
            }
        }

        if(geometry.drawRange.start !== 0 || geometry.drawRange.count != imageCount*planeGeometry.index.count) {
            geometry.setDrawRange(0, imageCount*planeGeometry.index.count);
        }

        if(lightChanged) {
            geometry.attributes.light.needsUpdate = true;
        }
        if(quatChanged) {
            geometry.attributes.quaternion.needsUpdate = true;
        }
        if(positionChanged) {
            geometry.attributes.spot.needsUpdate = true;
        }
        if(verticesChanged) {
            geometry.attributes.position.needsUpdate = true;
        }
        if(texChanged) {
            geometry.attributes.tex.needsUpdate = true;
        }
        if(uvChanged) {
            geometry.attributes.uv.needsUpdate = true;
        }
        geometry.index.needsUpdate = true;
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
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.SpriteRenderer = SpriteRenderer;
    core.SpriteObject = SpriteObject;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */

 })));