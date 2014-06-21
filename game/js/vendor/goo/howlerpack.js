/* Goo Engine howlerpack 
 * Copyright 2014 Goo Technologies AB
 */
(function(window){function f(){
define("goo/addons/howlerpack/components/HowlerComponent",["goo/entities/components/Component"],function(e){function t(){this.type="HowlerComponent",this.sounds=[]}return t.prototype=Object.create(e.prototype),t.prototype.addSound=function(e){this.sounds.indexOf(e)===-1&&this.sounds.push(e)},t.prototype.playSound=function(e,t,n){this.sounds[e].play(t,n)},t.prototype.getSound=function(e){return this.sounds[e]},t}),define("goo/addons/howlerpack/systems/HowlerSystem",["goo/entities/systems/System","goo/math/Vector3","goo/renderer/Renderer"],function(e,t,n){function r(t){e.call(this,"HowlerSystem",["HowlerComponent"]),this.settings=t||{},this.settings.scale=this.settings.scale||.1,this.entities=[]}return r.prototype=Object.create(e.prototype),r.prototype.deleted=function(e){var t=e.howlerComponent;if(t&&t.sounds){var n=t.sounds;for(var r=0;r<n.length;r++)n[r].stop()}},r.prototype.process=function(e){this.entities=e;for(var r=0;r<e.length;r++){var i=e[r],s=i.howlerComponent,o=s.sounds,u=new t;u.copy(i.transformComponent.transform.translation);if(n.mainCamera){var a=n.mainCamera.getViewMatrix().applyPostPoint(u);for(var f=0;f<o.length;f++)o[f].pos3d(a.data[0]*this.settings.scale,a.data[1]*this.settings.scale,a.data[2]*this.settings.scale)}}},r}),define("goo/addons/howlerpack/HowlerRegister",["goo/scripts/Scripts","goo/addons/howlerpack/components/HowlerComponent","goo/addons/howlerpack/systems/HowlerSystem"],function(e){var t=["goo/scripts/Scripts","goo/addons/howlerpack/components/HowlerComponent","goo/addons/howlerpack/systems/HowlerSystem"];for(var n=1;n<t.length;n++){var r=t[n].slice(t[n].lastIndexOf("/")+1);e.addClass(r,arguments[n])}}),require(["goo/addons/howlerpack/HowlerRegister","goo/addons/howlerpack/components/HowlerComponent","goo/addons/howlerpack/systems/HowlerSystem"],function(e,t,n){var r=window.goo;if(!r)return;r.HowlerRegister=e,r.HowlerComponent=t,r.HowlerSystem=n}),define("goo/addons/howlerpack/howlerpack",function(){});
}try{
if(window.localStorage&&window.localStorage.gooPath){
window.require.config({
paths:{goo:localStorage.gooPath}
});
}else f()
}catch(e){f()}
})(window)