(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';

    var point = { x: 0, y: 0, active:false };
    var downTime = 0;
    var centerizer = {
        loop: function() {
            var camera = core.getCamera();
            camera.rotation.z *= .8;
            if (Math.abs(camera.rotation.z) < .01) {
                camera.rotation.z = 0;
                core.untrigger(this);
            }
        }
    };

    /**
     *  HEADER
     */
    core.requireScripts([
        'setup.js',
        'menu.js',
        'camera.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function addControlBall(cam) {
        var ball = document.createElement("canvas");
        ball.width = 100;
        ball.height = 100;
        ball.style.position = "absolute";
        ball.style.width = "50px";
        ball.style.height = "50px";
        ball.style.zIndex = 1;
        ball.style.top = 0;
        ball.style.left = (window.innerWidth - 50)+"px";

        var context = ball.getContext("2d");
        context.beginPath();
        context.arc(50, 50, 40, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();

        var menus = {
            camera: {
                selection: 0,
                id: "startMenu",
                position: [30,30],
                list: [
                    "CAMERA PERSPECTIVE",
                ],
                action: function(selection) {
                    if(selection===0) {
                        var cam3d = DOK.isCamera3d();
                        cam3d = !cam3d;
                        this.list[selection] = cam3d ? "CAMERA PERSPECTIVE" : "CAMERA ORTHOGRAPHIC";
                        DOK.refreshMenus();
                        DOK.setCamera3d(cam3d);
                    }
                },
            },
        };

        ball.addEventListener("mouseover", function(e) {
            core.showMenu(menus.camera, true);
        });
        ball.addEventListener("mouseout", function(e) {
            core.hideMenu(menus.camera);
        });

        ball.addEventListener("mousedown", function(e) {
            var camera = core.getCamera();
            point.x = e.pageX;
            point.y = e.pageY;
            activateBallControl();
            e.preventDefault();
        });

        window.addEventListener("resize",
            function() {
                ball.style.left = (window.innerWidth - 50)+"px";
            }
        );
        document.body.appendChild(ball);
    }

    function ballMouseMove(e) {
        if(e.buttons===1 && point.active) {
            var camera = core.getCamera();
            var dx = e.pageX - point.x;
            var dy = e.pageY - point.y;
            if(DOK.anyKeyPressed(16)) {
                camera.rotateZ(-dx/100);
            } else {
                camera.rotateY(-dx/100);
            }
            camera.rotateX(-dy/100);
            point.x = e.pageX;
            point.y = e.pageY;
        } else {
            deactivateBallControl();
        }
        e.preventDefault();
    }

    function boxMouseMove(e) {
        if(e.buttons===1 && point.active) {
            var camera = core.getCamera();
            var dx = e.pageX - point.x;
            var dy = e.pageY - point.y;
            camera.translateX(dx*10);
            if(DOK.anyKeyPressed(16)) {
                camera.translateZ(dy*10);
            } else {
                camera.translateY(-dy*10);
            }
            point.x = e.pageX;
            point.y = e.pageY;
        } else {
            deactivateBallControl();
        }
        e.preventDefault();
    }

    function mouseUpBall(e) {
        deactivateBallControl();
    }

    function mouseUpBox(e) {
        deactivateBoxControl();
    }

    function activateBallControl() {
        if(!point.active) {
            document.addEventListener("mousemove", ballMouseMove);
            document.addEventListener("mouseup", mouseUpBall);
            point.active = true;
            downTime = core.time;
        }
    }

    function deactivateBallControl() {
        if(point.active) {
            document.removeEventListener("mousemove", ballMouseMove);
            document.removeEventListener("mouseup", mouseUpBall);
            point.active = false;
            if(core.time - downTime < 100) {
                core.trigger(centerizer);
            }
            downTime = 0;
        }
    }

    function activateBoxControl() {
        if(!point.active) {
            document.addEventListener("mousemove", boxMouseMove);
            document.addEventListener("mouseup", mouseUpBox);
            point.active = true;
            downTime = core.time;
        }
    }

    function deactivateBoxControl() {
        if(point.active) {
            document.removeEventListener("mousemove", boxMouseMove);
            document.removeEventListener("mouseup", mouseUpBox);
            point.active = false;
            downTime = 0;
        }
    }

    function addControlBox(cam) {
        var box = document.createElement("canvas");
        box.width = 100;
        box.height = 100;
        box.style.position = "absolute";
        box.style.width = "50px";
        box.style.height = "50px";
        box.style.zIndex = 1;
        box.style.top = "50px";
        box.style.left = (window.innerWidth - 50)+"px";

        var context = box.getContext("2d");
        context.beginPath();
        context.rect(30,10,40,90);
        context.fillStyle = 'green';
        context.fill();

        box.addEventListener("mousedown", function(e) {
            var camera = core.getCamera();
            point.x = e.pageX;
            point.y = e.pageY;
            activateBoxControl();
            e.preventDefault();
        });

        window.addEventListener("resize",
            function() {
                box.style.left = (window.innerWidth - 50)+"px";
            }
        );
        document.body.appendChild(box);
    }

    function destroyEverything() {
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.addControlBall = addControlBall;
    core.addControlBox = addControlBox;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */


})));