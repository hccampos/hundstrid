require([
	'goo/util/rsvp',
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',
	'socket.io/socket.io',
	'js/Game',
	'js/input/GamepadManager'
], function (
	RSVP,
	GooRunner,
	DynamicLoader,
	io,
	Game,
	GamepadManager
) {
	"use strict";

	var goo;
	var loader;
	var game;
	var qrCodeElement;
	var qrCodeWrapperElement;

	init();

	//------------------------------------------------------------------------//


	/**
	 * Initializes the engine and the game.
	 */
	function init() {
		qrCodeElement = document.getElementById('qr-code');
		qrCodeWrapperElement = document.getElementById('qr-code-wrapper');
		qrCodeWrapperElement.classList.add('show');

		goo = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: true,
			logo: false
		});

		var gooCanvas = goo.renderer.domElement;
		gooCanvas.style.width = '100%';
		gooCanvas.style.height = '100%';
		gooCanvas.style.position = 'absolute';
		document.body.appendChild(gooCanvas);

		window.addEventListener('resize', onWindowResized);

		game = new Game(goo);

		loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'assets'
		});

		loader.load('root.bundle', { preloadBinaries: true })
		.then(loadProjectFromBundle)
		.then(game.initScene.bind(game))
		.then(initRenderer)
		.then(initConnections)
		.then(setupLocalPlayers)
		.then(null, function (error) {
			console.error(error);
			console.error(error.stack);
		});
	}


	/**
	 * Loads a project from the specified bundle config.
	 *
	 * @param  {object} bundle
	 *         The bundle configs from where the project is to be extracted.
	 *
	 * @return {Promise}
	 */
	function loadProjectFromBundle (bundle) {
		var project = null;

		// Try to get the first project in the bundle.
		for (var key in bundle) {
			if (/\.project$/.test(key)) {
				project = bundle[key];
				break;
			}
		}

		if (!project || !project.id)
			throw new Error('Error: no project in bundle.');

		return loader.load(project.id);
	}


	/**
	 * Initializes the renderer and starts the game loop.
	 *
	 * @param  {object} configs
	 *         The project configs.
	 *
	 * @return {Promise}
	 */
	function initRenderer(configs) {
		var renderSystem = goo.world.getSystem('RenderSystem');
		var promise = new RSVP.Promise();

		goo.renderer.setClearColor(0, 0, 0, 1.0);
		goo.world.processEntityChanges();
		goo.startGameLoop();
		goo.renderer.domElement.focus();

		goo.callbacks.push(function () {
			game.updateBounds();
			goo.callbacks = [];
		});
	}


	/**
	 * Setups all the socket connections and callbacks.
	 */
	function initConnections() {
		var socket = io.connect(getURL());
		game.initConnections(socket);
		socket.emit('registerGame', null, onRegistered);

		return true;
	}


	function setupLocalPlayers() {
		var gamepadManager = new GamepadManager(game);

		var player1 = game.addPlayer({
			id: 'local1',
			name: 'Player 1'
		});

		document.addEventListener('keydown', function (event) {
			if (event.keyCode === 13) { // ENTER
				var classes = qrCodeWrapperElement.classList;
				if (classes.contains('show')) {
					classes.remove('show');
				} else {
					classes.add('show');
				}
			}

			game._onCommand({
				id: 'local1',
				command: {
					type: 'keydown',
					data: { key: event.key || event.keyCode }
				}
			});
		});

		document.addEventListener('keyup', function (event) {
			game._onCommand({
				id: 'local1',
				command: {
					type: 'keyup',
					data: { key: event.key || event.keyCode }
				}
			});
		});
	}


	/**
	 * Called when the game has been registered with the server.
	 *
	 * @param  {*} data
	 *         The data received from the server and which should contain the
	 *         game id and the game key.
	 */
	function onRegistered(data) {
		if (data && data.id && data.key) {
			makeCode(data.id, data.key);
		}
	}


	function onWindowResized(e) {
		game.updateBounds();
	}


	/**
	 * Generates a new QR code through which players can join the game.
	 *
	 * @param  {string} id
	 *         The identifier of the game.
	 * @param  {string} key
	 *         The key used to authenticate players.
	 */
	function makeCode(id, key) {
		var qrCode = new QRCode(qrCodeElement);

		var baseUrl = getURL() + '/controller';
		var encodedId = encodeURIComponent(id);
		var encodedKey = encodeURIComponent(key);

		var url = baseUrl + '?gameId=' + encodedId + '&key=' + encodedKey;
		qrCode.makeCode(url);

		qrCodeElement.setAttribute('href', url);
	}


	/**
	 * Gets the current URL.
	 *
	 * @return {string}
	 */
	function getURL() {
		return 'http://' + window.location.host;
	}
});