define([
	'goo/entities/Entity',
	'goo/math/Vector3',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/ParticleComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/particles/ParticleEmitter',
	'goo/particles/ParticleUtils',
	'goo/util/ParticleSystemUtils'
], function (
	Entity,
	Vector3,
	Material,
	TextureCreator,
	ShaderLib,
	TransformComponent,
	ParticleComponent,
	MeshDataComponent,
	MeshRendererComponent,
	ParticleEmitter,
	ParticleUtils,
	ParticleSystemUtils
) {
	var SCALE = 80;

	var textureCreator = new TextureCreator()
	var texture = textureCreator.loadTexture2D('assets/smoke.png');
	//var texture = ParticleSystemUtils.createFlareTexture()
	texture.generateMipmaps = true;

	var material = Material.createMaterial(ShaderLib.particles, 'BulletMaterial');
	material.setTexture('DIFFUSE_MAP', texture);
	material.blendState.blending = 'AdditiveBlending';
	material.cullState.enabled = false;
	material.depthState.write = false;
	material.renderQueue = 2002;

	/**
	 * Creates a new bullet.
	 */
	function Thruster(world, name, id) {
		Entity.apply(this, arguments); // Super constructor.

		this._createEmitter();

		var transformComponent = new TransformComponent();
		transformComponent.setTranslation(0, 0, -200);
		transformComponent.setScale(SCALE, SCALE, 1);

		var particleComponent = new ParticleComponent({	particleCount : 5000 });
		particleComponent.emitters.push(this.emitter);

		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		meshRendererComponent.cullMode = 'Never';

		this.setComponent(transformComponent);
		this.setComponent(particleComponent);
		this.setComponent(meshDataComponent);
		this.setComponent(meshRendererComponent);
	}
	Thruster.prototype = Object.create(Entity.prototype);
	Thruster.prototype.constructor = Thruster;


	/**
	 * Creates a new particle emitter for the thruster.
	 *
	 * @return {ParticleEmitter}
	 *		The emitter that was created.
	 */
	Thruster.prototype._createEmitter = function () {
		var that = this;

		this.emitter = new ParticleEmitter({
			minLifetime: 0.3,
			maxLifetime: 0.5,
			releaseRatePerSecond: 0,
			getEmissionVelocity: function (particle, particleEntity) {
				var vec3 = particle.velocity;
				//vec3.setd(0, 0, -1500);

				vec3.data[0] = (Math.random() - 0.5) * 10;
				vec3.data[1] = (Math.random() - 0.5) * 10;
				vec3.data[2] = (Math.random() + 4) * 2 * -300;

				return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
			},
			timeline: [{
				timeOffset: 0.0,
				spin: 0,
				mass: 1,
				size: 15,
				color: [1, 1, 1, 0.5]
			}, {
				timeOffset: 1.0,
				spin: 10,
				size: 5.0,
				color: [0, 0, 1, 0]
			}]
		});

		return this.emitter;
	};


	Thruster.prototype.start = function () {
		this.emitter.releaseRatePerSecond = 500;
	};


	Thruster.prototype.stop = function () {
		this.emitter.releaseRatePerSecond = 0;
	};


	return Thruster;
});