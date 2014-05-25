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
	var loader;
	var isReady = false;

	// Entities
	var spaceship = null;
	var camera = null;
	var light = null;

	var players = {};

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


	/**
	 * Called when a player is added to the game.
	 *
	 * @param  {object} data
	 *         The data received from the server which indicates which player
	 *         was added.
	 */
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


	/**
	 * Called when a player is removed from the game.
	 *
	 * @param  {object} data
	 *         The data received from the server which indicates which player
	 *         was removed.
	 */
	function onPlayerRemoved(data) {
		if (!data.playerId || !players.hasOwnProperty(data.playerId))
			return;

		var player = players[data.playerId];
		player.destroy();

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

		loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'assets'
		});

		loader.load('root.bundle', { preloadBinaries: true })
		.then(loadProjectFromBundle)
		.then(prepareScene)
		.then(initRenderer)
		.then(initConnections)
		.then(function () {
			isReady = true;
		}, function (error) {
			console.error(error);
		});
	}


	/**
	 * Setups all the socket connections and callbacks.
	 */
	function initConnections() {
		var socket = io.connect(getURL());
		socket.on('command', onCommand);
		socket.on('playerAdded', onPlayerAdded);
		socket.on('playerRemoved', onPlayerRemoved);
		socket.emit('registerGame', null, onRegistered);
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

		if (!project || !project.id) {
			throw new Error('Error: no project in bundle.');
		}

		return loader.load(project.id);
	}


	/**
	 * Prepares the scene before starting the game loop.
	 *
	 * @param  {object} configs
	 *         The project configs.
	 *
	 * @return {object}
	 *         The config object passed as a parameter.
	 */
	function prepareScene(configs) {
		// Make sure the world has been processed so that we can select the
		// entities.
		goo.world.processEntityChanges();

		// Get some entities that we are interested in.
		spaceship = goo.world.by.name("spaceship").toArray()[0];
		camera = goo.world.by.name("camera").toArray()[0];
		light = goo.world.by.name("light_1").toArray()[0];

		// Remove the spaceship because we only need it to create clones.
		// We won't actually control it or display it.
		spaceship.removeFromWorld();

		return configs;
	}


	function initRenderer(configs) {
		var renderSystem = goo.world.getSystem('RenderSystem');
		var promise = new RSVP.Promise();

		goo.renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights, function () {
			goo.renderer.preloadMaterials(renderSystem._activeEntities, function () {
				goo.world.processEntityChanges();
				goo.startGameLoop();
				goo.renderer.domElement.focus();

				promise.resolve();
			});
		});

		goo.renderer.setClearColor(0, 0, 0, 1.0);

		return promise;
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
		var $qrCode = $('#qr-code');
		var qrCode = new QRCode($qrCode[0]);

		var baseUrl = getURL() + '/controller'
		var encodedId = encodeURIComponent(id);
		var encodedKey = encodeURIComponent(key);

		var url = baseUrl + '?gameId=' + encodedId + '&key=' + encodedKey

		qrCode.makeCode(url);

		$qrCode.attr('href', url);
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