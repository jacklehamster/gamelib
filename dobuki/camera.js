(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';
    var camera;
    var camera2d = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, 1000000 );
    var camera3d = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000000 );
    var cameraQuaternionData = {
            array: new Float32Array(4),
            forwardMovement: new THREE.Vector3(0,0,1),
            version: 0,
        }, cameraQuaternionLastVersion = 0;

    /**
     *  HEADER
     */
    core.requireScripts([
        'setup.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCamera() {
        return camera;
    }

    function nop() {
    }

    function setCamera3d(value) {
        if(value && camera!==camera3d) {
            camera = camera3d;
            copyCamera(camera2d,camera);
        } else if(!value && camera===camera3d) {
            camera = camera2d;
            copyCamera(camera3d,camera);
        }
        camera.quaternion.onChange(onCameraQuaternionChanged);
        onCameraQuaternionChanged();

    }

    function onCameraQuaternionChanged() {
        cameraQuaternionData.version++;
    }

    function getCameraQuaternionData() {
        if(cameraQuaternionLastVersion !== cameraQuaternionData.version) {
            camera.quaternion.toArray(cameraQuaternionData.array);
            cameraQuaternionData.forwardMovement.set(0,0,1);
            cameraQuaternionData.forwardMovement.applyQuaternion(camera.quaternion);
            cameraQuaternionLastVersion = cameraQuaternionData.version;
        }
        return cameraQuaternionData;
    }

    function initCameras() {
        camera2d.position.set(0,0,400);
        camera3d.position.set(0,0,400);
    }

    function isCamera3d() {
        return camera===camera3d;
    }

    function copyCamera(from, to) {
        to.position.copy(from.position);
        to.quaternion.copy(from.quaternion);
    }

    function getCameraPosition() {
        return {
            'is3d' : isCamera3d(),
            'position' : camera.position.toArray(),
            'quaternion' : camera.quaternion.toArray(),
        };
    }

    function setCameraPosition(data) {
        setCamera3d(data.is3d);
        camera.quaternion.fromArray(data.quaternion);
        camera.position.fromArray(data.position);
    }

    function destroyEverything() {
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.setCamera3d = setCamera3d;
    core.isCamera3d = isCamera3d;
    core.getCamera = getCamera;
    core.setCameraPosition = setCameraPosition;
    core.getCameraPosition = getCameraPosition;
    core.getCameraQuaternionData = getCameraQuaternionData;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    window.addEventListener("resize",function() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
        camera2d.left = -gameWidth/2;
        camera2d.right = gameWidth/2;
        camera2d.top = gameHeight/2;
        camera2d.bottom = -gameHeight/2;
        camera2d.updateProjectionMatrix();
        camera3d.aspect = gameWidth / gameHeight;
        camera3d.updateProjectionMatrix();
    });

    initCameras();
    setCamera3d(true);
})));