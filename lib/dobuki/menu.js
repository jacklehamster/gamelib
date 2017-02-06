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
            d.style.fontFamily = '"bit", Courier';
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
            var arrowLooper = {
                id:"arrow",
                loop:function() {
                    if(getActiveMenu() != menu) {
                        menu.selection = -1;
                        untrigger(this);
                    }
                    arrow.style.display = menu.selection>=0?"":"none";
                    arrow.style.left = Math.floor(Math.sin(DOK.time/100)*6+10) + "px";
                    arrow.style.top = (15 + menu.selection * 36) + "px";
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
        div.style.height = menu.list.length*40 + "px";
        //console.log(maxLength,menu.list.length,div);
        document.body.appendChild(div);
        var position = menu.position;
        div.style.left = position[0] + "px";
        div.style.top = position[1] + "px";
        return div;    
    }
    
    function showMenu(menu, trigger) {
        getMenu(menu).style.display = "";
        if(trigger) {
            triggerMenu(menu);
        }
    }
    
    function hideMenu(menu) {
        getMenu(menu).style.display = "none";
    }
    
    function triggerMenu(menu) {
        activeMenu= menu;
        menu.shown = DOK.time;
        DOK.trigger(menu.arrowLooper);        
    }
    
    function getActiveMenu() {
        return activeMenu;
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
    core.getActiveMenu = getActiveMenu;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    window.addEventListener("resize", refreshMenus);
     
 })));