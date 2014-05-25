var uuid = require('node-uuid');

/**
 * Creates a new player.
 *
 * @param {socket} socket
 * 		Socket used to communicate with the player.
 */
function Player(socket) {
	this.id = uuid.v4();
	this._socket = socket;
	this._game = null;
};


/**
 * Sets the game to which the player belongs.
 *
 * @param {Game} game
 *        The game to which the player belongs.
 */
Player.prototype.setGame = function (game) {
	this._game = game;
};


/**
 * Gets the game to which the player belongs.
 *
 * @return {Game}
 */
Player.prototype.getGame = function (game) {
	return this._game;
};


/**
 * Removes the player from the game.
 */
Player.prototype.removeFromGame = function () {
	if (this._game) {
		this._game.removePlayer(this);
	}
};

//------------------------------------------------------------------------------

module.exports = Player;