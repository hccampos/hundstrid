define([
	'goo/entities/Entity',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'js/vendor/signals',
	'js/Player',
	'js/MatchScript',
	'js/gui/ScoresWidget'
], function (
	Entity,
	EntityUtils,
	ScriptComponent,
	Signal,
	Player,
	MatchScript,
	ScoresWidget
) {
	function Game(goo) {
		this.goo = goo;
		this.world = goo.world;
		this.players = {};
		this.playersArray = [];
		this._spaceship = null;
		this._camera = null;
		this._light = null;

		this.playerAdded = new Signal();
		this.playerRemoved = new Signal();

		this.initGui();
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
	Game.prototype.initScene = function (configs) {
		// Make sure the world has been processed so that we can select the
		// entities.
		this.world.processEntityChanges();

		// Get some entities that we are interested in.
		this._spaceship = this.world.by.name('spaceship').toArray()[0];
		this._camera = this.world.by.name('camera').toArray()[0];
		this._light = this.world.by.name('light_1').toArray()[0];

		// Remove the spaceship from the world because we only need it to create
		// clones. We won't actually control it or display it.
		this._spaceship.removeFromWorld();

		// Put a match script inside of an entity.
		this.matchScript = new MatchScript(this);
		var matchEntity = new Entity(this.world).addToWorld();
		matchEntity.setComponent(new ScriptComponent(this.matchScript));

		return configs;
	};


	Game.prototype.initGui = function () {
		this._scoresWidget = new ScoresWidget(this);
		document.body.appendChild(this._scoresWidget.element);
	};


	Game.prototype.initConnections = function (socket) {
		this.socket = socket;
		socket.on('command', this._onCommand.bind(this));
		socket.on('playerAdded', this._onPlayerConnected.bind(this));
		socket.on('playerRemoved', this._onPlayerDisconnected.bind(this));
	};


	/**
	 * Called when the game receives a command from a player.
	 *
	 * @param  {*} data
	 *         The data received from the server.
	 */
	Game.prototype._onCommand = function (data) {
		var player = this.getPlayerById(data ? data.id : null);
		if (!player)
			return;

		// Make sure we actually have a command to apply.
		var command = data.command;
		if (!command || !command.type)
			return;

		player.applyCommand(command);
	};


	/**
	 * Called when a player is added to the game.
	 *
	 * @param  {object} data
	 *         The data received from the server which indicates which player
	 *         was added.
	 */
	Game.prototype._onPlayerConnected = function (data) {
		this.addPlayer(data);
	};


	/**
	 * Called when a player is removed from the game.
	 *
	 * @param  {object} data
	 *         The data received from the server which indicates which player
	 *         was removed.
	 */
	Game.prototype._onPlayerDisconnected = function (data) {
		this.removePlayerById(data ? data.id : null);
	};


	/**
	 * Adds a new player with the specified identifier.
	 *
	 * @param {object} playerData
	 *        The data of the new player.
	 */
	Game.prototype.addPlayer = function (playerData) {
		var ship = EntityUtils.clone(this.world, this._spaceship, function (e) {
			return e;
		});

		var id = playerData.id;
		var name = playerData.name;

		var player = new Player(this, playerData, ship);
		this.players[id] = player;
		this.playersArray.push(player);

		player.spawn();

		this.playerAdded.dispatch(player);

		return player;
	};


	/**
	 * Removes the specified player from the game.
	 *
	 * @param  {Player} player
	 *         The player which is to be removed.
	 */
	Game.prototype.removePlayer = function (player) {
		if (!player || !player.id)
			return;

		player.destroy();

		this.playersArray = this.playersArray.filter(function (p) {
			return player !== p;
		});

		delete this.players[player.id];

		this.playerRemoved.dispatch(player);

		return this;
	};


	/**
	 * Removes the player with the specifed identifier from the game.
	 *
	 * @param  {string} id
	 *         The identifier of the player which is to be removed.
	 */
	Game.prototype.removePlayerById = function (id) {
		var player = this.getPlayerById(id);
		if (!player)
			return;

		return this.removePlayer(player);
	};


	/**
	 * Gets whether the game has the specified player.
	 *
	 * @param  {Player}  player
	 *         The player whose existence is to be checked.
	 *
	 * @return {boolean}
	 *         True if the game has the specified player and false otherwise.
	 */
	Game.prototype.hasPlayer = function (player) {
		return player && player.id && this.hasPlayerById(player.id);
	};


	/**
	 * Gets whether the game has a player with the specified identifier.
	 *
	 * @param  {string}  id
	 *         The identifier of the player whose existence is to be checked.
	 *
	 * @return {boolean}
	 *         True if the game has the specified player and false otherwise.
	 */
	Game.prototype.hasPlayerById = function (id) {
		return !!this.players[id];
	};


	/**
	 * Gets the player with the specified identifier.
	 *
	 * @param  {string} id
	 *         The identifier of the player which is to be retrieved.
	 *
	 * @return {Player}
	 */
	Game.prototype.getPlayerById = function (id) {
		return typeof id === 'string' ? this.players[id] : null;
	};


	/**
	 * Gets the game world bounds.
	 *
	 * @return {object}
	 */
	Game.prototype.updateBounds = function () {
		var camera = this._camera.cameraComponent.camera;
		var w = window.clientWidth || window.innerWidth;
		var h = window.clientHeight || window.innerHeight;
		var distance = this._camera.transformComponent.transform.translation[1];

		var topLeft = camera.getWorldPosition(0, 0, w, h, distance);
		var bottomRight = camera.getWorldPosition(w, h, w, h, distance);

		this.bounds = {
			minX: topLeft[0] - 20,
			maxX: bottomRight[0] + 20,
			minY: topLeft[2] - 20,
			maxY: bottomRight[2] + 20
		};

		return this;
	};

	//--------------------------------------------------------------------------

	return Game;
});