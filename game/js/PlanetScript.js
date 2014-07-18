define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	var ROTATION_SPEED = 0.1;

	/**
	 * Creates a new planet script.
	 */
	function PlanetScript(world, name, id) {
		this._rotation = new Vector3();
	}


	PlanetScript.prototype.run = function (entity, tpf, env) {
		this._rotation[0] += ROTATION_SPEED * tpf;
		this._rotation[1] += ROTATION_SPEED * tpf;
		this._rotation[2] += ROTATION_SPEED * tpf;
		entity.setRotation(this._rotation);
	}


	return PlanetScript;
});