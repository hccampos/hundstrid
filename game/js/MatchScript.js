define([
], function (
) {
	function MatchScript(game) {
		this.game = game;
	}


	MatchScript.prototype.run = function (entity, tpf, env) {
		var players = this.game.playersArray;
		var numPlayers = players.length;
		var planetPosition = this.game.planet.getTranslation();

		for (var i = 0; i < numPlayers; ++i) {
			var shootingPlayer = players[i];
			var bulletManager = shootingPlayer.bulletManager;

			for (var j = 0; j < numPlayers; ++j) {
				var player = players[j];

				// A player cannot shoot himself.
				if (player === shootingPlayer) {
					continue;
				}

				var predicate = player.isCollision.bind(player);
				var collidingBullets = bulletManager.getCollidingBullets(predicate);

				if (collidingBullets.length > 0) {
					var killed = player.applyHits(collidingBullets);
					if (killed) {
						shootingPlayer.scoreKill();
					}
				}

				var bothAlive = shootingPlayer.isAlive() && player.isAlive();
				if (i !== j && shootingPlayer.isEnemyCollision(player) && bothAlive) {
					shootingPlayer.kill();
					player.kill();
				}
			}

			var position = shootingPlayer.ship.getTranslation();
			if (shootingPlayer.isAlive() && position.distance(planetPosition) <= 55) {
				shootingPlayer.kill();
			}
		}
	};


	return MatchScript;
});