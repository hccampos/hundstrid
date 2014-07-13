define([
	'js/vendor/signals',
	'js/Ship',
	'js/BulletManager',
	'js/SpaceshipScript'
], function (
	Signal,
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
	 *
	 * @param {Game} game
	 *		The game to which the player belongs.
	 * @param {object} data
	 *		The data of the player (e.g. id, name, etc).
	 * @param {object} shipModel
	 *		The entity which is to be used as a model for the player's ship.
	 */
	function Player(game, data, shipModel) {
		this.id = data.id;
		this.name = data.name;
		this.color = getRandomColor();
		this.game = game;
		this.score = 0;
		this.kills = 0;
		this.health = 0;

		this.nameChanged = new Signal();
		this.killed = new Signal();
		this.killsChanged = new Signal();
		this.scoreChanged = new Signal();
		this.healthChanged = new Signal();

		this._init(shipModel);
	}


	/**
	 * Initializes the player.
	 */
	Player.prototype._init = function (shipModel) {
		this._setupDefaultKeyBindings();

		var world = this.game.world;

		this.bulletManager = new BulletManager(world, 1000);

		this.ship = new Ship(world).addToWorld();
		this.ship.setModel(shipModel);
		this.ship.setColor(this.color);

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

		this.nameChanged.removeAll();
		this.killed.removeAll();
		this.killsChanged.removeAll();
		this.scoreChanged.removeAll();
		this.healthChanged.removeAll();
	};


	Player.prototype.applyHits = function (bullets) {
		// If the player is dead, it can't get hit anymore.
		if (this.isDead()) { return; }

		for (var i = 0; i < bullets.length; ++i) {
			var bullet = bullets[i];

			bullet.kill();
			this.decrementHealth(bullet.damage);

			if (this.isDead()) {
				this.kill();
				return true;
			}
		}

		return false;
	};


	Player.prototype.spawn = function () {
		this.setHealth(FULL_HEALTH);
		this.ship.spawn();
	};


	Player.prototype.kill = function () {
		this.setHealth(0);
		this.ship.kill();

		this.killed.dispatch();

		var that = this;
		window.setTimeout(function () {
			that.spawn();
		}, RESPAWN_TIME);
	};


	Player.prototype.scoreKill = function () {
		this.incrementKills();
		this.incrementScore();
	};


	Player.prototype.isDead = function () {
		return this.health <= 0;
	};


	Player.prototype.isCollision = function (bullet) {
		var pos = this.ship.getTranslation();
		var bulletPos = bullet.getTranslation();
		return pos.distance(bulletPos) <= 30;
	};


	function createValueModifier(property, multiplier, defaultAmount) {
		var setterName = 'set' + property.charAt(0).toUpperCase() + property.slice(1);

		if (defaultAmount === undefined) { defaultAmount = 1; }
		return function (amount) {
			if (amount === undefined) { amount = defaultAmount; }
			this[setterName](this[property] + amount * multiplier);
		}
	}


	function createSetter(property) {
		var signalName = property + 'Changed';

		return function (value) {
			var oldValue = this[property];
			if (value !== oldValue) {
				this[property] = value;
				this[signalName].dispatch(value, oldValue);
			}
		}
	}


	Player.prototype.incrementKills = createValueModifier('kills', 1);
	Player.prototype.decrementKills = createValueModifier('kills', -1);
	Player.prototype.setKills = createSetter('kills');


	Player.prototype.incrementScore = createValueModifier('score', 1);
	Player.prototype.decrementScore = createValueModifier('score', -1);
	Player.prototype.setScore = createSetter('score');


	Player.prototype.incrementHealth = createValueModifier('health', 1);
	Player.prototype.decrementHealth = createValueModifier('health', -1);
	Player.prototype.setHealth = createSetter('health');


	/**
	 * Applies the specified command to this player.
	 *
	 * @param  {object} command
	 *		The command which is to be applied.
	 */
	Player.prototype.applyCommand = function (command) {
		if (this.isDead()) { return; }

		var type = command.type;

		if (this._isKeyCommand(command)) {
			var key = command.data.key;

			for (var commandName in this.keyBindings) {
				var binding = this.keyBindings[commandName];

				if (binding.type === type && binding.key === key) {
					this.ship.script[commandName](command.data);
				}
			}
		} else {
			this.ship.script.setAnalogPosition(command.data);
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


	Player.prototype._isKeyCommand = function (command) {
		var isKeyType = command.type === 'keyup' || command.type === 'keydown';
		return isKeyType && command.data && command.data.key;
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


	function getRandomColor() {
		var r = Math.random() + 0.2;
		var b = Math.random() + 0.2;
		var g = Math.random() + 0.2;
		return [r, g, b, 1]
	}


	return Player;
});