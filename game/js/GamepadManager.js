define([
], function () {
	function GamepadManager(game) {
		this.game = game;
		this._ticking = false;
		this._gamepads = [];
		this._prevGamepads = [];
		this._firstRun = true;

		this.init();
	}


	GamepadManager.prototype.init = function () {
		if (!this.isSupported()) { return; }

		if ('ongamepadconnected' in window) {
			window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this), false);
			window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this), false);
		} else {
			this.startPolling();
		}
	};


	GamepadManager.prototype.isSupported = function () {
		return navigator.getGamepads ||
        	!!navigator.webkitGetGamepads ||
        	!!navigator.webkitGamepads;
	}


	GamepadManager.prototype.startPolling = function () {
		if (this._ticking) { return; }

		this._ticking = true;
		this.tick();
	};


	GamepadManager.prototype.stopPolling = function () {
		this._ticking = false;
	};


	GamepadManager.prototype.tick = function () {
		this.pollGamepads();
		this.scheduleNextTick();

		this._firstRun = false;
	};


	GamepadManager.prototype.scheduleNextTick = function () {
		if (!this._ticking) { return; }

		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this.tick.bind(this));
		} else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(this.tick.bind(this));
		} else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(this.tick.bind(this));
		}1
	};


	GamepadManager.prototype.pollGamepads = function () {
		var gamepads =
			(navigator.getGamepads && navigator.getGamepads()) ||
			(navigator.webkitGetGamepads && navigator.webkitGetGamepads());

		if (!gamepads) { return; }

		for (var i = 0; i < gamepads.length; ++i) {
			var gamepad = gamepads[i];
			var prevGamepad = this._prevGamepads[i];
			this._prevGamepads[i] = gamepad;

			if (gamepad && !prevGamepad) {
				this._addGamepad(gamepad);
			} else if (!gamepad && prevGamepad) {
				this._removeGamepad(prevGamepad);
			}
		}
	};


	GamepadManager.prototype._getPlayerForGamepad = function (gamepad) {
		for (var i = 0; i < this._gamepads.length; ++i) {
			var data = this._gamepads[i];
			if (data.gamepad && data.gamepad.index === gamepad.index) {
				return data.player;
			}
		}

		return null;
	};


	GamepadManager.prototype._addGamepad = function (gamepad) {
		var index = gamepad.index + 1;
		var player = this.game.addPlayer({
			id: 'gamepad' + index,
			name: 'Gamepad ' + index
		});

		this._gamepads.push({
			player: player,
			gamepad: gamepad
		});
	};


	GamepadManager.prototype._removeGamepad = function (gamepad) {
		var player = this._getPlayerForGamepad(gamepad);
		this.game.removePlayer(player);

		// Remove the gamepad-player association.
		for (var i = 0; i < this._gamepads[i]; ++i) {
			if (this._gamepads[i].gamepad.index === gamepad.index) {
				this._gamepads.splice(i, 1);
				break;
			}
		}
	};


	GamepadManager.prototype._onGamepadConnected = function (event) {
		this._addGamepad(event.gamepad);
		this.startPolling();
	};


	GamepadManager.prototype._onGamepadDisconnected = function (event) {
		this._removeGamepad(event.gamepad);
	};


	return GamepadManager;
});