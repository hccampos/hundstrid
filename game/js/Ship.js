define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'js/Thruster',
	'js/Explosion'
], function (
	Entity,
	TransformComponent,
	ScriptComponent,
	Material,
	ShaderLib,
	Thruster,
	Explosion
) {
	/**
	 * Creates a new ship.
	 */
	function Ship(world, name, id) {
		Entity.apply(this, arguments); // Super constructor.

		var transformComponent = new TransformComponent();
		this.setComponent(transformComponent);

		this.thruster = new Thruster(world).addToWorld();
		this.attachChild(this.thruster);

		this.explosion = new Explosion(world).addToWorld();
		this.attachChild(this.explosion);
	}
	Ship.prototype = Object.create(Entity.prototype);
	Ship.prototype.constructor = Ship;


	/**
	 * Sets the entity which contains the model of the ship.
	 *
	 * @param {Entity} model
	 *		The entity which contains the model of the ship.
	 */
	Ship.prototype.setModel = function (model) {
		this.model = model;
		model.addToWorld();
		this.attachChild(model);
	};


	/**
	 * Sets the script used to control the ship.
	 *
	 * @param {Script} script
	 *		The script used to control the ship.
	 */
	Ship.prototype.setScript = function (script) {
		this.script = script;
		this.setComponent(new ScriptComponent(script));
	};


	/**
	 * Spawns the ship in a random position.
	 */
	Ship.prototype.spawn = function () {
		this.randomizeTransform();
		this.model.show();
	};


	/**
	 * Kills the ship by hiding it.
	 */
	Ship.prototype.kill = function () {
		this.script.kill();
		this.thruster.stop();

		var that = this;
		window.setTimeout(function () {
			that.model.hide();
		}, 200);
	};


	/**
	 * Places the ship in a random position.
	 */
	Ship.prototype.randomizeTransform = function () {
		var x = Math.random() * 1000 - 250;
		var y = Math.random() * 500 - 250;
		this.setTranslation(x, 0, y);
		this.setRotation(0, 2 * Math.random() * Math.PI, 0);
	};


	/**
	 * Sets the color of the ship randomly.
	 *
	 * @param {Color} color
	 *		The color which is to be set on the ship.
	 */
	Ship.prototype.setColor = function (color) {
		var shipBody = this._getShipBody();
		if (!shipBody) {
			return;
		}

		var material = new Material();
		material.shader = Material.createShader(ShaderLib.uber, 'Ship Material');

		material.uniforms.materialDiffuse = color.concat([]);
		material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1];

		shipBody.meshRendererComponent.materials = [material];
	};


	/**
	 * Gets the entity that has the mesh that represents the body of the ship.
	 *
	 * @return {Entity}
	 */
	Ship.prototype._getShipBody = function () {
		var children = this.model.children().toArray();

		for (var i = 0; i < children.length; ++i) {
			var child = children[i];
			if (child.name === 'body')
				return child;
		}

		return null;
	};


	return Ship;
});