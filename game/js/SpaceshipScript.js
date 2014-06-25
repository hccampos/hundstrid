define([
	'goo/math/Vector2',
	'goo/math/Vector3',
	'js/BulletManager'
], function (
	Vector2,
	Vector3,
	BulletManager
) {
	'use strict';

	var MAX_BULLETS = 1000;
	var ACCELERATION = 800;
	var ROTATION_SPEED = 22;
	var SPEED_REDUCTION_FACTOR = 0.98;
	var ROTATION_REDUCTION_FACTOR = 0.85;
	var BULLET_POS_OFFSET = 25;

	function SpaceshipScript(player) {
		this._player = player;
		this._bulletManager = new BulletManager(player.game.world, MAX_BULLETS);
		this._entity = null;

		this._velocity = new Vector2();
		this._posDif = new Vector2();
		this._rotationSpeed = 0;

		this._isAccelerating = false;
		this._isRotatingLeft = false;
		this._isRotatingRight = false;

		this._bulletSpawnPos = new Vector3();
	}


	SpaceshipScript.prototype.run = function (entity, tpf, env) {
		if (!this._entity) {
			this._entity = entity;
			return;
		}

		var angle = entity.getRotation()[1];

		//------------
		// Translation
		//------------
		if (this._isAccelerating) {
			var xAcc = ACCELERATION * tpf * Math.sin(angle);
			var yAcc = ACCELERATION * tpf * Math.cos(angle);
			this._velocity.add([xAcc, yAcc]);
		}

		this._velocity.mul(SPEED_REDUCTION_FACTOR);
		Vector2.mul(this._velocity, tpf, this._posDif);
		entity.addTranslation(this._posDif[0], 0, this._posDif[1]);

		var t = entity.getTranslation();
		var bounds = this._player.game.bounds;
		if (t[0] > bounds.maxX) {
			entity.setTranslation(bounds.minX + 1, t[1], t[2]);
		}

		if (t[0] < bounds.minX) {
			entity.setTranslation(bounds.maxX - 1, t[1], t[2]);
		}

		if (t[2] > bounds.maxY) {
			entity.setTranslation(t[0], t[1], bounds.minY + 1);
		}

		if (t[2] < bounds.minY) {
			entity.setTranslation(t[0], t[1], bounds.maxY - 1);
		}

		//---------
		// Rotation
		//---------
		if (this._isRotatingLeft) {
			this._rotationSpeed += ROTATION_SPEED * tpf;
		}

		if (this._isRotatingRight) {
			this._rotationSpeed -= ROTATION_SPEED * tpf;
		}

		this._rotationSpeed *= ROTATION_REDUCTION_FACTOR;
		entity.addRotation(0, this._rotationSpeed * tpf, 0);

		//--------
		// Bullets
		//--------
		this._bulletManager.update(tpf, bounds);
	};

	SpaceshipScript.prototype.shoot = function () {
		if (!this._entity)
			return;

		var dir = this._entity.getRotation()[1];
		var sin = Math.sin(dir);
		var cos = Math.cos(dir);

		var pos = this._entity.getTranslation();
		this._bulletSpawnPos[0] = pos[0] + sin * BULLET_POS_OFFSET;
		this._bulletSpawnPos[1] = pos[1];
		this._bulletSpawnPos[2] = pos[2] + cos * BULLET_POS_OFFSET;

		var x = this._velocity[0] * sin;
		var y = this._velocity[1] * cos;
		var speed = Math.sqrt(x * x + y * y);

		this._bulletManager.spawn(this._bulletSpawnPos, dir, speed);
	};


	SpaceshipScript.prototype.startRotatingLeft = function () {
		this._isRotatingLeft = true;
	};


	SpaceshipScript.prototype.stopRotatingLeft = function () {
		this._isRotatingLeft = false;
	};


	SpaceshipScript.prototype.startRotatingRight = function () {
		this._isRotatingRight = true;
	};


	SpaceshipScript.prototype.stopRotatingRight = function () {
		this._isRotatingRight = false;
	};


	SpaceshipScript.prototype.startAccelerating = function () {
		this._isAccelerating = true;
		this._player.thruster.start();
	};


	SpaceshipScript.prototype.stopAccelerating = function () {
		this._isAccelerating = false;
		this._player.thruster.stop();
	};


	SpaceshipScript.prototype.startShooting = function () {
		if (this._isShooting)
			return;

		this.shoot();
		this._isShooting = true;
	};


	SpaceshipScript.prototype.stopShooting = function () {
		this._isShooting = false;
	};


	SpaceshipScript.prototype.explode = function () {
		this._player.explosion.explode(this._velocity);
		this._player.sparks.explode(this._velocity);
	};

	return SpaceshipScript;
});