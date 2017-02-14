(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.DOK = global.DOK || {}), global));
}(window, (function (core, global) { 'use strict';

    var point = { x: 0, y: 0, active:false };

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
    function addControlBall(camera) {
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

        ball.addEventListener("mousedown", function(e) {
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
            var dx = e.pageX - point.x;
            var dy = e.pageY - point.y;
            camera.rotateY(dx/100);
            camera.rotateX(dy/100);
            point.x = e.pageX;
            point.y = e.pageY;
        } else {
            deactivateBallControl();
        }
        e.preventDefault();
    }

    function boxMouseMove(e) {
        if(e.buttons===1 && point.active) {
            var dx = e.pageX - point.x;
            var dy = e.pageY - point.y;
            camera.translateX(-dx*10);
            camera.translateY(dy*10);
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
        }
    }

    function deactivateBallControl() {
        if(point.active) {
            document.removeEventListener("mousemove", ballMouseMove);
            document.removeEventListener("mouseup", mouseUpBall);
            point.active = false;
        }
    }

    function activateBoxControl() {
        if(!point.active) {
            document.addEventListener("mousemove", boxMouseMove);
            document.addEventListener("mouseup", mouseUpBox);
            point.active = true;
        }
    }

    function deactivateBoxControl() {
        if(point.active) {
            document.removeEventListener("mousemove", boxMouseMove);
            document.removeEventListener("mouseup", mouseUpBox);
            point.active = false;
        }
    }

    function addControlBox(camera) {
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