define([
	'goo/math/Vector2',
	'goo/math/Vector3'
], function (
	Vector2,
	Vector3
) {
	'use strict';

	var ACCELERATION_FACTOR = 800;
	var ROTATION_SPEED_FACTOR = 22;
	var SPEED_REDUCTION_FACTOR = 0.98;
	var ROTATION_REDUCTION_FACTOR = 0.85;
	var BULLET_POS_OFFSET = 25;


	function SpaceshipScript(ship, bulletManager, getBounds) {
		this._ship = ship;
		this._bulletManager = bulletManager;
		this._getBounds = getBounds;
		this._entity = null;

		this._velocity = new Vector2();
		this._posDif = new Vector2();
		this._rotationSpeed = 0;

		this._isAccelerating = false;
		this._isRotatingLeft = false;
		this._isRotatingRight = false;

		this._bulletSpawnPos = new Vector3();

		this._analogPosition = new Vector2();
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
		var acceleration = this._analogPosition[1];
		if (this._isAccelerating) { acceleration += 1; }
		acceleration = Math.min(1, acceleration);

		var xAcc = acceleration * ACCELERATION_FACTOR * tpf * Math.sin(angle);
		var yAcc = acceleration * ACCELERATION_FACTOR * tpf * Math.cos(angle);
		this._velocity.add([xAcc, yAcc]);

		this._velocity.mul(SPEED_REDUCTION_FACTOR);
		Vector2.mul(this._velocity, tpf, this._posDif);
		entity.addTranslation(this._posDif[0], 0, this._posDif[1]);

		var t = entity.getTranslation();
		var bounds = this._getBounds();
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
		var rotSpeedIncrement = -this._analogPosition[0];
		if (this._isRotatingLeft) {
			rotSpeedIncrement += 1;
		}

		if (this._isRotatingRight) {
			rotSpeedIncrement -= 1;
		}
		rotSpeedIncrement = Math.min(Math.max(rotSpeedIncrement, -1), 1);

		this._rotationSpeed += rotSpeedIncrement * ROTATION_SPEED_FACTOR * tpf;
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
		this._ship.thruster.start(1);
	};


	SpaceshipScript.prototype.stopAccelerating = function () {
		this._isAccelerating = false;
		this._ship.thruster.stop();
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
		this._ship.explosion.explode(this._velocity);
	};


	SpaceshipScript.prototype.setAnalogPosition = function (pos) {
		this._analogPosition[0] = Math.min(Math.max(pos.x || 0, -1), 1);
		this._analogPosition[1] = Math.min(Math.max(pos.y || 0, 0), 1);
		this._ship.thruster.start(this._analogPosition[1]);
	};


	return SpaceshipScript;
});