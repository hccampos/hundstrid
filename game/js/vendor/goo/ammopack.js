/* Goo Engine ammopack 
 * Copyright 2014 Goo Technologies AB
 */
(function(window){function f(){
define("goo/addons/ammopack/calculateTriangleMeshShape",[],function(){return function(e,t){t=t||[1,1,1];var n=4,r=!0,i=r?4:2,s=r?"i32":"i16",o=e.meshDataComponent.meshData,u=o.dataViews.POSITION,a=Ammo.allocate(n*u.length,"float",Ammo.ALLOC_NORMAL);for(var f=0,l=u.length;f<l;f++)Ammo.setValue(a+f*n,t[f%3]*u[f],"float");var c=o.indexData.data,h=Ammo.allocate(i*c.length,s,Ammo.ALLOC_NORMAL);for(var f=0,l=c.length;f<l;f++)Ammo.setValue(h+f*i,c[f],s);var p=new Ammo.btIndexedMesh;p.set_m_numTriangles(o.indexCount/3),p.set_m_triangleIndexBase(h),p.set_m_triangleIndexStride(i*3),p.set_m_numVertices(o.vertexCount),p.set_m_vertexBase(a),p.set_m_vertexStride(n*3);var d=new Ammo.btTriangleIndexVertexArray;return d.addIndexedMesh(p,2),new Ammo.btBvhTriangleMeshShape(d,!0,!0)}}),define("goo/addons/ammopack/AmmoComponent",["goo/entities/EntityUtils","goo/entities/components/Component","goo/math/Quaternion","goo/addons/ammopack/calculateTriangleMeshShape","goo/shapes/Box","goo/shapes/Quad","goo/shapes/Sphere","goo/renderer/Material","goo/renderer/shaders/ShaderLib","goo/renderer/bounds/BoundingBox","goo/renderer/bounds/BoundingSphere","goo/util/ObjectUtil"],function(e,t,n,r,i,s,o,u,a,f,l,c){function h(e){this.settings=e=e||{},c.defaults(e,{mass:0,useBounds:!1,useWorldBounds:!1,useWorldTransform:!1,linearFactor:new Ammo.btVector3(1,1,1),isTrigger:!1,onInitializeBody:null,scale:null,translation:null,rotation:null}),this.mass=e.mass,this.useBounds=e.useBounds,this.useWorldBounds=e.useWorldBounds,this.useWorldTransform=e.useWorldTransform,this.linearFactor=e.linearFactor,this.onInitializeBody=e.onInitializeBody,this.isTrigger=e.isTrigger,this.scale=e.scale,this.translation=e.translation,this.rotation=e.rotation,this.type="AmmoComponent",this.ammoTransform=new Ammo.btTransform,this.gooQuaternion=new n,this.shape=undefined}return h.prototype=Object.create(t.prototype),h.prototype.getAmmoShapefromGooShape=function(e,t){var n,u=[Math.abs(t.scale.x),Math.abs(t.scale.y),Math.abs(t.scale.z)];this.scale&&(u=[Math.abs(this.scale.x),Math.abs(this.scale.y),Math.abs(this.scale.z)]);if(e.meshDataComponent&&e.meshDataComponent.meshData){var a=e.meshDataComponent.meshData;if(a instanceof i)n=new Ammo.btBoxShape(new Ammo.btVector3(a.xExtent*u[0],a.yExtent*u[1],a.zExtent*u[2]));else if(a instanceof o)n=new Ammo.btSphereShape(a.radius*u[0]);else if(a instanceof s)n=new Ammo.btBoxShape(new Ammo.btVector3(a.xExtent,a.yExtent,.01));else if(this.useBounds||this.mass>0){e.meshDataComponent.computeBoundFromPoints();var c=e.meshDataComponent.modelBound;c instanceof f?n=new Ammo.btBoxShape(new Ammo.btVector3(c.xExtent*u[0],c.yExtent*u[1],c.zExtent*u[2])):c instanceof l&&(n=new Ammo.btSphereShape(c.radius*u[0]))}else n=r(e,u)}else{var n=new Ammo.btCompoundShape,h=e.transformComponent.children;for(var p=0;p<h.length;p++){var d=this.getAmmoShapefromGooShape(h[p].entity,t),v=new Ammo.btTransform;v.setIdentity();var m=h[p].transform.translation;v.setOrigin(new Ammo.btVector3(m.x,m.y,m.z)),n.addChildShape(v,d)}}return n},h.prototype.getAmmoShapefromGooShapeWorldBounds=function(t){var n,r=e.getTotalBoundingBox(t);return this.center=r.center,n=new Ammo.btBoxShape(new Ammo.btVector3(r.xExtent,r.yExtent,r.zExtent)),n},h.prototype.initialize=function(e){var t=e.transformComponent.transform;this.useWorldTransform&&(t=e.transformComponent.worldTransform);var n=this.translation||t.translation,r=this.rotation||t.rotation,i=new Ammo.btTransform;i.setIdentity(),i.setOrigin(new Ammo.btVector3(n.x,n.y,n.z)),this.gooQuaternion.fromRotationMatrix(r);var s=this.gooQuaternion;i.setRotation(new Ammo.btQuaternion(s.x,s.y,s.z,s.w)),this.useWorldBounds?(e._world.process(),this.shape=this.getAmmoShapefromGooShapeWorldBounds(e,t),this.difference=this.center.clone().sub(t.translation).invert()):this.shape=this.getAmmoShapefromGooShape(e,t);if(!1===this.isTrigger){var o=new Ammo.btDefaultMotionState(i),u=new Ammo.btVector3(0,0,0);this.mass!==0&&this.shape.calculateLocalInertia(this.mass,u);var a=new Ammo.btRigidBodyConstructionInfo(this.mass,o,this.shape,u);this.localInertia=u,this.body=new Ammo.btRigidBody(a),this.body.setLinearFactor(this.linearFactor),this.onInitializeBody&&this.onInitializeBody(this.body)}},h.prototype.showBounds=function(t){var n=e.getTotalBoundingBox(t),r,s=new u(a.simpleLit);s.wireframe=!0,n.xExtent?r=t._world.createEntity(new i(n.xExtent*2,n.yExtent*2,n.zExtent*2),s):n.radius&&(r=t._world.createEntity(new o(12,12,n.radius),s)),r.transformComponent.setTranslation(n.center),r.addToWorld(),this.bv=r},h.prototype.setPhysicalTransform=function(e){var t=e.translation;this.ammoTransform.setIdentity(),this.ammoTransform.setOrigin(new Ammo.btVector3(t.x,t.y,t.z)),this.gooQuaternion.fromRotationMatrix(e.rotation);var n=this.gooQuaternion;this.ammoTransform.setRotation(new Ammo.btQuaternion(n.x,n.y,n.z,n.w)),this.body.setWorldTransform(this.ammoTransform)},h.prototype.copyPhysicalTransformToVisual=function(e){var t=e.transformComponent;if(!this.body)return;this.body.getMotionState().getWorldTransform(this.ammoTransform);var n=this.ammoTransform.getRotation();this.gooQuaternion.setd(n.x(),n.y(),n.z(),n.w()),t.transform.rotation.copyQuaternion(this.gooQuaternion);var r=this.ammoTransform.getOrigin();t.setTranslation(r.x(),r.y(),r.z()),this.settings.showBounds&&(this.bv||this.showBounds(e),this.bv.transformComponent.transform.rotation.copy(t.transform.rotation),this.bv.transformComponent.setTranslation(t.transform.translation)),this.difference&&t.addTranslation(this.difference)},h}),define("goo/addons/ammopack/AmmoSystem",["goo/entities/systems/System"],function(e){function t(t){e.call(this,"AmmoSystem",["AmmoComponent","TransformComponent"]),this.settings=t||{},this.fixedTime=1/(this.settings.stepFrequency||60),this.maxSubSteps=this.settings.maxSubSteps||5;var n=new Ammo.btDefaultCollisionConfiguration,r=new Ammo.btCollisionDispatcher(n),i=new Ammo.btDbvtBroadphase,s=new Ammo.btSequentialImpulseConstraintSolver;this.ammoWorld=new Ammo.btDiscreteDynamicsWorld(r,i,s,n),this.ammoWorld.setGravity(new Ammo.btVector3(0,this.settings.gravity||-9.81,0))}return t.prototype=Object.create(e.prototype),t.prototype.inserted=function(e){e.ammoComponent?(e.ammoComponent.initialize(e),this.ammoWorld.addRigidBody(e.ammoComponent.body)):console.log("Warning: missing entity.ammoComponent")},t.prototype.deleted=function(e){e.ammoComponent&&this.ammoWorld.removeRigidBody(e.ammoComponent.body)},t.prototype.process=function(e,t){this.ammoWorld.stepSimulation(t,this.maxSubSteps,this.fixedTime);for(var n=0;n<e.length;n++){var r=e[n];r.ammoComponent.mass>0&&r.ammoComponent.copyPhysicalTransformToVisual(r,t)}},t}),define("goo/addons/ammopack/AmmoRegister",["goo/scripts/Scripts","goo/addons/ammopack/AmmoSystem","goo/addons/ammopack/AmmoComponent","goo/addons/ammopack/calculateTriangleMeshShape"],function(e){var t=["goo/scripts/Scripts","goo/addons/ammopack/AmmoSystem","goo/addons/ammopack/AmmoComponent","goo/addons/ammopack/calculateTriangleMeshShape"];for(var n=1;n<t.length;n++){var r=t[n].slice(t[n].lastIndexOf("/")+1);e.addClass(r,arguments[n])}}),require(["goo/addons/ammopack/AmmoComponent","goo/addons/ammopack/AmmoRegister","goo/addons/ammopack/AmmoSystem","goo/addons/ammopack/calculateTriangleMeshShape"],function(e,t,n,r){var i=window.goo;if(!i)return;i.AmmoComponent=e,i.AmmoRegister=t,i.AmmoSystem=n,i.calculateTriangleMeshShape=r}),define("goo/addons/ammopack/ammopack",function(){});
}try{
if(window.localStorage&&window.localStorage.gooPath){
window.require.config({
paths:{goo:localStorage.gooPath}
});
}else f()
}catch(e){f()}
})(window,undefined)