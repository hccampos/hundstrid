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
	var SCALE = 1;
	var PARTICLES_PER_SECOND = 2000;
	var CUTTOFF_DURATION_SECS = 0.1;
	var MAX_LIFETIME_SECS = 1;
	var SPEED_SCALE = 800;

	var EMITTER_SETTINGS = {
		maxParticles: 1000,
		minLifetime: 0.3,
		maxLifetime: MAX_LIFETIME_SECS,
		releaseRatePerSecond: 0,
		timeline: [{
			timeOffset: 0.0,
			spin: 0,
			mass: 1,
			size: 1 * SCALE,
			color: [0, 0, 0, 0]
		},
		{
			timeOffset: 0.1,
			size: 1 * SCALE,
			color: [1, 1, 1, 1]
		},
		{
			timeOffset: 0.8,
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
	 * Creates a new sparks particle entity that can be used as part of an
	 * explosion.
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

		if (this._cuttoffTimeout) {
			window.clearTimeout(this._cuttoffTimeout);
		}

		var that = this;
		this._cuttoffTimeout = window.setTimeout(function () {
			that._emitter.releaseRatePerSecond = 0;
		}, CUTTOFF_DURATION_SECS * 1000);
	};


	Sparks.prototype.getDuration = function () {
		return MAX_LIFETIME_SECS + CUTTOFF_DURATION_SECS;
	};


	return Sparks;
});