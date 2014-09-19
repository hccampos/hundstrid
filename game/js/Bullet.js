define([
	'goo/entities/Entity',
	'goo/math/Vector2',
	'goo/math/Vector3',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Quad',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
], function (
	Entity,
	Vector2,
	Vector3,
	Material,
	TextureCreator,
	ShaderLib,
	Quad,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent
) {
	var SIZE = 10;
	var SPEED = 600;
	var X_ROTATION = -Math.PI / 2;
	var DAMAGE = 100;

	var textureCreator = new TextureCreator();
	var bulletTexture = textureCreator.loadTexture2D('assets/bullet.png');
	var material = Material.createMaterial(ShaderLib.textured, 'BulletMaterial');
	material.setTexture('DIFFUSE_MAP', bulletTexture);
	material.blendState.blending = 'CustomBlending';

	// Quad where the bullet texture will be rendered.
	var meshData = new Quad();

	/**
	 * Creates a new bullet.
	 */
	function Bullet(world, id, name) {
		Entity.apply(this, arguments); // Super constructor.

		this.player = null;
		this.direction = 0;
		this.speed = SPEED;
		this.isAlive = false;

		this._gravity = new Vector3();
		this._velocity = new Vector3();

		var transformComponent = new TransformComponent();
		transformComponent.setTranslation(0, 0, 0);
		transformComponent.setRotation(X_ROTATION, 0, 0);
		transformComponent.setScale(SIZE * 2, SIZE / 0.5, 1);
		this.setComponent(transformComponent);

		var meshDataComponent = new MeshDataComponent(meshData);
		this.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		this.setComponent(meshRendererComponent);
	}
	Bullet.prototype = Object.create(Entity.prototype);
	Bullet.prototype.constructor = Bullet;

	/**
	 * Updates the bullet by moving it and checking if it went off the screen.
	 *
	 * @param  {number} tpf
	 * @param  {object} bounds
	 */
	Bullet.prototype.update = function (tpf, bounds, planet) {
		var t = this.transformComponent.worldTransform.translation;
		var plannetPos = planet.transformComponent.worldTransform.translation;
		var dist = plannetPos.distance(t);
		var g = 1;
		if (dist > 0)
			g = 700000 / (dist * dist);

		var gravity = this._gravity;
		gravity.setv(plannetPos);
		gravity.subv(t); // Vector from the ship to the planet.
		gravity.normalize(); // Turns into a direction vector.
		gravity.muld(g, g, g); // Becomes the gravity vector.

		//var tmp = gravity[1];
		//gravity[1] = gravity[2];
		//gravity[2] = tmp;

		var v = this._velocity;
		v.addv(gravity); // Apply gravity.

		var dX = v[0] * tpf;
		var dZ = v[2] * tpf;
		this.addTranslation(dX, 0, dZ);

		this.setRotation(X_ROTATION, Math.atan2(dX, dZ) + Math.PI / 2, 0);

		t = this.transformComponent.worldTransform.translation;
		if (t[0] > bounds.maxX ||
			t[0] < bounds.minX ||
			t[2] > bounds.maxY ||
			t[2] < bounds.minY) {
			this.kill();
		}
	};

	/**
	 * Spwans this bullet in the specified position and moving in the specified
	 * direction.
	 *
	 * @param  {Vector2} position
	 * 		The position where the bullet is to be spawned.
	 * @param  {number} direction
	 * 		The initial direction of the bullet.
	 */
	Bullet.prototype.spawn = function (position, direction, speed) {
		this.setTranslation(position);
		this.setRotation(X_ROTATION, direction + Math.PI / 2, 0);
		this.isAlive = true;
		this.damage = DAMAGE;
		this._gravity.setd(0, 0, 0);
		var newSpeed = speed + SPEED;
		this._velocity.setd(Math.sin(direction) * newSpeed, 0, Math.cos(direction) * newSpeed);
		this.addToWorld();
	};


	/**
	 * Kills the bullet and makes it available for respawning.
	 */
	Bullet.prototype.kill = function () {
		this.removeFromWorld();
		this.isAlive = false;
	};

	return Bullet;
});