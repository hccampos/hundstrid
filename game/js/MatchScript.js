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
				var bulletsCollidingWithPlayer = bulletManager.getCollidingBullets(predicate);

				if (bulletsCollidingWithPlayer.length > 0) {
					var killed = player.applyHits(bulletsCollidingWithPlayer);
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

			var bulletsCollidingWithPlanet = bulletManager.getCollidingBullets(function (bullet) {
				var bulletPos = bullet.getTranslation();
				return planetPosition.distance(bulletPos) <= 60;
			});

			for (b = 0; b < bulletsCollidingWithPlanet.length; ++b) {
				var bullet = bulletsCollidingWithPlanet[b];
				bullet.kill();
			}
		}
	};


	return MatchScript;
});