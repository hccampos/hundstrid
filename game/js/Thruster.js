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
	var MAX_PARTICLES = 5000;
	var PARTICLES_PER_SECOND = 300;
	var EMITTER_SETTINGS = {
		minLifetime: 0.3,
		maxLifetime: 0.5,
		releaseRatePerSecond: 0,
		getEmissionVelocity: function (particle, particleEntity) {
			var vec3 = particle.velocity;

			// Spread the particles a bit to make the effect look more natural.
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
	};


	var textureCreator = new TextureCreator()
	var texture = textureCreator.loadTexture2D('assets/smoke.png');
	//var texture = ParticleSystemUtils.createFlareTexture()
	texture.generateMipmaps = true;

	var material = Material.createMaterial(ShaderLib.particles, 'ThrusterMaterial');
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

		var transformComponent = new TransformComponent();
		transformComponent.setTranslation(0, 0, -200);
		transformComponent.setScale(SCALE, SCALE, 1);

		this._emitter = new ParticleEmitter(EMITTER_SETTINGS);

		var particleComponent = new ParticleComponent({
			particleCount : MAX_PARTICLES
		});
		particleComponent.emitters.push(this._emitter);

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


	Thruster.prototype.start = function () {
		this._emitter.releaseRatePerSecond = PARTICLES_PER_SECOND;
	};


	Thruster.prototype.stop = function () {
		this._emitter.releaseRatePerSecond = 0;
	};


	return Thruster;
});