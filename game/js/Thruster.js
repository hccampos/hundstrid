define([
	'goo/entities/Entity',
	'goo/particles/ParticleUtils',
	'js/ParticleEntity'
], function (
	Entity,
	ParticleUtils,
	ParticleEntity
) {
	var SCALE = 1;
	var PARTICLES_PER_SECOND = 300;

	var EMITTER_SETTINGS = {
		maxParticles: 5000,
		minLifetime: 0.3,
		maxLifetime: 0.3,
		releaseRatePerSecond: 0,
		getEmissionPoint: function (particle, particleEntity) {
			var vec3 = particle.position;
			vec3.setd(0, 0, Math.random() * SCALE);
			return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
		},
		getEmissionVelocity: function (particle, particleEntity) {
			var vec3 = particle.velocity;

			// Spread the particles a bit to make the effect look more natural.
			vec3.data[0] = (Math.random() - 0.5) * SCALE * 100;
			vec3.data[1] = 0;
			vec3.data[2] = Math.random() * SCALE * -120;

			return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
		},
		timeline: [{
			timeOffset: 0.0,
			spin: 0,
			mass: 1,
			size: 8,
			color: [1, 1, 1, 1]
		}, {
			timeOffset: 1.0,
			spin: 10,
			size: 4.0,
			color: [0, 0, 1, 0]
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


	Thruster.prototype.start = function () {
		this._emitter.releaseRatePerSecond = PARTICLES_PER_SECOND;
	};


	Thruster.prototype.stop = function () {
		this._emitter.releaseRatePerSecond = 0;
	};


	return Thruster;
});