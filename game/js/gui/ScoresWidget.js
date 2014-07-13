define([
	'js/gui/ScoreWidget'
], function (
	ScoreWidget
) {
	/**
	 * Initializes the scores widget.
	 *
	 * @param {Game} game
	 *		The game whose scores are to be displayed in the widget.
	 */
	function ScoresWidget(game) {
		this.game = game;
		this._widgets = [];

		this._createElement();

		this.game.playerAdded.add(this._onPlayerAdded, this);
		this.game.playerRemoved.add(this._onPlayerRemoved, this);
	}


	/**
	 * Destroys the widget.
	 */
	ScoresWidget.prototype.destroy = function () {
		this.game.playerAdded.remove(this._onPlayerAdded);
		this.game.playerRemoved.remove(this._onPlayerRemoved);
		this._removeAllScoreWidgets();
	};


	/**
	 * Creates the DOM element of the widget.
	 */
	ScoresWidget.prototype._createElement = function () {
		this.element = document.createElement('div');
		this.element.classList.add('scores');
	};


	/**
	 * Gets the score widget that displays the socre of the specified player.
	 *
	 * @param  {Player} player
	 *		The player whose score widget is to be returned.
	 *
	 * @return {ScoreWidget}
	 * 		The score widget for the specified player or null if none exists.
	 */
	ScoresWidget.prototype._getScoreWidget = function (player) {
		for (var i = 0; i < this._widgets.length; ++i) {
			var widget = this._widgets[i];
			if (widget.player === player) { return widget; }
		}

		return null;
	};


	/**
	 * Removes and destroys all the score widgets from this widget.
	 */
	ScoresWidget._removeAllScoreWidgets = function () {
		for (var i = 0; i < this._widgets.length; ++i) {
			this._removeScoreWidget(this._widgets[i]);
		}

		this._widgets = [];
	};


	/**
	 * Removes and destroys a single score widget from this widget.
	 *
	 * @param  {SocreWidget} widget
	 *		The score widget which is to be destroyed.
	 */
	ScoresWidget.prototype._removeScoreWidget = function (widget) {
		widget.destroy();
		this.element.removeChild(widget.element);
	};


	/**
	 * Called when a new player is added to the game. In that case, we have to
	 * create a new score widget to display their score.
	 *
	 * @param  {Player} player
	 *		The player which was added to the game.
	 */
	ScoresWidget.prototype._onPlayerAdded = function (player) {
		if (this._getScoreWidget(player)) { return; }

		var widget = new ScoreWidget(player);
		this._widgets.push(widget);
		this.element.appendChild(widget.element);
	};


	/**
	 * Called when a new player is removed from the game. In that case, we have
	 * to remove the widget that displays their score.
	 *
	 * @param  {Player} player
	 *		The player which was removed from the game.
	 */
	ScoresWidget.prototype._onPlayerRemoved = function (player) {
		var widget = this._getScoreWidget(player);
		if (widget) {
			this._removeScoreWidget(widget);
			this._widgets.splice(this._widgets.indexOf(widget), 1);
		}
	};


	return ScoresWidget;
});