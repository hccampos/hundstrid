define([
	'goo/entities/Entity',
	'goo/math/Vector2',
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
	Material,
	TextureCreator,
	ShaderLib,
	Quad,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent
) {
	var SIZE = 30;
	var SPEED = 700;
	var X_ROTATION = -Math.PI / 2;
	var DAMAGE = 100;

	var textureCreator = new TextureCreator()
	var bulletTexture = textureCreator.loadTexture2D('assets/beam.jpg');
	var material = Material.createMaterial(ShaderLib.textured, 'BulletMaterial');
	material.setTexture('DIFFUSE_MAP', bulletTexture);
	material.blendState.blending = 'AdditiveBlending';

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

		var transformComponent = new TransformComponent();
		transformComponent.setTranslation(0, 0, 0);
		transformComponent.setRotation(X_ROTATION, 0, 0);
		transformComponent.setScale(SIZE, SIZE / 2, 1);
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
	Bullet.prototype.update = function (tpf, bounds) {
		var translationX = this.speed * tpf * Math.sin(this.direction);
		var translationZ = this.speed * tpf * Math.cos(this.direction);
		this.addTranslation(translationX, 0, translationZ);

		var t = this.getTranslation();
		if (t[0] > bounds.maxX ||
			t[0] < bounds.minX ||
			t[2] > bounds.maxY ||
			t[2] < bounds.minY) {
			this.kill()
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
		this.direction = direction;
		this.speed = speed + SPEED;
		this.isAlive = true;
		this.damage = DAMAGE;
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