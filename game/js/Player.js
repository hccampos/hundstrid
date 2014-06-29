define([
	'js/Ship',
	'js/BulletManager',
	'js/SpaceshipScript'
], function (
	Ship,
	BulletManager,
	SpaceshipScript
) {
	var KEY_LEFT = 37;
	var KEY_RIGHT = 39;
	var KEY_UP = 38;
	var KEY_DOWN = 40;
	var KEY_ENTER = 13;
	var KEY_SPACE = 32;

	var FULL_HEALTH = 100;
	var RESPAWN_TIME = 6000;


	/**
	 * Creates a new player.
	 */
	function Player(game, id, shipModel) {
		this.id = id;
		this.game = game;
		this.kills = 0;

		this._setupDefaultKeyBindings();

		var world = this.game.world;

		this.bulletManager = new BulletManager(world, 1000);

		this.ship = new Ship(world).addToWorld();
		this.ship.setModel(shipModel);
		this.ship.randomizeColor();

		var that = this;
		var script = new SpaceshipScript(this.ship, this.bulletManager, function () {
			return that.game.bounds;
		});

		this.ship.setScript(script);
	}


	/**
	 * Destroys the player. This is called when a player is disconnected.
	 */
	Player.prototype.destroy = function () {
		this.ship.removeFromWorld();
		this.ship = null;
	};


	/**
	 * Applies the specified command to this player.
	 *
	 * @param  {object} command
	 *		The command which is to be applied.
	 */
	Player.prototype.applyCommand = function (command) {
		var type = command.type;
		var key = command.data.key;

		for (var commandName in this.keyBindings) {
			var binding = this.keyBindings[commandName];

			if (binding.type === type && binding.key === key)
				this.ship.script[commandName](command.data);
		}
	};


	Player.prototype.setKeyBindings = function (bindings) {
		for (var action in bindings) {
			this.setKeyForAction(action, bindings[action]);
		}
	};


	Player.prototype.setKeyForAction = function (action, key) {
		for (var commandName in this.keyBindings) {
			var binding = this.keyBindings[commandName];
			if (binding.action === action)
				binding.key = key;
		}
	};


	Player.prototype.applyHits = function (bullets) {
		// If the player is dead, it can't get hit anymore.
		if (this.isDead()) { return; }

		for (var i = 0; i < bullets.length; ++i) {
			var bullet = bullets[i];

			bullet.kill();
			this.health -= bullet.damage;

			if (this.isDead()) {
				this.kill();
				return true;
			}
		}

		return false;
	};


	Player.prototype.spawn = function () {
		this.health = FULL_HEALTH;
		this.ship.spawn();
	};


	Player.prototype.kill = function () {
		this.health = 0;
		this.ship.kill();

		var that = this;
		window.setTimeout(function () {
			that.spawn();
		}, RESPAWN_TIME);
	};


	Player.prototype.scoreKill = function () {
		this.kills++;
	};


	Player.prototype.isDead = function () {
		return this.health <= 0;
	};


	Player.prototype.isCollision = function (bullet) {
		var pos = this.ship.getTranslation();
		var bulletPos = bullet.getTranslation();
		return pos.distance(bulletPos) <= 30;
	};


	Player.prototype._setupDefaultKeyBindings = function () {
		this.keyBindings = {
			startRotatingLeft: {
				type: 'keydown',
				key: KEY_LEFT,
				action: 'rotateLeft'
			},
			stopRotatingLeft: {
				type: 'keyup',
				key: KEY_LEFT,
				action: 'rotateLeft'
			},
			startRotatingRight: {
				type: 'keydown',
				key: KEY_RIGHT,
				action: 'rotateRight'
			},
			stopRotatingRight: {
				type: 'keyup',
				key: KEY_RIGHT,
				action: 'rotateRight'
			},
			startAccelerating: {
				type: 'keydown',
				key: KEY_UP,
				action: 'accelerate'
			},
			stopAccelerating: {
				type: 'keyup',
				key: KEY_UP,
				action: 'accelerate'
			},
			startShooting: {
				type: 'keydown',
				key: KEY_SPACE,
				action: 'shoot'
			},
			stopShooting: {
				type: 'keyup',
				key: KEY_SPACE,
				action: 'shoot'
			}
		};
	};


	return Player;
});