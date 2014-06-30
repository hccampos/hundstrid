define([
], function (
) {
	var ANIM_SPEED_FACTOR = 0.02;
	var POS_THRESHOLD = 0.001;

	function clamp(val, min, max) {
		return Math.max(Math.min(val, max), min);
	}


	function Joystick(element) {
		this.element = element;
		this.handle = element.find('.handle');
		this._isDragging = false;
		this.position = {x: 0, y: 0};

		this._addListeners();
	}


	Joystick.prototype.update = function (timestamp) {
		if (!this._previousTime) {
			this._previousTime = timestamp;
			return;
		}

		var elapsedTime = timestamp - this._previousTime;
		this._previousTime = timestamp;

		var x = this.position.x;
		var y = this.position.y;

		if (!this._isDragging) {
			var difX = -x * ANIM_SPEED_FACTOR * elapsedTime;
			if (Math.abs(x) > POS_THRESHOLD && x * (x - difX) > 0) {
				this.position.x += difX;
			} else {
				this.position.x = 0;
			}

			var difY = -y * ANIM_SPEED_FACTOR * elapsedTime;
			if (Math.abs(y) > POS_THRESHOLD && y * (y - difY) > 0) {
				this.position.y += difY;
			} else {
				this.position.y = 0;
			}
		}

		this.updateHandle();
	};


	Joystick.prototype.updateHandle = function () {
		var halfWidth = this.element.width() / 2;
		var halfHeight = this.element.height() / 2;
		var x = this.position.x;
		var y = this.position.y;

		var distance = Math.sqrt(x * x + y * y);

		if (distance > 1) {
			var angle = Math.atan2(y, x);
			this.position.x = Math.cos(angle);
			this.position.y = Math.sin(angle);
		}

		this.handle.css({
			left: this.position.x * halfWidth + halfWidth,
			top: -this.position.y * halfHeight + halfHeight
		});
	};


	Joystick.prototype.setFromAbsolute = function (x, y) {
		var joystickPos = this.element.offset();
		var x = x - joystickPos.left;
		var y = y - joystickPos.top;

		this.position.x = x / this.element.width() * 2 - 1;
		this.position.y = -y / this.element.height() * 2 + 1;
	};


	Joystick.prototype.onMouseUp = function (event) {
		this._isDragging = false;
	};


	Joystick.prototype.onMouseDown = function (event) {
		this._isDragging = true;
		this.setFromAbsolute(event.clientX, event.clientY);
	};


	Joystick.prototype.onMouseMove = function (event) {
		if (!this._isDragging) {
			return;
		}

		this.setFromAbsolute(event.clientX, event.clientY);
	};


	Joystick.prototype._addListeners = function () {
		$(document).on('mouseup', this.onMouseUp.bind(this));
		this.element.on('mousedown', this.onMouseDown.bind(this));
		$(document).on('mousemove', this.onMouseMove.bind(this));
	};

	return Joystick;
});