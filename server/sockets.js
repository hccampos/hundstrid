var rand = require('generate-key');
var uuid = require('node-uuid');
var _ = require('lodash');

var GameManager = require('./GameManager');
var Game = require('./Game');
var Player = require('./Player');

//------------------------------------------------------------------------------

var gameManager = new GameManager();

function onConnection(socket) {
	var player = null;
	var game = null;

	socket.on('registerGame', function (data, res) {
		var game = new Game(socket);
		gameManager.addGame(game);

		res({ id: game.id, key: game.getKey() });
	});


	socket.on('registerPlayer', function (data, res) {
		if (!data || _.isFunction(data))
			res({ error: 'Invalid arguments.'});
		if (player)
			return res({error: 'Player already registered.'});
		if (game)
			return res({error: 'A game can\'t be registered as a player.'});

		var game = gameManager.getGameById(data.gameId);

		if (!game)
			return res({ error: 'The specified game does not exist, can\'t join.'});
		if (!game.checkKey(data.key))
			return res({ error: 'Invalid game key.'});

		player = new Player(socket);
		game.addPlayer(player);

		res('OK');
	});


	socket.on('command', function (data, res) {
		if (!data || _.isFunction(data) || !data.gameId)
			return

		var game = gameManager.getGameById(data.gameId);

		if (!game || !game.hasPlayer(player))
			return

		game.sendCommand(data.command, player);
	});


	socket.on('disconnect', function () {
		if (game) { gameManager.removeGame(game); }
		if (player) { player.removeFromGame(); }
	});
}

//------------------------------------------------------------------------------

module.exports = function (io) {
	io.sockets.on('connection', onConnection);
};