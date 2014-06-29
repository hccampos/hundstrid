define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'js/Fireball',
	'js/Sparks'
], function (
	Entity,
	TransformComponent,
	Fireball,
	Sparks
) {
	/**
	 * Creates a new explosion that combines a fireball with sparks.
	 */
	function Explosion(world, name, id) {
		Entity.apply(this, arguments);

		var transformComponent = new TransformComponent();
		this.setComponent(transformComponent);

		this._sparks = new Sparks(world).addToWorld();
		this.attachChild(this._sparks);

		this._fireball = new Fireball(world).addToWorld();
		this.attachChild(this._fireball);

		this._canExplode = true;
	}
	Explosion.prototype = Object.create(Entity.prototype);
	Explosion.prototype.constructor = Explosion;


	Explosion.prototype.explode = function (velocity) {
		if (!this._canExplode) {
			return;
		}

		this._sparks.explode(velocity);
		this._fireball.explode(velocity);
		this._canExplode = false;

		var that = this;
		this._canExplodeTimeout = window.setTimeout(function () {
			window.clearTimeout(that._canExplodeTimeout);
			that._canExplode = true;
		}, this._getTimeoutDuration());
	};


	Explosion.prototype._getTimeoutDuration = function () {
		var sparksDuration = this._sparks.getDuration();
		var fireballDuration = this._fireball.getDuration();
		return Math.max(fireballDuration, sparksDuration) * 1000;
	}


	return Explosion;
});