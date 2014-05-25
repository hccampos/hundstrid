define([
	'goo/math/Vector2'
], function (
	Vector2
) {
	'use strict';

	var ACCELERATION = 500;
	var ROTATION_SPEED = 8;
	var SPEED_REDUCTION_FACTOR = 0.98;
	var ROTATION_REDUCTION_FACTOR = 0.95;

	function SpaceshipScript(player) {
		this._player = player;

		this._velocity = new Vector2();
		this._posDif = new Vector2();
		this._rotationSpeed = 0;

		this._isAccelerating = false;
		this._isRotatingLeft = false;
		this._isRotatingRight = false;
	}


	SpaceshipScript.prototype.run = function (entity, tpf, env) {
		//------------
		// Translation
		//------------
		if (this._isAccelerating) {
			var angle = entity.getRotation()[1];

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
	};


	SpaceshipScript.prototype.stopAccelerating = function () {
		this._isAccelerating = false;
	};


	return SpaceshipScript;
});