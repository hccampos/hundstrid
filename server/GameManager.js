_ = require('lodash');

/**
 * Creates a new game manager.
 */
function GameManager() {
	this._games = [];
}


/**
 * Adds the specified game to the manager.
 *
 * @param {Game} game
 *        The game which is to be added to the manager.
 */
GameManager.prototype.addGame = function (game) {
	this._games.push(game);
};


/**
 * Removes the specified game from the manager.
 *
 * @param  {Game} game
 *         The game which is to be removed from the manager.
 */
GameManager.prototype.removeGame = function (game) {
	var index = this._games.indexOf(game);
	if (index > -1) { this._games.splice(index, 1); }
};


/**
 * Removes the specified game from the manager, by id.
 *
 * @param  {string} id
 *         The identifier of the game which is to be removed from the manager.
 */
GameManager.prototype.removeGameById = function (id) {
	var game = this.getGameById(id);
	this.removeGame(game);
};


/**
 * Gets the specified game, by id.
 *
 * @param  {string} id
 *         The identifier of the game which is to be returned.
 *
 * @return {[type]}
 *         The game which has the specified id.
 */
GameManager.prototype.getGameById = function (id) {
	return _.find(this._games, function (g) { return g.id === id });
};

//------------------------------------------------------------------------------

module.exports = GameManager;