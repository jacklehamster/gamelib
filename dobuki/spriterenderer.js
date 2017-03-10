(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
}(window, (function (core) { 'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var identityQuaternionArray = (new THREE.Quaternion()).toArray(new Float32Array(4));
    var spriteRenderers = [];
    var tempVector = new THREE.Vector3(), tempQuaternion = new THREE.Quaternion(), cameraQuaternionArray = new Float32Array(4);
    var camera, cameraChanged;
    var calcIndexFunction;

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
        this.imageOrder = [];
        this.imageCount = 0;
        this.shift = { x: 0, y: 0 };
        this.mesh = createMesh();

        var self = this;
        this.display = function (collection) {
            if(self.lastDisplayTime < core.time) {
                self.lastDisplayTime = core.time;
                self.imageCount = 0;
            }
            if(collection.constructor===SpriteObject) {
                addSpritePerspective(collection);
            } else {
                collection.forEach(addSpritePerspective);
            }
        }

        function addSpritePerspective(spriteObject) {
            var image = null;
            var cut = spriteObject.visible !== false ? core.getCut(spriteObject.img) : null;
            if(cut && cut.ready) {
                var index = self.imageCount;
                if(!self.images[index]) {
                    self.images[index] = new SpriteImage(index);
                }

                image = self.images[index];
                var quat = spriteObject.faceCamera ? null : identityQuaternionArray;
                if(image.quaternionArray !== quat) {
                    image.quaternionArray = quat;
                    image.quatDirty = true;
                }
                var pX = (spriteObject.pos[0] + spriteObject.offset[0] - self.shift.x);
                var pY = (spriteObject.pos[1] + spriteObject.offset[1] - self.shift.y);
                var pZ = (spriteObject.pos[2] + spriteObject.offset[2]);
                if(pX !== image.position[0] || pY !== image.position[1] || pZ !== image.position[2]) {
                    image.position[0] = pX;
                    image.position[1] = pY;
                    image.position[2] = pZ;
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

    function SpriteImage(index) {
        this.index = index;
        this.position = new Float32Array(3).fill(0);
        this.tex = 0;
        this.size = new Float32Array(3).fill(0);
        this.uv = null;
        this.vertices = new Float32Array(planeGeometry.attributes.position.array.length);
        this.light = 1;
        this.zIndex = 0;
        this.quaternionArray = null;
        this.positionDirty = true;
        this.verticesDirty = true;
        this.texDirty = true;
        this.uvDirty = true;
        this.lightDirty = true;
        this.quatDirty = true;
    }
    SpriteImage.prototype.index = 0;
    SpriteImage.prototype.position = null;
    SpriteImage.prototype.tex = 0;
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

    function SpriteObject(
            x,y,z,
            width, height,
            faceCamera, light, img,
            offsetX, offsetY, offsetZ) {
        this.pos = new Float32Array([x,y,z]);
        this.size = new Float32Array([width, height,1]);
        this.faceCamera = faceCamera;
        this.light = light;
        this.img = img;
        this.offset = new Float32Array([offsetX||0, offsetY||0, offsetZ||0]);
    }
    SpriteObject.prototype.pos = null;
    SpriteObject.prototype.size = null;
    SpriteObject.prototype.faceCamera = false;
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
                } );
            }
        );

        mesh.frustumCulled = false;
        return mesh;
    }

    function setZIndex(image, quaternion) {
        var index = calcIndexFunction(image, quaternion);
        if (index!==undefined) {
            image.zIndex = index;
        }
    }

    function calculateIndexFunction(image, quaternion) {
        if(cameraChanged || image.positionDirty) {
            tempVector.set(image.position[0], image.position[1], image.position[2]);
            tempVector.applyQuaternion(quaternion);
            return tempVector.z;
        }
    }

    function setCalculateIndexFunction(calcIndexFunc) {
        calcIndexFunction = calcIndexFunc ? calcIndexFunc : calculateIndexFunction;
    }

    function sortImages(images,count) {
        DOK.turboSort(images,count,indexFunction);
    }

    function indexFunction(a) {
        return a.zIndex;
    }

    function render(camera) {
        var images = this.images;
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

        tempQuaternion.copy(camera.quaternion);
        tempQuaternion.inverse();
        for (var i = 0; i < imageCount; i++) {
            setZIndex(images[i], tempQuaternion);
        }

        sortImages(this.imageOrder, imageCount);
    }

    function cameraQuaternionChanged() {
        camera.quaternion.toArray(cameraQuaternionArray);
        cameraChanged = true;
    }

    function updateGraphics() {
        if(camera !== DOK.getCamera()) {
            camera = DOK.getCamera();
            camera.quaternion.onChange(cameraQuaternionChanged);
            cameraQuaternionChanged();
        }
        var defaultQuaternionArray = cameraQuaternionArray;
        var vertices = planeGeometry.attributes.position.array;
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

            var quatDirty = image.quatDirty || !image.quaternionArray && cameraChanged;
            if (quatDirty) {
                var quaternionArray = image.quaternionArray ? image.quaternionArray : defaultQuaternionArray;
                geo_quaternion.set(quaternionArray, index * 16);
                geo_quaternion.set(quaternionArray, index * 16 + 4);
                geo_quaternion.set(quaternionArray, index * 16 + 8);
                geo_quaternion.set(quaternionArray, index * 16 + 12);
                image.quatDirty = false;
                quatChanged = true;
            }

            if (image.positionDirty) {
                geo_spot.set(image.position, index * 12);
                geo_spot.set(image.position, index * 12 + 3);
                geo_spot.set(image.position, index * 12 + 6);
                geo_spot.set(image.position, index * 12 + 9);
                image.positionDirty = false;
                positionChanged = true;
            }

            if (image.verticesDirty) {
                geo_pos.set(image.vertices, index * 12);
                image.verticesDirty = false;
                verticesChanged = true;
            }

            if (image.texDirty) {
                geo_tex.fill(image.texture, index * 4, index * 4 + 4);
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
        cameraChanged = false;
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
    core.SpriteObject = SpriteObject;
    core.setCalculateIndexFunction = setCalculateIndexFunction;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    calcIndexFunction = calculateIndexFunction;

 })));