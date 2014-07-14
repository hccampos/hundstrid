define([
], function (
) {
	/**
	 * Initializes the score widget.
	 *
	 * @param {Player} player
	 *		The player whose score is to be displayed in the widget.
	 */
	function ScoreWidget(player) {
		this.player = player;

		this._createElement();

		this._setName();
		this._setScore();

		this.player.scoreChanged.add(this._onScoreChanged, this);
	}


	/**
	 * Destroys the widget.
	 */
	ScoreWidget.prototype.destroy = function () {
		this.player.scoreChanged.remove(this._onScoreChanged);
	};


	/**
	 * Creates the DOM element of the widget.
	 */
	ScoreWidget.prototype._createElement = function () {
		var element = document.createElement('div');
		element.classList.add('score');

		var nameElement = document.createElement('label');
		element.appendChild(nameElement);

		var scoreElement = document.createElement('div');
		element.appendChild(scoreElement);

		this.element = element;
		this.nameElement = nameElement;
		this.scoreElement = scoreElement;
	};


	/**
	 * Sets the name of the player in the widget.
	 */
	ScoreWidget.prototype._setName = function () {
		var player = this.player;
		this.nameElement.innerHTML = player.name || '-';
		this.nameElement.style.background = processColor(player.color, 0.35);
	};


	/**
	 * Sets the score of the player in the widget.
	 */
	ScoreWidget.prototype._setScore = function () {
		var player = this.player;
		this.scoreElement.innerHTML = player.score.toFixed(0);
		this.scoreElement.style.background = processColor(player.color, 0.4);
	};


	/**
	 * Called when the score of the player changes so we can update the widget
	 * with the new values.
	 *
	 * @param  {number} score
	 *		The new score of the player.
	 */
	ScoreWidget.prototype._onScoreChanged = function (score) {
		this._setScore();
	};


	function processColor(c, alpha) {
		var r = Math.round(c[0] * 255);
		var g = Math.round(c[1] * 255);
		var b = Math.round(c[2] * 255);
		return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
	}


	return ScoreWidget;
});