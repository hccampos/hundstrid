define([
	'js/Bullet'
], function (
	Bullet
) {
	/**
	 * Creates a new bullet manager.
	 *
	 * @param {World} world
	 *		The world to which the bullets are to be added.
	 * @param {number} numBullets
	 * 		Maximum number of bullets managed by this manager.
	 */
	function BulletManager(world, numBullets) {
		this.numBullets = numBullets;
		this._bullets = [];

		for (var i = 0; i < numBullets; ++i) {
			this._bullets[i] = new Bullet(world);
		}
	}

	/**
	 * Updates all the bullets.
	 *
	 * @param {number} tpf
	 * 		Time elapsed since the last frame.
	 * @param {object} bounds
	 * 		The screen bounds that are used to check if bullets went off the
	 * 		screen.
	 */
	BulletManager.prototype.update = function (tpf, bounds, planet) {
		for (var i = 0; i < this.numBullets; ++i) {
			var bullet = this._bullets[i];
			if (bullet.isAlive) {
				bullet.update(tpf, bounds, planet);
			}
		}
	};

	/**
	 * Finds an available (not alive) bullet and spawns it.
	 *
	 * @param {Vector2} position
	 * 		The initial position of the bullet.
	 * @param {number} direction
	 * 		The initial direction of the bullet.
	 * @param {number} [varname] [description]
	 *		The speed of the spaceship which will be added to the speed of the
	 *		bullet.
	 *
	 * @return {Bullet}
	 *		The bullet which was spawned.
	 */
	BulletManager.prototype.spawn = function (position, direction, speed) {
		for (var i = 0; i < this.numBullets; ++i) {
			var bullet = this._bullets[i];
			if (!bullet.isAlive) {
				bullet.spawn(position, direction, speed);
				return bullet;
			}
		}

		return null;
	};


	/**
	 * Gets all the live bullets that match the specified collision predicate.
	 *
	 * @param  {[type]} collisionPredicate
	 *		The predicate used to determine if a bullet is colliding. It
	 *		receives the bullet object and should return true or false depending
	 *		on whether the bullet is colliding or not.
	 *
	 * @return {Array}
	 *		An array of all the live bullets that match the specified predicate.
	 */
	BulletManager.prototype.getCollidingBullets = function (collisionPredicate) {
		var collidingBullets = [];
		for (var i = 0; i < this.numBullets; ++i) {
			var bullet = this._bullets[i];
			if (bullet.isAlive && collisionPredicate(bullet)) {
				collidingBullets.push(bullet);
			}
		}
		return collidingBullets;
	};

	return BulletManager;
});