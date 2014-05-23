/* Goo Engine cannonpack 
 * Copyright 2014 Goo Technologies AB
 */
(function(window){function f(){
define("goo/addons/cannonpack/CannonBoxColliderComponent",["goo/entities/components/Component","goo/shapes/Box","goo/math/Vector3"],function(e,t,n){function i(e){this.type="CannonBoxColliderComponent",e=e||{};var t=this.halfExtents=e.halfExtents||new n(.5,.5,.5);this.cannonShape=new r.Box(new r.Vec3(t.x,t.y,t.z))}var r=window.CANNON;return i.prototype=Object.create(e.prototype),i.constructor=i,i}),define("goo/addons/cannonpack/CannonDistanceJointComponent",["goo/entities/components/Component","goo/util/ObjectUtil"],function(e,t){function r(e){e=e||{},this.type="CannonDistanceJointComponent",t.defaults(e,{distance:1,connectedBody:null}),this.distance=e.distance,this.connectedBody=e.connectedBody,this.cannonConstraint=null}var n=window.CANNON;return r.prototype=Object.create(e.prototype),r.constructor=r,r.prototype.createConstraint=function(e){var t=e.cannonRigidbodyComponent.body,r=this.connectedBody.body;return this.cannonConstraint=new n.DistanceConstraint(t,r,this.distance),this.cannonConstraint},r}),define("goo/addons/cannonpack/CannonPlaneColliderComponent",["goo/entities/components/Component"],function(e){function n(e){this.type="CannonPlaneColliderComponent",e=e||{},this.cannonShape=new t.Plane}var t=window.CANNON;return n.prototype=Object.create(e.prototype),n.constructor=n,n}),define("goo/addons/cannonpack/CannonRigidbodyComponent",["goo/entities/components/Component","goo/math/Quaternion","goo/math/Vector3","goo/math/Transform","goo/shapes/Box","goo/shapes/Sphere","goo/shapes/Quad","goo/util/ObjectUtil"],function(e,t,n,r,i,s,o,u){function f(e){e=e||{},this.type="CannonRigidbodyComponent",u.defaults(e,{mass:1,velocity:new n}),this.mass=e.mass,this._initialized=!1,this._quat=new t,this._initialVelocity=new n,this._initialVelocity.setv(e.velocity),this.api={setForce:function(e){f.prototype.setForce.call(this,e)}.bind(this),setVelocity:function(e){f.prototype.setVelocity.call(this,e)}.bind(this),setPosition:function(e){f.prototype.setPosition.call(this,e)}.bind(this),setAngularVelocity:function(e){f.prototype.setAngularVelocity.call(this,e)}.bind(this)}}var a=window.CANNON;return f.prototype=Object.create(e.prototype),f.constructor=f,f.prototype.setForce=function(e){this.body.force.set(e.x,e.y,e.z)},f.prototype.setVelocity=function(e){this.body.velocity.set(e.x,e.y,e.z)},f.prototype.setPosition=function(e){this.body.position.set(e.x,e.y,e.z)},f.prototype.setAngularVelocity=function(e){this.body.angularVelocity.set(e.x,e.y,e.z)},f.getCollider=function(e){return e.cannonBoxColliderComponent||e.cannonPlaneColliderComponent||e.cannonSphereColliderComponent||null},f.prototype.createShape=function(e){var t,n=f.getCollider(e);if(!n){t=new a.Compound;var i=e.transformComponent.worldTransform,s=new r;s.copy(i),s.invert(s);var o=this;e.traverse(function(e){var n=f.getCollider(e);if(n){var r=e.transformComponent.transform,i=r.translation,s=r.rotation,u=new a.Vec3(i.x,i.y,i.z),l=o._quat;l.fromRotationMatrix(s);var c=new a.Quaternion(l.x,l.y,l.z,l.w);t.addChild(n.cannonShape,u,c)}})}else t=n.cannonShape;return t},f}),define("goo/addons/cannonpack/CannonSphereColliderComponent",["goo/entities/components/Component"],function(e){function n(e){e=e||{},this.type="CannonSphereColliderComponent",this.radius=e.radius||.5,this.cannonShape=new t.Sphere(this.radius)}var t=window.CANNON;return n.prototype=Object.create(e.prototype),n.constructor=n,n}),define("goo/addons/cannonpack/CannonSystem",["goo/entities/systems/System","goo/renderer/bounds/BoundingBox","goo/renderer/bounds/BoundingSphere","goo/math/Quaternion","goo/math/Transform","goo/math/Vector3","goo/util/ObjectUtil"],function(e,t,n,r,i,s,o){function a(t){e.call(this,"CannonSystem",["CannonRigidbodyComponent","TransformComponent"]),t=t||{},o.defaults(t,{gravity:new s(0,-10,0),stepFrequency:60,broadphase:"naive"});var n=this.world=new u.World;n.gravity.x=t.gravity.x,n.gravity.y=t.gravity.y,n.gravity.z=t.gravity.z,this.setBroadphaseAlgorithm(t.broadphase),this.stepFrequency=t.stepFrequency,this._quat=new r}var u=window.CANNON;return a.prototype=Object.create(e.prototype),a.prototype.inserted=function(e){var t=e.cannonRigidbodyComponent,n=e.transformComponent,r=t.createShape(e);if(!r){e.clearComponent("CannonComponent");return}var i=new u.RigidBody(t.mass,r);t.body=i,e.setPosition(n.transform.translation),e.setVelocity(t._initialVelocity);var s=this._quat;s.fromRotationMatrix(n.transform.rotation),i.quaternion.set(s.x,s.y,s.z,s.w),this.world.add(i);var o=e.cannonDistanceJointComponent;o&&this.world.addConstraint(o.createConstraint(e))},a.prototype.deleted=function(e){var t=e.cannonRigidbodyComponent;t&&this.world.remove(t.body)},a.prototype.process=function(e){this.world.step(1/this.stepFrequency);for(var t=0;t<e.length;t++){var n=e[t],r=n.cannonRigidbodyComponent,i=r.body.position;n.transformComponent.setTranslation(i.x,i.y,i.z);var s=r.body.quaternion;this._quat.set(s.x,s.y,s.z,s.w),n.transformComponent.transform.rotation.copyQuaternion(this._quat),n.transformComponent.setUpdated()}},a.prototype.setBroadphaseAlgorithm=function(e){var t=this.world;switch(e){case"naive":t.broadphase=new u.NaiveBroadphase;break;case"sap":t.broadphase=new u.SAPBroadphase(t);break;default:throw new Error("Broadphase not supported: "+e)}},a}),define("goo/addons/cannonpack/CannonRegister",["goo/scripts/Scripts","goo/addons/cannonpack/CannonBoxColliderComponent","goo/addons/cannonpack/CannonDistanceJointComponent","goo/addons/cannonpack/CannonPlaneColliderComponent","goo/addons/cannonpack/CannonRigidbodyComponent","goo/addons/cannonpack/CannonSphereColliderComponent","goo/addons/cannonpack/CannonSystem"],function(e){var t=["goo/scripts/Scripts","goo/addons/cannonpack/CannonBoxColliderComponent","goo/addons/cannonpack/CannonDistanceJointComponent","goo/addons/cannonpack/CannonPlaneColliderComponent","goo/addons/cannonpack/CannonRigidbodyComponent","goo/addons/cannonpack/CannonSphereColliderComponent","goo/addons/cannonpack/CannonSystem"];for(var n=1;n<t.length;n++){var r=t[n].slice(t[n].lastIndexOf("/")+1);e.addClass(r,arguments[n])}}),require(["goo/addons/cannonpack/CannonBoxColliderComponent","goo/addons/cannonpack/CannonDistanceJointComponent","goo/addons/cannonpack/CannonPlaneColliderComponent","goo/addons/cannonpack/CannonRegister","goo/addons/cannonpack/CannonRigidbodyComponent","goo/addons/cannonpack/CannonSphereColliderComponent","goo/addons/cannonpack/CannonSystem"],function(e,t,n,r,i,s,o){var u=window.goo;if(!u)return;u.CannonBoxColliderComponent=e,u.CannonDistanceJointComponent=t,u.CannonPlaneColliderComponent=n,u.CannonRegister=r,u.CannonRigidbodyComponent=i,u.CannonSphereColliderComponent=s,u.CannonSystem=o}),define("goo/addons/cannonpack/cannonpack",function(){});
}try{
if(window.localStorage&&window.localStorage.gooPath){
window.require.config({
paths:{goo:localStorage.gooPath}
});
}else f()
}catch(e){f()}
})(window,undefined)