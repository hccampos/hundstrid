define([], function () {
	DEFAULT_THRESHOLD = 0.2;

	function Gamepad(index) {
		this.index = index;
		this._data = null;
		this._buttons = null;
		this._prevButtons = null;
	}

	Gamepad.BUTTONS = {
		X: 0,
		CIRCLE: 1,
		SQUARE: 2,
		TRIANGLE: 3,
		LEFT_SHOULDER: 4,
		RIGHT_SHOULDER: 5,
		LEFT_TRIGGER: 6,
		RIGHT_TRIGGER: 7,
		SELECT: 8,
		START: 9,
		LEFT_STICK: 10,
		RIGHT_STICK: 11,
		PAD_TOP: 12,
		PAD_BOTTOM: 13,
		PAD_LEFT: 14,
		PAD_RIGHT: 15
	};

	Gamepad.AXES = {
		LEFT_H: 0,
		LEFT_V: 1,
		RIGHT_H: 2,
		RIGHT_V: 3,
		LEFT_TRIGGER: 5,
		RIGHT_TRIGGER: 7
	};


	Gamepad.prototype.destroy = function () {
		this.player = undefined;
		this._data = undefined;
	};


	Gamepad.prototype.update = function () {
		var data = this._getGamepadsData();
		if (!data) {
			this._setData(null);
			return;
		}

		for (var i = 0; i < data.length; ++i) {
			var gamepadData = data[i];
			if (gamepadData && gamepadData.index === this.index) {
				this._setData(gamepadData);
				return;
			}
		}

		this._setData(null);
	};


	Gamepad.prototype.isButtonPressed = function (button) {
		if (!this._buttons) { return false; }
		return this._buttons[button];
	};


	Gamepad.prototype.isButtonReleased = function (button) {
		return !this.isButtonPressed(button);
	};


	Gamepad.prototype.isNewButtonPressed = function (button) {
		if (!this._buttons || !this._prevButtons) { return false; }
		return this._buttons[button] && !this._prevButtons[button];
	}


	Gamepad.prototype.isNewButtonReleased = function (button) {
		if (!this._buttons || !this._prevButtons) { return false; }
		return !this._buttons[button] && this._prevButtons[button];
	};


	Gamepad.prototype.getButtonValue = function (button) {
		if (!this._buttons || !this._prevButtons) { return 0; }
		return this._data.buttons[button].value;
	}


	Gamepad.prototype.getAxisValue = function (axis) {
		if (!this._data) { return 0; }
		return this._data.axes[axis];
	};


	Gamepad.prototype.isLeftTriggerActive = function (_threshold) {
		var threshold = _threshold || DEFAULT_THRESHOLD;
		return this.getButtonValue(Gamepad.BUTTONS.LEFT_TRIGGER) > threshold;
	};


	Gamepad.prototype.isRightTriggerActive = function (_threshold) {
		var threshold = _threshold || DEFAULT_THRESHOLD;
		return this.getButtonValue(Gamepad.BUTTONS.RIGHT_TRIGGER) > threshold;
	};


	//--------------------------------------------------------------------------


	Gamepad.prototype._setData = function (data) {
		this._data = data;
		this._prevButtons = this._buttons;
		this._buttons = copyArray(data.buttons);
	};


	Gamepad.prototype._getGamepadsData = function () {
		return (navigator.getGamepads && navigator.getGamepads()) ||
			(navigator.webkitGetGamepads && navigator.webkitGetGamepads());
	};


	function copyArray(src) {
		var dest = [];
		for (var i = 0; i < src.length; ++i) {
			dest.push(src[i].pressed);
		}

		return dest;
	}


	return Gamepad;
});