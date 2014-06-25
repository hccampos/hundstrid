define([
	'goo/entities/Entity',
	'goo/particles/ParticleInfluence',
	'goo/particles/ParticleUtils',
	'js/ParticleEntity'
], function (
	Entity,
	ParticleInfluence,
	ParticleUtils,
	ParticleEntity
) {
	var SCALE = 100;
	var PARTICLES_PER_SECOND = 2000;
	var CUTTOFF_DURATION = 100;
	var SPEED_SCALE = 800;

	var EMITTER_SETTINGS = {
		maxParticles: 1000,
		minLifetime: 0.3,
		maxLifetime: 1,
		releaseRatePerSecond: 0,
		timeline: [{
			timeOffset: 0.0,
			spin: 0,
			mass: 1,
			size: 1,
			color: [0, 0, 0, 0]
		},
		{
			timeOffset: 0.1,
			size: 2,
			color: [1, 1, 1, 1.0]
		},
		{
			timeOffset: 1.0,
			color: [1, 1, 1, 0.0]
		}],
		influences: [
			new ParticleInfluence({
				apply: function (tpf, particle, index) {
					particle.velocity[0] *= 0.95;
					particle.velocity[1] *= 0.95;
					particle.velocity[2] *= 0.95;
				}
			})
		]
	};


	/**
	 * Creates a new explosion.
	 */
	function Sparks(world, name, id) {
		var that = this;

		EMITTER_SETTINGS.getEmissionVelocity = function (particle, particleEntity) {
			var vec3 = particle.velocity;
			vec3.data[0] = that._velocity[0] + (Math.random() - 0.5) * SPEED_SCALE;
			vec3.data[1] = (Math.random() - 0.5) * SPEED_SCALE;
			vec3.data[2] = that._velocity[1] + (Math.random() - 0.5) * SPEED_SCALE;
		};

		ParticleEntity.call(this, world, name, id, EMITTER_SETTINGS); // Super

		this.setScale(SCALE, SCALE, SCALE);

		var material = ParticleEntity.createMaterial('ExplosionMaterial', 'assets/spark.png', 2000);
		this.meshRendererComponent.materials.push(material);
	}
	Sparks.prototype = Object.create(ParticleEntity.prototype);
	Sparks.prototype.constructor = Sparks;


	Sparks.prototype.explode = function (velocity) {
		this._velocity = velocity;
		this._emitter.releaseRatePerSecond = PARTICLES_PER_SECOND;

		var that = this;
		window.setTimeout(function () {
			that._emitter.releaseRatePerSecond = 0;
		}, CUTTOFF_DURATION);
	};


	return Sparks;
});