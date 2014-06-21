/* Goo Engine soundmanager2pack 
 * Copyright 2014 Goo Technologies AB
 */
(function(window){function f(){
define("goo/addons/soundmanager2pack/systems/SoundManager2System",["goo/entities/systems/System"],function(e){function t(t){e.call(this,"SoundManager2System",["SoundManager2Component","TransformComponent"]),t=t||{},this.isReady=!1,window.soundManager?window.soundManager.bind(this).setup({url:"swf",onready:function(){this.isReady=!0},ontimeout:function(){console.warn("Failed to load soundmanager")}}):console.warn("SoundManager2System: soundManager global not found")}return t.prototype=Object.create(e.prototype),t.prototype.inserted=function(e){var t=e.soundManager2Component;for(var n=0;n<t.sounds.length;n++){var r=t.sounds[n],i=window.soundManager.createSound(r);r.soundObject=i}},t.prototype.deleted=function(){},t.prototype.process=function(){},t}),define("goo/addons/soundmanager2pack/components/SoundManager2Component",["goo/entities/components/Component"],function(e){function t(e){this.type="SoundManager2Component",this.settings=e||{},this.sounds={}}return t.prototype=Object.create(e.prototype),t.prototype.addSound=function(e,t){this.sounds[e]=t},t.prototype.playSound=function(e){this.sounds[e].soundObject.play()},t}),define("goo/addons/soundmanager2pack/SoundManager2Register",["goo/scripts/Scripts","goo/addons/soundmanager2pack/systems/SoundManager2System","goo/addons/soundmanager2pack/components/SoundManager2Component"],function(e){var t=["goo/scripts/Scripts","goo/addons/soundmanager2pack/systems/SoundManager2System","goo/addons/soundmanager2pack/components/SoundManager2Component"];for(var n=1;n<t.length;n++){var r=t[n].slice(t[n].lastIndexOf("/")+1);e.addClass(r,arguments[n])}}),require(["goo/addons/soundmanager2pack/SoundManager2Register","goo/addons/soundmanager2pack/components/SoundManager2Component","goo/addons/soundmanager2pack/systems/SoundManager2System"],function(e,t,n){var r=window.goo;if(!r)return;r.SoundManager2Register=e,r.SoundManager2Component=t,r.SoundManager2System=n}),define("goo/addons/soundmanager2pack/soundmanager2pack",function(){});
}try{
if(window.localStorage&&window.localStorage.gooPath){
window.require.config({
paths:{goo:localStorage.gooPath}
});
}else f()
}catch(e){f()}
})(window)