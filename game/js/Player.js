define([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/ScriptComponent',
	'js/SpaceshipScript',
	'js/Thruster'
], function (
	Material,
	ShaderLib,
	ScriptComponent,
	SpaceshipScript,
	Thruster
) {
	var KEY_LEFT = 37;
	var KEY_RIGHT = 39;
	var KEY_UP = 38;
	//var KEY_DOWN = 40;
	//var KEY_ENTER = 13;
	var KEY_SPACE = 32;

	var SHIP_SCALE = 0.08;


	function Player(game, id, entity) {
		this.id = id;
		this.entity = entity;
		this.game = game;

		this._setupDefaultKeyBindings();

		this.randomizeTransform();
		this.randomizeColor();

		this.script = new SpaceshipScript(this);
		this.entity.setComponent(new ScriptComponent(this.script));

		this.thruster = new Thruster(this.game.world).addToWorld();
		this.entity.attachChild(this.thruster);
	}


	Player.prototype.destroy = function () {
		this.entity.removeFromWorld();
	};


	Player.prototype.applyCommand = function (command) {
		var type = command.type;
		var key = command.data.key;

		for (var commandName in this.keyBindings) {
			var binding = this.keyBindings[commandName];

			if (binding.type === type && binding.key === key)
				this.script[commandName](command.data);
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


	/**
	 * Positions and rotates the ship randomly.
	 */
	Player.prototype.randomizeTransform = function () {
		var x = Math.random() * 500 - 250;
		var y = Math.random() * 500 - 250;
		this.entity.setTranslation(x, 0, y);
		this.entity.setScale(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);

		this.entity.setRotation(0, 2 * Math.random() * Math.PI, 0);
	};


	/**
	 * Sets the color of the ship randomly.
	 */
	Player.prototype.randomizeColor = function () {
		var shipBody = this._getShipBody();
		if (!shipBody)
			return;

		var material = new Material();
		material.shader = Material.createShader(ShaderLib.uber, 'Ship Material');

		var r = Math.random();
		var b = Math.random();
		var g = Math.random();

		material.uniforms.materialDiffuse = [r, g, b, 1];
		material.uniforms.materialAmbient = [0.1, 0.1, 0.1, 1];

		shipBody.meshRendererComponent.materials = [material];
	};


	/**
	 * Gets the entity that has the mesh that represents the body of the ship.
	 *
	 * @return {Entity}
	 */
	Player.prototype._getShipBody = function () {
		var children = this.entity.children().toArray();

		for (var i = 0; i < children.length; ++i) {
			var child = children[i];
			if (child.name === 'body')
				return child;
		}

		return null;
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