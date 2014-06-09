define([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/ScriptComponent',
	'js/SpaceshipScript'
], function (
	Material,
	ShaderLib,
	ScriptComponent,
	SpaceshipScript
) {
	var KEY_LEFT = 37;
	var KEY_RIGHT = 39;
	var KEY_UP = 38;
	var KEY_DOWN = 40;
	var KEY_ENTER = 13;
	var KEY_SPACE = 32;

	var SHIP_SCALE = 0.08;


	function Player(game, id, entity) {
		this.id = id;
		this.entity = entity;
		this.game = game;

		this.randomizeTransform();
		this.randomizeColor();

		this.script = new SpaceshipScript(this);
		this.entity.setComponent(new ScriptComponent(this.script));
	}


	Player.prototype.destroy = function () {
		this.entity.removeFromWorld();
	};


	keyDownHandlers = {}
	keyDownHandlers[KEY_LEFT] = function () {
		this.script.startRotatingLeft();
	};

	keyDownHandlers[KEY_RIGHT] = function () {
		this.script.startRotatingRight();
	};

	keyDownHandlers[KEY_UP] = function () {
		this.script.startAccelerating();
	};

	keyDownHandlers[KEY_SPACE] = function () {
		if (this._isShooting)
			return;

		this.script.shoot();
		this._isShooting = true;
	};


	keyUpHandlers = {}
	keyUpHandlers[KEY_LEFT] = function () {
		this.script.stopRotatingLeft();
	};

	keyUpHandlers[KEY_RIGHT] = function () {
		this.script.stopRotatingRight();
	};

	keyUpHandlers[KEY_UP] = function () {
		this.script.stopAccelerating();
	};

	keyUpHandlers[KEY_SPACE] = function () {
		this._isShooting = false;
	};


	Player.prototype.applyCommand = function (command) {
		switch(command.type) {
			case 'keydown':
				if (keyDownHandlers.hasOwnProperty(command.data.key)) {
					keyDownHandlers[command.data.key].apply(this);
				}
				break;
			case 'keyup':
				if (keyUpHandlers.hasOwnProperty(command.data.key)) {
					keyUpHandlers[command.data.key].apply(this);
				}
				break;
			default:
				break;
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
		shipBody = this._getShipBody();
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


	return Player;
});