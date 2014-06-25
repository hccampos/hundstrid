define([
	'goo/entities/Entity',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/ParticleComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/particles/ParticleEmitter',
	'goo/util/ParticleSystemUtils'
], function (
	Entity,
	Material,
	TextureCreator,
	ShaderLib,
	TransformComponent,
	ParticleComponent,
	MeshDataComponent,
	MeshRendererComponent,
	ParticleEmitter,
	ParticleSystemUtils
) {
	/**
	 * Creates a new particle entity that can serve as the base for other
	 * entities.
	 */
	function ParticleEntity(world, name, id, emitterSettings) {
		Entity.apply(this, arguments); // Super constructor.

		var transformComponent = new TransformComponent();

		this._emitter = new ParticleEmitter(emitterSettings);

		var particleComponent = new ParticleComponent({
			particleCount : emitterSettings.maxParticles
		});
		particleComponent.emitters.push(this._emitter);

		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.cullMode = 'Never';

		this.setComponent(transformComponent);
		this.setComponent(particleComponent);
		this.setComponent(meshDataComponent);
		this.setComponent(meshRendererComponent);
	}
	ParticleEntity.prototype = Object.create(Entity.prototype);
	ParticleEntity.prototype.constructor = ParticleEntity;


	ParticleEntity.createMaterial = function (name, file, renderQueue) {
		var textureCreator = new TextureCreator()
		var texture = textureCreator.loadTexture2D(file);
		//var texture = ParticleSystemUtils.createFlareTexture()
		texture.generateMipmaps = true;

		var material = Material.createMaterial(ShaderLib.particles, name);
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = renderQueue || 2004;

		return material;
	};


	return ParticleEntity;
});