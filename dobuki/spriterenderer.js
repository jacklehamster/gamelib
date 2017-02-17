(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(window, (function (core) { 'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var identityQuaternionArray = (new THREE.Quaternion()).toArray(new Float32Array(4));
    var spriteRenderers = [];
    var tempVector = new THREE.Vector3(), tempQuaternion = new THREE.Quaternion(), cameraQuaternionArray = new Float32Array(4);
    var uvOrder = planeGeometry.attributes.uv.array;

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
        spriteRenderers.push(this);
    }

    SpriteRenderer.prototype.destroy = destroySprite;
    SpriteRenderer.prototype.clear = clear;
    SpriteRenderer.prototype.render = render;
    SpriteRenderer.prototype.updateGraphics = updateGraphics;
    SpriteRenderer.prototype.addSpritePerspective = addSpritePerspective;

    /**
     *  FUNCTION DEFINITIONS
     */

    function getPlaneGeometry() {
        return planeGeometry;
    }

    function clear() {
        this.imageCount = 0;
    }

    function addSpritePerspective(pos, offset, url, light, faceCamera) {
        var cut = core.getCut(url);
        if(cut) {
            if(!this.images[this.imageCount]) {
                this.images[this.imageCount] = {
                    position:new Float32Array(3),
                    vertices: null,
                    texture:0,
                    uv:null,
                    light:1,
                    zIndex:0,
                    quaternionArray: null,
                };
            }

            var image = this.images[this.imageCount];
            image.quaternionArray = faceCamera ? null : identityQuaternionArray;
            image.position[0] = (pos[0] + offset[0] - this.shift.x);
            image.position[1] = (pos[1] + offset[1] - this.shift.y);
            image.position[2] = (pos[2]);
            image.vertices = cut.vertices;
            image.texture = cut.tex;
            image.uv = cut.uv;
            image.light = light;
            this.imageCount++;
        }
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

    function setZIndex(image, quaternion) {
        tempVector.set(image.position[0], image.position[1], image.position[2]);
        tempVector.applyQuaternion(quaternion);
        image.zIndex = tempVector.z;
    }

    function sortImages(images,count) {
        DOK.turboSort(images,count);
    }

    function render(camera) {
        var i;
        var images = this.images;
        var imageCount = this.imageCount;
        var planeGeometry = getPlaneGeometry();
        var pointCount = planeGeometry.attributes.position.count;

        var mesh = this.mesh;
        var geometry = mesh.geometry;
        if (!geometry.attributes.position || geometry.attributes.position.count < imageCount * pointCount) {
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            geometry.attributes.position.setDynamic(true);
        }
        if (!geometry.attributes.spot || geometry.attributes.spot.count < imageCount * pointCount) {
            geometry.attributes.spot = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.quaternion || geometry.attributes.quaternion.count < imageCount * pointCount) {
            geometry.attributes.quaternion = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 4), 4
            );
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.uv || geometry.attributes.uv.count < imageCount * pointCount) {
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 2), 2
            );
            geometry.attributes.uv.setDynamic(true);
        }
        if (!geometry.attributes.tex || geometry.attributes.tex.count < imageCount * pointCount) {
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            geometry.attributes.tex.setDynamic(true);
        }
        if (!geometry.attributes.light || geometry.attributes.light.count < imageCount * pointCount) {
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            geometry.attributes.light.setDynamic(true);
        }
        if (!geometry.index || geometry.index.count < imageCount * planeGeometry.index.array.length) {
            var indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            for (i = 0; i < geometry.index.array.length; i++) {
                var index = Math.floor(i / indices.length);
                geometry.index.array[i] = indices[i % indices.length] + index * pointCount;
            }
            geometry.index.needsUpdate = true;
        }

        tempQuaternion.copy(camera.quaternion);
        tempQuaternion.inverse();
        for (i = 0; i < imageCount; i++) {
            setZIndex(images[i], tempQuaternion);
        }

        sortImages(images, imageCount);
    }

    function updateGraphics() {
        var camera = DOK.getCamera();
        camera.quaternion.toArray(cameraQuaternionArray);
        var defaultQuaternionArray = cameraQuaternionArray;
        var vertices = planeGeometry.attributes.position.array;
        var images = this.images;
        var imageCount = this.imageCount;
        var geometry = this.mesh.geometry;
        var geo_quaternion = geometry.attributes.quaternion.array;
        var geo_spot = geometry.attributes.spot.array;
        var geo_pos = geometry.attributes.position.array;
        var geo_tex = geometry.attributes.tex.array;
        var geo_light = geometry.attributes.light.array;
        var geo_uv = geometry.attributes.uv.array;

        for(var i=0;i<imageCount;i++) {
            var image = images[i];

            var quaternionArray = image.quaternionArray ? image.quaternionArray : defaultQuaternionArray;

            geo_quaternion.set(quaternionArray, i*16);
            geo_quaternion.set(quaternionArray, i*16+4);
            geo_quaternion.set(quaternionArray, i*16+8);
            geo_quaternion.set(quaternionArray, i*16+12);

            geo_spot.set(image.position, i*12);
            geo_spot.set(image.position, i*12+3);
            geo_spot.set(image.position, i*12+6);
            geo_spot.set(image.position, i*12+9);

            geo_pos.set(image.vertices, i*12);

            geo_tex.fill(image.texture, i*4, i*4+4);
            geo_light.fill(image.light, i*4, i*4+4);

            geo_uv.set(image.uv, i*8);
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