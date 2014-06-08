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


	function Player(id, entity) {
		this.id = id;
		this.entity = entity;

		this.randomizeTransform();
		this.randomizeColor();

		this.script = new SpaceshipScript(this);
		this.entity.setComponent(new ScriptComponent(this.script));
	}


	Player.prototype.destroy = function () {
		this.entity.removeFromWorld();
	};


	Player.prototype.applyCommand = function (command) {
		switch(command.type) {
			case 'keydown':
				this.onKeyDown(command.data.key);
				break;
			case 'keyup':
				this.onKeyUp(command.data.key);
				break;
			default:
				break;
		}
	};


	Player.prototype.onKeyDown = function (key) {
		switch (key) {
			case KEY_LEFT:
				this.script.startRotatingLeft();
				break;
			case KEY_RIGHT:
				this.script.startRotatingRight();
				break;
			case KEY_UP:
				this.script.startAccelerating();
				break;
			default:
				break;
		}
	};


	Player.prototype.onKeyUp = function (key) {
		switch (key) {
			case KEY_LEFT:
				this.script.stopRotatingLeft();
				break;
			case KEY_RIGHT:
				this.script.stopRotatingRight();
				break;
			case KEY_UP:
				this.script.stopAccelerating();
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