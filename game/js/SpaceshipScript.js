define([
	'goo/math/Vector3',
	'js/input/Gamepad'
], function (
	Vector3,
	Gamepad
) {
	'use strict';

	var ACCELERATION_FACTOR = 700;
	var ROTATION_SPEED_FACTOR = 35;
	var SPEED_REDUCTION_FACTOR = 0.98;
	var ROTATION_REDUCTION_FACTOR = 0.85;
	var BULLET_POS_OFFSET = 10;
	var SECS_PER_SHOT = 0.02;
	var GRAVITY = 30000;

	function SpaceshipScript(gamepad, ship, bulletManager, planet, getBounds) {
		this._gamepad = gamepad;
		this._ship = ship;
		this._bulletManager = bulletManager;
		this._planet = planet;
		this._getBounds = getBounds;
		this._entity = null;
		this._dead = false;

		this._velocity = new Vector3();
		this._acceleration = new Vector3();
		this._posDif = new Vector3();
		this._gravity = new Vector3();
		this._bulletSpawnPos = new Vector3();
		this._analogPosition = new Vector3();

		this.reset();
	}


	SpaceshipScript.prototype.reset = function () {
		this._rotationSpeed = 0;
		this._timeSinceLastShot = 0;
		this._isShooting = false;
		this._isAccelerating = false;
		this._isRotatingLeft = false;
		this._isRotatingRight = false;
		this._velocity.setd(0, 0, 0);
		this._acceleration.setd(0, 0, 0);
		this._posDif.setd(0, 0, 0);
		this._gravity.setd(0, 0, 0);
		this._bulletSpawnPos.setd(0, 0, 0);
		this._analogPosition.setd(0, 0, 0);
	};


	SpaceshipScript.prototype.run = function (entity, tpf, env) {
		if (!this._entity) {
			this._entity = entity;
			return;
		}

		if (this._gamepad) {
			this.updateGamepad();
		}

		var angle = entity.getRotation()[1];

		//------------
		// Translation
		//------------
		var acceleration = this._analogPosition[1];
		if (this._isAccelerating) { acceleration += 1; }
		acceleration = Math.min(1, Math.max(0, acceleration));

		var factor = acceleration * ACCELERATION_FACTOR * tpf;
		this._acceleration.set(factor * Math.sin(angle), factor * Math.cos(angle), 0);

		// Apply gravity due to the planet.
		var t = entity.getTranslation();
		var plannetPos = this._planet.getTranslation();
		var dist = plannetPos.distance(t);
		var g = 1;
		if (dist > 0)
			g = Math.min(100, GRAVITY / (dist * dist));

		var gravity = this._gravity;
		gravity.setv(plannetPos);
		gravity.subv(t); // Vector from the ship to the planet.
		gravity.normalize(); // Turns into a direction vector.
		gravity.muld(g, g, g); // Becomes the gravity vector.

		var tmp = gravity[1];
		gravity[1] = gravity[2];
		gravity[2] = tmp;

		var v = this._velocity;
		v.addv(this._acceleration); // Apply thrust.
		v.addv(gravity); // Apply gravity.
		v.muld(
			SPEED_REDUCTION_FACTOR,
			SPEED_REDUCTION_FACTOR,
			SPEED_REDUCTION_FACTOR
		);

		var dif = this._posDif;
		dif.setd(v[0] * tpf, v[1] * tpf, v[2] * tpf);
		entity.addTranslation(dif[0], 0, dif[1]);

		t = entity.getTranslation();
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
		this._timeSinceLastShot += tpf;
	};


	SpaceshipScript.prototype.updateGamepad = function () {
		if (this._dead) { return; }

		var gamepad = this._gamepad;
		gamepad.update();

		if (gamepad.isButtonPressed(Gamepad.BUTTONS.X) ||
			gamepad.isRightTriggerActive()) {
			this.startShooting();
		} else {
			this.stopShooting();
		}

		var x = gamepad.getAxisValue(Gamepad.AXES.LEFT_H);
		var y = gamepad.getButtonValue(Gamepad.BUTTONS.LEFT_TRIGGER);
		console.log(y);

		this._analogPosition[0] = Math.min(Math.max(x || 0, -1), 1);
		this._analogPosition[1] = Math.min(Math.max(y || 0, 0), 1);
		this._ship.thruster.start(this._analogPosition[1]);
	};


	/**
	 * Shoots a new bullet if the player can shoot one (i.e. enough time has
	 * passed since the last shot).
	 */
	SpaceshipScript.prototype.shoot = function () {
		if (!this._entity || this._dead || this._timeSinceLastShot < SECS_PER_SHOT)
			return;

		var dir = this._entity.getRotation()[1];
		var sin = Math.sin(dir);
		var cos = Math.cos(dir);

		var pos = this._entity.getTranslation();
		this._bulletSpawnPos[0] = pos[0]; + sin * BULLET_POS_OFFSET;
		this._bulletSpawnPos[1] = pos[1];
		this._bulletSpawnPos[2] = pos[2]; + cos * BULLET_POS_OFFSET;

		var x = this._velocity[0] * sin;
		var y = this._velocity[1] * cos;
		var speed = Math.sqrt(x * x + y * y);

		this._bulletManager.spawn(this._bulletSpawnPos, dir, speed);

		this._timeSinceLastShot = 0;
	};


	SpaceshipScript.prototype.startRotatingLeft = function () {
		if (this._dead) { return; }
		this._isRotatingLeft = true;
	};


	SpaceshipScript.prototype.stopRotatingLeft = function () {
		this._isRotatingLeft = false;
	};


	SpaceshipScript.prototype.startRotatingRight = function () {
		if (this._dead) { return; }
		this._isRotatingRight = true;
	};


	SpaceshipScript.prototype.stopRotatingRight = function () {
		this._isRotatingRight = false;
	};


	SpaceshipScript.prototype.startAccelerating = function () {
		if (this._dead) { return; }
		this._isAccelerating = true;
		this._ship.thruster.start(1);
	};


	SpaceshipScript.prototype.stopAccelerating = function () {
		this._isAccelerating = false;
		this._ship.thruster.stop();
	};


	SpaceshipScript.prototype.startShooting = function () {
		if (this._dead || this._isShooting) { return; }

		this.shoot();
		this._isShooting = true;
	};


	SpaceshipScript.prototype.stopShooting = function () {
		this._isShooting = false;
	};


	SpaceshipScript.prototype.explode = function () {
		this._ship.explosion.explode(this._velocity);
	};


	SpaceshipScript.prototype.spawn = function () {
		this._dead = false;
	};


	SpaceshipScript.prototype.kill = function () {
		this._dead = true;
		this.reset();
		this.explode();
	};


	SpaceshipScript.prototype.setAnalogPosition = function (pos) {
		if (this._dead) { return; }
		this._analogPosition[0] = Math.min(Math.max(pos.x || 0, -1), 1);
		this._analogPosition[1] = Math.min(Math.max(pos.y || 0, 0), 1);
		this._ship.thruster.start(this._analogPosition[1]);
	};


	return SpaceshipScript;
});