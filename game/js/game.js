require([
	'goo/util/rsvp',
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/loaders/DynamicLoader',
	'js/Player',
	'socket.io/socket.io'
], function (
	RSVP,
	GooRunner,
	EntityUtils,
	DynamicLoader,
	Player,
	io
) {
	"use strict";

	var goo;
	var isReady = false;
	var spaceship = null;
	var camera = null;
	var light = null;
	var players = {};

	var $qrCode = $('#qr-code');
	var $ball = $('#ball');
	var host = "http://" + window.location.host;

	var qrCode = new QRCode($qrCode[0]);

	initEngine();

	//------------------------------------------------------------------------//


	/**
	 * Called when the game receives a command from a player.
	 *
	 * @param  {*} data
	 *         The data received from the server.
	 */
	function onCommand(data) {
		var playerId = data.playerId;
		if (!playerId || !players.hasOwnProperty(playerId))
			return;

		var command = data.command;
		if (!command || !command.type)
			return;

		players[playerId].applyCommand(command);
	}


	function onPlayerAdded(data) {
		if (!data.playerId)
			return;

		var entity = EntityUtils.clone(goo.world, spaceship, function (entity) {
			return entity;
		});

		goo.world.addEntity(entity);
		players[data.playerId] = new Player(entity);

		console.log('Player was added: ' + data.playerId);
	}


	function onPlayerRemoved(data) {
		console.log(data);

		if (!data.playerId || !players.hasOwnProperty(data.playerId))
			return;

		var player = players[data.playerId];
		player.getEntity().removeFromWorld();

		delete players[data.playerId];

		console.log('Player was removed: ' + data.playerId);
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


	/**
	 * Initializes the engine and the game.
	 */
	function initEngine() {
		goo = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: true,
			logo: false
		});

		var gooCanvas = goo.renderer.domElement;
		gooCanvas.style.width = '100%';
		gooCanvas.style.height = '100%';
		document.body.appendChild(gooCanvas);

		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'assets'
		});

		loader.load('root.bundle', {
			preloadBinaries: true
		})
		.then(function (bundle) {
			var project = null;

			// Try to get the first project in the bundle.
			for (var key in bundle) {
				if (/\.project$/.test(key)) {
					project = bundle[key];
					break;
				}
			}

			if (!project || !project.id) {
				alert('Error: No project in bundle'); // Should never happen.
				return null;
			}

			return loader.load(project.id);
		})
		.then(function (configs) {
			goo.world.processEntityChanges();

			spaceship = goo.world.by.name("spaceship").toArray()[0];
			camera = goo.world.by.name("camera").toArray()[0];
			light = goo.world.by.name("light_1").toArray()[0];

			spaceship.removeFromWorld();

			var renderSystem = goo.world.getSystem('RenderSystem');
			var promise = new RSVP.Promise();

			goo.renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights, function () {
				goo.renderer.preloadMaterials(renderSystem._activeEntities, function () {
					promise.resolve();
				});
			});

			goo.renderer.setClearColor(0, 0, 0, 1.0);

			return promise;
		})
		.then(function () {
			goo.world.processEntityChanges();
			goo.startGameLoop();
			goo.renderer.domElement.focus();

			initSockets();
		}, function (error) {
			console.log(error);
		});
	}


	/**
	 * Setups all the socket connections and callbacks.
	 */
	function initSockets() {
		var socket = io.connect(host);
		socket.on('command', onCommand);
		socket.on('playerAdded', onPlayerAdded);
		socket.on('playerRemoved', onPlayerRemoved);
		socket.emit('registerGame', null, onRegistered);

		isReady = true;
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
		var baseUrl = host + '/controller'
		var encodedId = encodeURIComponent(id);
		var encodedKey = encodeURIComponent(key);

		var url = baseUrl + '?gameId=' + encodedId + '&key=' + encodedKey

		qrCode.makeCode(url);

		$qrCode.attr('href', url);
	}
});