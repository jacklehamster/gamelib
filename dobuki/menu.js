(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var menus = {};
    var activeMenu;
    
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
    function getMenu(menu) {
        menus[menu.id] = menu;    
        var div = menu.div;
        var d;
        if(!div) {
            div = document.createElement("div");
            menu.div = div;
            div.id = menu.id;
            div.innerHTML = "";
            div.style.display = "none";
            div.style.position = "absolute";
            div.style.border = "10px double #DDDDDD";
        //    div.style.borderImage = "url(frame.png) round";
//            div.style.borderImageSlice = "30%";
//            div.style.borderImageWidth = "40px";
            div.style.boxShadow = "10px 10px rgba(0, 0, 0, 0.5)";
            d = document.createElement("div");
            menu.d = d;
            d.style.position = "absolute";
            d.style.backgroundColor = "black";
            d.style.width = "100%";
            d.style.height= "100%";
            d.style.color = "white";
            d.style.textAlign = "center";
            d.style.fontFamily = 'Courier';
            d.style.fontSize = "28px";
            d.style.top = "0px";
            div.appendChild(d);
            var arrow = document.createElement("img");
            menu.arrow = arrow;
            arrow.src = "arrow.png";
            arrow.style.position = "absolute";
            arrow.style.left = "10px";
            arrow.style.top = "15px";
            arrow.style.display = "none";
            var disp = null;
            var pos = {x:0,y:0};
            var arrowLooper = {
                id:menu.id + ".arrow",
                loop:function() {
                    if(getActiveMenu() !== menu) {
                        arrow.style.display = "none";
                        menu.selection = -1;
                        return false;
                    }
                    var newDisp = menu.selection>=0?"":"none";
                    if(newDisp != disp) {
                        disp = newDisp;
                        arrow.style.display = disp;
                    }
                    var left = Math.round(Math.sin(core.time/100)*6+10);
                    if(left!=pos.x) {
                        pos.x = left;
                        arrow.style.left = pos.x + "px";
                    }
                    var top = Math.round(10 + menu.selection * 36);
                    if(top!=pos.y) {
                        pos.y = top;
                        arrow.style.top = pos.y + "px";
                    }
                }
            };
            menu.arrowLooper = arrowLooper;
        }
        menu.selection = 0;
        menu.d.innerHTML = "";
        var maxLength = 0;
        for(var i=0;i<menu.list.length;i++) {
            var p = document.createElement("p");
            p.textContent = menu.list[i];
            menu.d.appendChild(p);
            maxLength = Math.max((menu.list[i]+"").length,maxLength);
        }
        menu.d.appendChild(menu.arrow);
        div.style.width = (17*maxLength + 74)+"px";
        div.style.height = menu.list.length*36 + "px";
        //console.log(maxLength,menu.list.length,div);
        document.body.appendChild(div);
        var position = menu.position;
        div.style.left = position[0] + "px";
        div.style.top = position[1] + "px";
        return div;    
    }

    function clearListeners() {
        document.removeEventListener("keydown", handleKey);
    }

    function addListeners() {
        document.addEventListener("keydown", handleKey);
    }

    function handleKey(e) {
        if(e.target===document.body) {
            if(e.type === "keydown") {
                document.dispatchEvent(new CustomEvent("firstPress",{
                     detail: {
                         keyCode: e.keyCode
                     }
                 }))
            }
            e.preventDefault();
        }
    }

    function showMenu(menu, trigger) {
        if(getActiveMenu() && trigger) {
            menuStack.push(getActiveMenu());
        }
        getMenu(menu).style.display = "";
        if(trigger) {
            triggerMenu(menu);
        }
        clearListeners();
        addListeners();
    }
    
    function hideMenu(menu) {
        getMenu(menu).style.display = "none";
        menu.shown = false;
        if(menuStack.length) {
            showMenu(menuStack.pop(), true);
        }
        clearListeners();
    }

    function toggleMenu(menu) {
        if(menu.shown) {
            hideMenu(menu);
        } else {
            showMenu(menu);
        }
    }

    var menuStack = [];
    
    function triggerMenu(menu) {
        activeMenu = menu;
        menu.shown = core.time;
        core.trigger(menu.arrowLooper);
    }
    
    function getActiveMenu() {
        return activeMenu && activeMenu.shown ? activeMenu : null;
    }
    
    function refreshMenus() {
        for(var i in menus) {
            var menu = menus[i];
            getMenu(menu);
        }
    }
         
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.showMenu = showMenu;
    core.hideMenu = hideMenu;
    core.toggleMenu = toggleMenu;
    core.getActiveMenu = getActiveMenu;
    core.refreshMenus = refreshMenus;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    window.addEventListener("resize", refreshMenus);

    document.addEventListener("firstPress",
        function(e) {
            var dx = 0, dy=0, act = false, cancel;
            switch(e.detail.keyCode) {
                case 27:
                    cancel = true;
                    break;
                case 32:
                    act = true;
                    break;
                case 87: case 38:
                dy++;
                break;
                case 83: case 40:
                dy--;
                break;
                case 65: case 37:
                dx--;
                break;
                case 68: case 39:
                dx++;
                break;
            }
            var activeMenu = core.getActiveMenu();
            if(activeMenu) {
                if(dy) {
                    activeMenu.selection = (activeMenu.selection-dy+activeMenu.list.length) % activeMenu.list.length;
                    if(activeMenu.select) {
                        activeMenu.select(activeMenu.selection);
                    }
                }
                if(act) {
                    if(activeMenu.action) {
                        activeMenu.action(activeMenu.selection);
                    }
                }
                if(cancel) {
                    if(activeMenu.cancel) {
                        activeMenu.cancel();
                    }
                }
            }
        }
    );

 })));