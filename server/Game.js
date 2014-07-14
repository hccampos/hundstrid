var _ = require('lodash');
var uuid = require('node-uuid');
var rand = require('generate-key');

//------------------------------------------------------------------------------

/**
 * Creates a new game.
 *
 * @param {socket} socket
 *		The socket used to communicate with the game.
 */
function Game(socket) {
	this.id = uuid.v4();
	this._key = rand.generateKey();
	this._socket = socket;
	this._players = [];
}


/**
 * Sends a command to the game.
 *
 * @param  {*} command
 *         The command which is to be sent to the game.
 * @param  {Player} player
 *         The player which sent the command.
 */
Game.prototype.sendCommand = function (command, player) {
	var data = {};

	if (_.isString(command))
		command = { type: command };

	data.command = command;

	if (player)
		data.id = player.id;

	this._socket.emit('command', data);
};


/**
 * Adds a player to the game.
 *
 * @param {Player} player
 *		The player which is to be added.
 */
Game.prototype.addPlayer = function (player) {
	player.setGame(this);
	this._players.push(player);

	this._socket.emit('playerAdded', { id: player.id });
};


/**
 * Removes a player from the game.
 *
 * @param  {Player} player
 * 		The player which is to be removed from the game.
 */
Game.prototype.removePlayer = function (player) {
	var index = this._players.indexOf(player);
	if (index > -1) {
		player.setGame(null);
		this._players.splice(index, 1);
		this._socket.emit('playerRemoved', { id: player.id });
	}
};


/**
 * Removes a player from the game, by id.
 *
 * @param  {string} id
 *		The identifier of the player which is to be removed from the game.
 */
Game.prototype.removePlayerById = function (id) {
	var player = this.getPlayerById(id);
	this.removePlayer(player);
};


/**
 * Gets a player who is in the game, by id.
 *
 * @param  {string} id
 * 		The identifier of the player which is to be retrieved.
 *
 * @return {Player}
 *		The player that was found or null if none was found.
 */
Game.prototype.getPlayerById = function (id) {
	return _.find(this._players, function (p) { return p.id === id });
};


/**
 * Gets whether the specified player is playing this game.
 *
 * @param  {Player}  player
 * 		The player which is to be checked.
 *
 * @return {Boolean}
 *		True if the player is playing this game and false otherwise.
 */
Game.prototype.hasPlayer = function (player) {
	if (!player) { return false; }

	return !!_.find(this._players, function (p) {
		if (!p) { return false; }
		return p.id === player.id;
	});
};


/**
 * Gets the key of this game, used to authenticate players.
 *
 * @return {string}
 */
Game.prototype.getKey = function () {
	return this._key;
};


/**
 * Gets whether the specified key matches the key of the game.
 *
 * @param  {string} key
 *		The key which is to be checked.
 *
 * @return {Boolean}
 * 		True if the keys match and false otherwise.
 */
Game.prototype.checkKey = function (key) {
	return this._key === key;
};

//------------------------------------------------------------------------------

module.exports = Game;