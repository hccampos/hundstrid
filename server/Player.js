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
 * Removes the player from the game.
 */
Player.prototype.removeFromGame = function () {
	if (this._game) {
		this._game.removePlayer(this);
	}
};

//------------------------------------------------------------------------------

module.exports = Player;