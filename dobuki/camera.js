(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';
    var camera2d = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var camera3d = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, THREE.Infinity );
    var camera = camera3d;
    camera.position.set(0,0,400);

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

    function setCamera3d(value) {
        console.log("here",value);
        if(value && camera!==camera3d) {
            camera = camera3d;
            copyCamera(camera2d,camera);
        } else if(!value && camera===camera3d) {
            console.log("here",value);
            camera = camera2d;
            copyCamera(camera3d,camera);
        }
    }

    function isCamera3d() {
        return camera===camera3d;
    }

    function copyCamera(from, to) {
//        to.copy(from);
        to.position.copy(from.position);
        to.rotation.copy(from.rotation);
    }

    function destroyEverything() {
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.setCamera3d = setCamera3d;
    core.isCamera3d = isCamera3d;
    core.getCamera = getCamera;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    window.addEventListener("resize",function() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
        if(camera.isOrthographicCamera) {
            camera.left = -gameWidth/2;
            camera.right = gameWidth/2;
            camera.top = gameHeight/2;
            camera.bottom = -gameHeight/2;
        }
        else if(camera.isPerspectiveCamera) {
            camera.aspect = gameWidth / gameHeight;
        }
        camera.updateProjectionMatrix();
    });


})));