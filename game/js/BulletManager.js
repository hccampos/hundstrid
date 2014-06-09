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
	BulletManager.prototype.update = function (tpf, bounds) {
		for (var i = 0; i < this.numBullets; ++i) {
			var bullet = this._bullets[i];
			if (bullet.isAlive) {
				bullet.update(tpf, bounds);
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

	return BulletManager;
});