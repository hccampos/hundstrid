define([
	'goo/renderer/Renderer',
	'goo/math/Matrix3x3',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function (
	Renderer,
	Matrix3x3,
	Quaternion,
	Vector3,
	MathUtils
) {
	'use strict';


	function LookAtScript(properties) {
		properties = properties || {};
		this._blendWeight = 0;
		this._clipSource = properties.clipSource;
		this._joints = properties.joints;
		this._origo = new Vector3(properties.origo);
		this._azimuth = 0;
		this._ascent = 0;
		this._domElement = null;
		this._dirty = null;
		this._timeout = null;
		this._loseFocus = this._loseFocus.bind(this);

		this.focus = false;
	}


	var calcMat = new Matrix3x3();
	var calcQuat = new Quaternion();
	var calcVec = new Vector3();


	LookAtScript.prototype.run = function (entity, tpf, env) {
		if (env && !this._domElement && env.domElement) {
			this._domElement = env.domElement;
		}

		if (this.focus) {
			// Look at the mouse.
			if (this._blendWeight > 0.98) {
				this._blendWeight = 1;
			} else {
				this._blendWeight = 1 - (1 - this._blendWeight) * 0.9;
			}
		} else {
			// Go back to idle.
			if (this._blendWeight < 0.002) {
				this._blendWeight = 0;
			} else {
				this._blendWeight *= 0.97;
			}
		}

		entity.animationComponent.layers[1].setBlendWeight(this._blendWeight);

		if (this._clipSource && this._joints && this._dirty) {
			var source = this._clipSource;

			for (var i = 0, len = this._joints.length; i < len; ++i) {
				var joint = this._joints[i];
				calcMat.fromAngles(this._azimuth * joint.x, 0, this._ascent * joint.y);
				calcQuat.fromRotationMatrix(calcMat);
				this._clipSource.setRotation(joint.name, calcQuat);
			}
			this._dirty = false;
		}
	};


	LookAtScript.prototype.lookAt = function (x, y) {
		var rect = this._domElement.getBoundingClientRect();
		this.focus = true;

		var camera = Renderer.mainCamera;
		if (!camera) { return; }

		var relX = (x * rect.width) - rect.left;
		var relY = (y * rect.height) - rect.top;

		camera.getWorldCoordinates(relX, relY, rect.width, rect.height, 0.01, calcVec);
		calcVec.subv(this._origo);

		this._ascent = Math.atan2(calcVec.y, calcVec.z);
		this._azimuth = Math.atan2(calcVec.x, calcVec.z);

		this._dirty = true;

		clearTimeout(this._timeout);
		this._timeout = setTimeout(this._loseFocus, 2000);
	};


	LookAtScript.prototype._loseFocus = function () {
		this.focus = false;
	};

	return LookAtScript;
});