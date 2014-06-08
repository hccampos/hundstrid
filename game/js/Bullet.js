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
	var SIZE = 20;
	var SPEED = 5;

	var textureCreator = new TextureCreator()
	var bulletTexture = textureCreator.loadTexture2D('assets/bullet.png');
	var material = Material.createMaterial(ShaderLib.texturedLit, 'BulletMaterial');
	material.setTexture('DIFFUSE_MAP', bulletTexture);
	material.blendState.blending = 'CustomBlending';

	var meshData = new Quad();


	/**
	 * Creates a new bullet.
	 */
	function Bullet() {
		Entity.apply(this, arguments); // Super constructor.

		this.player = null;
		this.direction = 0;
		this.isAlive = false;

		var transformComponent = new TransformComponent();
		transformComponent.setTranslation(0, 0, 0);
		transformComponent.setRotation(-Math.PI / 2, 0, 0);
		transformComponent.setScale(SIZE, SIZE, 1);
		this.setComponent(transformComponent);

		var meshDataComponent = new MeshDataComponent(meshData);
		this.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		this.setComponent(meshRendererComponent);
	}

	Bullet.prototype.update = function (tpf, bounds) {
		var translationX = SPEED * tpf * Math.sin(this.direction);
		var translationZ = SPEED * tpf * Math.cos(this.direction);
		this.addTranslation(translationX, 0, translationZ);

		var t = this.getTranslation();
		if (t[0] > bounds.maxX ||
			t[0] < bounds.minX ||
			t[2] > bounds.maxY ||
			t[2] < bounds.minY) {
			this.hidden = true;
			this.isAlive = false;
		}
	};

	Bullet.prototype.spawn = function (position, direction) {
		this.setTranslation(position);
		this.direction = direction;
		this.isAlive = true;
		this.hidden = false;
	};

	Bullet.prototype = Object.create(Entity.prototype);
	Bullet.prototype.constructor = Bullet;

	return Bullet;
});