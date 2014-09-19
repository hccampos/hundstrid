require([
	'/socket.io/socket.io.js',
	'js/Joystick'
], function (
	io,
	Joystick
) {
	window.requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

	var gameData = {
		gameId: null,
		key: null
	};

	var socket = null;
	var host = window.location.host;
	var $window = $(window);
	var joystick;

	var GYRO_FREQUENCY = 20;
	var CMD_ROTATE = 'rotate';
	var CMD_KEY_DOWN = 'keydown';
	var CMD_KEY_UP = 'keyup';
	var CMD_MOUSE_MOVE = 'mousemove';
	var CMD_MOUSE_DOWN = 'mousedown';
	var CMD_MOUSE_UP = 'mouseup';
	var CMD_ANALOG_POSITION = 'analogpos';
	var CMD_SHOOT = 'shoot';

	$(document).ready(function () {
		socket = io.connect('http://' + host);

		register();
		addListeners();

		joystick = new Joystick($('.joystick'));

		window.requestAnimationFrame(update);
	});

	//--------------------------------------------------------------------------

	function update(elapsedTime) {
		joystick.update(elapsedTime);
		sendCommand(CMD_ANALOG_POSITION, joystick.position);

		window.requestAnimationFrame(update);
	};


	/**
	 * Registers the player with the game.
	 */
	function register() {
		var params = getQueryParams(document.location.search);

		gameData.gameId = params.gameId;
		gameData.key = params.key;

		socket.emit('registerPlayer', gameData, function (response) {
			if (response === 'OK') {
				console.log('Player registered successfully.');
			} else {
				console.log('Error registering player: ' + response.error);
			}
		});
	}


	/**
	 * Adds the event listeners that will collect data and send it to the game.
	 */
	function addListeners() {
		$window.on('keydown', onKeyDown);
		$window.on('keyup', onKeyUp);

		var eventName = 'mousedown';
		if ('ontouchstart' in document.documentElement) {
			eventName = 'touchstart';
		}

		$('.shoot-button').on(eventName, function (event) {
			event.preventDefault();

			goFullScreen();
			sendCommand(CMD_SHOOT);
		});
	}

	function goFullScreen() {
		var elem = document.body;
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		}
	}


	function sendCommand(cmd, data) {
		socket.emit('command', {
			gameId: gameData.gameId,
			command: { type: cmd, data: data }
		});
	}


	/**
	 * Sends a mouse move command to the server.
	 *
	 * @param  {number} x
	 *         The X coordinate.
	 * @param  {number} y
	 *         The Y coordinate.
	 */
	function sendMouseMoveCmd(x, y) {
		sendCommand(CMD_MOUSE_MOVE, {
			x: x / $window.width(),
			y: y / $window.height()
		});
	}


	/**
	 * Sends a rotate command to the server.
	 *
	 * @param  {number} x
	 *         The X coordinate.
	 * @param  {number} y
	 *         The Y coordinate.
	 * @param  {number} z
	 *         The Z coordinate.
	 */
	function sendRotateCmd(x, y, z) {
		sendCommand(CMD_ROTATE, {
			x: x,
			y: y,
			z: z
		});
	}

	//--------------------------------------------------------------------------


	function onKeyDown(e) {
		sendCommand(CMD_KEY_DOWN, { key: e.which });
	}


	function onKeyUp(e) {
		sendCommand(CMD_KEY_UP, { key: e.which });
	}


	function onMouseDown(e) {
		sendCommand(CMD_MOUSE_DOWN, {
			x: e.clientX / $window.width(),
			y: e.clientY / $window.height()
		});
	}


	function onMouseUp(e) {
		sendCommand(CMD_MOUSE_UP, {
			x: e.clientX / $window.width(),
			y: e.clientY / $window.height()
		});
	}


	function onDeviceMotion(e) {
		sendRotateCmd(e.beta, e.gamma, e.alpha);
	}


	function onMouseMove(e) {
		sendMouseMoveCmd(e.clientX, e.clientY);
	}


	function onTouchMove(e) {
		e.preventDefault();

		var event = window.event;
		if (!event) { return; }

		var touch = event.touches[0];
		sendMouseMoveCmd(touch.pageX, touch.pageY);
	}


	//--------------------------------------------------------------------------

	function getQueryParams(qs) {
		qs = qs.split("+").join(" ");

		var params = {};
		var tokens;
		var re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs)) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}
});