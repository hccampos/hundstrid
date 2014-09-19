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
	var SCALE = 0.5;
	var PARTICLES_PER_SECOND = 3000;
	var CUTTOFF_DURATION_SECS = 0.1;
	var MAX_LIFETIME_SECS = 1.2;
	var SPEED_SCALE = 300;

	var EMITTER_SETTINGS = {
		maxParticles: 5000,
		minLifetime: 0.6,
		maxLifetime: MAX_LIFETIME_SECS,
		releaseRatePerSecond: 0,
		timeline: [{
			timeOffset: 0.0,
			spin: 0,
			mass: 1,
			size: 5 * SCALE,
			color: [0, 0, 0, 0]
		},
		{
			timeOffset: 0.05,
			size: 30 * SCALE,
			color: [0.6, 0.6, 0.3, 0.3]
		},
		{
			timeOffset: 0.6,
			size: 60 * SCALE,
			color: [0, 0, 0, 0.0]
		}],
		influences: [
			new ParticleInfluence({
				apply: function (tpf, particle, index) {
					particle.velocity[0] *= 0.93;
					particle.velocity[1] *= 0.93;
					particle.velocity[2] *= 0.93;
				}
			})
		]
	};


	/**
	 * Creates a new fireball that can be used as part of an explosion.
	 */
	function Fireball(world, name, id) {
		var that = this;

		EMITTER_SETTINGS.getEmissionVelocity = function (particle, particleEntity) {
			var vec3 = particle.velocity;
			vec3.data[0] = that._velocity[0] + (Math.random() - 0.5) * SPEED_SCALE;
			vec3.data[1] = (Math.random() - 0.5) * SPEED_SCALE;
			vec3.data[2] = that._velocity[1] + (Math.random() - 0.5) * SPEED_SCALE;
		};

		ParticleEntity.call(this, world, name, id, EMITTER_SETTINGS); // Super

		this.setScale(SCALE, SCALE, SCALE);

		var material = ParticleEntity.createMaterial('FireballMaterial', 'assets/explosion.png', 2004);
		var blendState = material.blendState;
		this.meshRendererComponent.materials.push(material);
	}
	Fireball.prototype = Object.create(ParticleEntity.prototype);
	Fireball.prototype.constructor = Fireball;


	Fireball.prototype.explode = function (velocity) {
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


	Fireball.prototype.getDuration = function () {
		return MAX_LIFETIME_SECS + CUTTOFF_DURATION_SECS;
	};


	return Fireball;
});