define([
	'goo/entities/Entity',
	'goo/particles/ParticleUtils',
	'js/ParticleEntity'
], function (
	Entity,
	ParticleUtils,
	ParticleEntity
) {
	var SCALE = 0.5;
	var PARTICLES_PER_SECOND = 300;

	var EMITTER_SETTINGS = {
		maxParticles: 400,
		minLifetime: 0.5,
		maxLifetime: 1,
		releaseRatePerSecond: 0,
		getEmissionPoint: function (particle, particleEntity) {
			var vec3 = particle.position;
			vec3.setd(0, -5, -Math.random() * SCALE);
			return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
		},
		getEmissionVelocity: function (particle, particleEntity) {
			var vec3 = particle.velocity;

			// Spread the particles a bit to make the effect look more natural.
			vec3.data[0] = (Math.random() - 0.5) * SCALE * 100;
			vec3.data[1] = 0;
			vec3.data[2] = Math.random() * SCALE * -100;

			return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
		},
		timeline: [{
			timeOffset: 0.0,
			mass: 1,
			size: 10 * SCALE,
			color: [1, 1, 1, 0.1]
		}, {
			timeOffset: 1,
			size: 60 * SCALE,
			color: [0, 0, 0, 0]
		}]
	};


	/**
	 * Creates a new thruster.
	 */
	function Thruster(world, name, id) {
		ParticleEntity.call(this, world, name, id, EMITTER_SETTINGS); // Super

		this.setTranslation(0, 0, -25);
		this.setScale(SCALE, SCALE, 1);

		var material = ParticleEntity.createMaterial('ThrusterMaterial', 'assets/smoke.png', 2002);
		this.meshRendererComponent.materials.push(material);
	}
	Thruster.prototype = Object.create(ParticleEntity.prototype);
	Thruster.prototype.constructor = Thruster;


	Thruster.prototype.start = function (strength) {
		this._emitter.releaseRatePerSecond = PARTICLES_PER_SECOND * (strength || 0);
	};


	Thruster.prototype.stop = function () {
		this._emitter.releaseRatePerSecond = 0;
	};


	return Thruster;
});