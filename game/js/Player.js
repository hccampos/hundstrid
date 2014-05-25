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


	function Player(entity) {
		this._entity = entity;

		this._entity.setTranslation([Math.random() * 500 - 250, 0, Math.random() * 500 - 250]);

		var shipBody = null;

		var children = entity.children().toArray();
		for (var i = 0; i < children.length; ++i) {
			var child = children[i];
			if (child.name === 'body') {
				shipBody = child;
				break;
			}
		}

		if (shipBody) {
			var presetMaterial = shipBody.meshRendererComponent.materials[0];

			var material = new Material();
			material.shader = Material.createShader(ShaderLib.uber, 'DefaultShader');

			var r = Math.random() * 0.9 + 0.1;
			var b = Math.random() * 0.9 + 0.1;
			var g = Math.random() * 0.9 + 0.1;

			material.uniforms.materialDiffuse = [r, g, b, 1];
			material.uniforms.materialAmbient = [0.2, 0.2, 0.2, 1];

			shipBody.meshRendererComponent.materials = [material];
		}

		this._script = new SpaceshipScript();

		this._entity.setComponent(new ScriptComponent(this._script));
	}


	Player.prototype.destroy = function () {
		this._entity.removeFromWorld();
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
				this._script.startRotatingLeft();
				break;
			case KEY_RIGHT:
				this._script.startRotatingRight();
				break;
			case KEY_SPACE:
				this._script.startAccelerating();
				break;
			default:
				break;
		}
	};


	Player.prototype.onKeyUp = function (key) {
		switch (key) {
			case KEY_LEFT:
				this._script.stopRotatingLeft();
				break;
			case KEY_RIGHT:
				this._script.stopRotatingRight();
				break;
			case KEY_SPACE:
				this._script.stopAccelerating();
				break;
			default:
				break;
		}
	};


	Player.prototype.getEntity = function () { return this._entity; }
	Player.prototype.getScript = function () { return this._script; }


	return Player;
});