define([
	'goo/math/Vector2'
], function (
	Vector2
) {
	'use strict';

	var ACCELERATION = 500;
	var ROTATION_SPEED = 2.5;
	var FRICTION = 0.998;

	function SpaceshipScript(properties) {
		properties = properties || {};
		this._velocity = new Vector2();
		this._velocityDif = new Vector2();
		this._posDif = new Vector2();

		this._isAccelerating = false;
		this._isRotatingLeft = false;
		this._isRotatingRight = false;
	}


	SpaceshipScript.prototype.run = function (entity, tpf, env) {
		// Accelerate.
		if (this._isAccelerating) {
			var angle = entity.getRotation()[1];

			var xAcc = ACCELERATION * tpf * Math.sin(angle);
			var yAcc = ACCELERATION * tpf * Math.cos(angle);
			this._velocity.add([xAcc, yAcc]);
		}

		// Rotate left.
		if (this._isRotatingLeft) {
			entity.addRotation(0, ROTATION_SPEED * tpf, 0);
		}

		// Rotate right.
		if (this._isRotatingRight) {
			entity.addRotation(0, -ROTATION_SPEED * tpf, 0);
		}

		// Friction (kind of).
		this._velocity.mul(FRICTION);

		// Move.
		Vector2.mul(this._velocity, tpf, this._posDif);
		entity.addTranslation(this._posDif[0], 0, this._posDif[1]);
	};


	SpaceshipScript.prototype.startRotatingLeft = function () { this._isRotatingLeft = true; };
	SpaceshipScript.prototype.stopRotatingLeft = function () { this._isRotatingLeft = false; };

	SpaceshipScript.prototype.startRotatingRight = function () { this._isRotatingRight = true; };
	SpaceshipScript.prototype.stopRotatingRight = function () { this._isRotatingRight = false; };

	SpaceshipScript.prototype.startAccelerating = function () { this._isAccelerating = true; };
	SpaceshipScript.prototype.stopAccelerating = function () { this._isAccelerating = false; };


	return SpaceshipScript;
});