define([
	'js/input/Gamepad'
], function (
	Gamepad
) {
	/**
	 * Gamepad manager
	 *
	 * @param {Game} game
	 *        The game to which the gamepad manager belongs.
	 */
	function GamepadManager(game) {
		this.game = game;
		this._polling = false;
		this._players = [];
		this._prevData = [];
		this._firstRun = true;

		this.init();
	}


	/**
	 * Initializes the gamepad manager and starts polling for gamepad changes.
	 */
	GamepadManager.prototype.init = function () {
		if (!this.isSupported()) { return; }

		if ('ongamepadconnected' in window) {
			window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this), false);
			window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this), false);
		} else {
			this.startPolling();
		}
	};


	/**
	 * Gets whether the gamepad API is supported.
	 *
	 * @return {Boolean}
	 *         True if the gamepad API is supported and false otherwise.
	 */
	GamepadManager.prototype.isSupported = function () {
		return navigator.getGamepads ||
        	!!navigator.webkitGetGamepads ||
        	!!navigator.webkitGamepads;
	}


	/**
	 * Starts polling for changes in the gamepads.
	 */
	GamepadManager.prototype.startPolling = function () {
		if (this._polling) { return; }

		this._polling = true;
		this.poll();
	};


	/**
	 * Stops polling for changes in the gamepads.
	 */
	GamepadManager.prototype.stopPolling = function () {
		this._polling = false;
	};


	/**
	 * Retrieves the state of the gamepads and updates all of them.
	 */
	GamepadManager.prototype.poll = function () {
		var data = this._getGamepadsData();

		if (!data) { return; }

		for (var i = 0; i < data.length; ++i) {
			var newGamepadData = data[i];
			var prevGamepadData = this._prevData[i];
			this._prevData[i] = newGamepadData;

			if (newGamepadData && !prevGamepadData) {
				this._addGamepad(newGamepadData);
			} else if (!newGamepadData && prevGamepadData) {
				this._removeGamepad(prevGamepadData.index);
			}
		}

		this._firstRun = false;
		this._scheduleNextPoll();
	};


	//--------------------------------------------------------------------------


	/**
	 * Schedules a new poll of the gamepad state.
	 */
	GamepadManager.prototype._scheduleNextPoll = function () {
		if (!this._polling) { return; }

		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this.poll.bind(this));
		} else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(this.poll.bind(this));
		} else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(this.poll.bind(this));
		}
	};


	/**
	 * Gets the current state of all the gamepads.
	 *
	 * @return {array}
	 *         Array which should contain an object with the state of each
	 *         available gamepad.
	 */
	GamepadManager.prototype._getGamepadsData = function () {
		return (navigator.getGamepads && navigator.getGamepads()) ||
			(navigator.webkitGetGamepads && navigator.webkitGetGamepads());
	};


	/**
	 * Adds a new gamepad to the manager and a new player to the game which is
	 * associated with the new gamepad.
	 *
	 * @param {object} gamepadData
	 *        The object which contains the current state of the gamepad which
	 *        is to be added.
	 */
	GamepadManager.prototype._addGamepad = function (gamepadData) {
		var gamepad = new Gamepad(gamepadData.index);
		var index = gamepadData.index + 1;

		var player = this.game.addPlayer({
			id: 'gamepad' + index,
			name: 'Gamepad ' + index,
			gamepad: gamepad
		});

		this._players.push(player);
	};


	/**
	 * Removes a gamepad from the manager and the corresponding player from the
	 * game.
	 *
	 * @param {integer} index
	 *        The index of the gamepad which is to be removed.
	 */
	GamepadManager.prototype._removeGamepad = function (index) {
		var player = this._getPlayerByGamepadIndex(index);
		this.game.removePlayer(player);

		// Remove the player from the gamepad manager.
		var idx = this._players.indexOf(player);
		this._players.splice(idx, 1);

		gamepad.destroy();
	};


	/**
	 * Gets the player whose gamepad has the specified index.
	 *
	 * @param {integer} index
	 *        The index of the gamepad used by the player that is to be
	 *        returned.
	 *
	 * @return {Player}
	 *         The player which has the gamepad with the specified index.
	 */
	GamepadManager.prototype._getPlayerByGamepadIndex = function (index) {
		for (var i = 0; i < this._players.length; ++i) {
			var player = this._players[i];
			if (player.gamepad.index === index) {
				return player;
			}
		}

		return null;
	};


	GamepadManager.prototype._onGamepadConnected = function (event) {
		this._addGamepad(event.gamepad);
		this.startPolling();
	};


	GamepadManager.prototype._onGamepadDisconnected = function (event) {
		this._removeGamepad(event.gamepad.index);
	};


	return GamepadManager;
});