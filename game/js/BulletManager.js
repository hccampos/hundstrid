define([
	'js/Bullet'
], function (
	Bullet
) {

	function BulletManager(numBullets) {
		this.numBullets = numBullets;
		this._bullets = [];

		for (var i = 0; i < numBullets; ++i) {
			this._bullets = new Bullet(world);
		}
	}

	BulletManager.prototype.update = function (tpf, bounds) {
		for (var i = 0; i < numBullets; ++i) {
			var bullet = this._bullets[i];
			if (bullet.isAlive) {
				bullet.update(tpf, bounds);
			}
	};

	BulletManager.prototype.spawn = function (position, direction) {
		for (var i = 0; i < numBullets; ++i) {
			var bullet = this._bullets[i];
			if (!bullet.isAlive) {
				bullet.spawn(position, direction);
				return;
			}
		}
	};

	return BulletManager;
});