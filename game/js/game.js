require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',

	'goo/animationpack/layer/AnimationLayer',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ManagedTransformSource',
	'goo/animationpack/layer/LayerLERPBlender',

	'goo/entities/components/ScriptComponent',

	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Matrix3x3',

	'js/LookAtScript',

	'socket.io/socket.io'
], function (
	GooRunner,
	DynamicLoader,

	AnimationLayer,
	SteadyState,
	ManagedTransformSource,
	LayerLERPBlender,

	ScriptComponent,

	Vector3,
	Quaternion,
	Matrix3x3,

	LookAtScript,

	io
) {
	"use strict";

	var KEY_LEFT = 37;
	var KEY_RIGHT = 39;
	var KEY_UP = 38;
	var KEY_DOWN = 40;
	var KEY_ENTER = 13;
	var KEY_SPACE = 32;

	var goo;
	var lookAtScript;

	var $qrCode = $('#qr-code');
	var $ball = $('#ball');
	var host = "http://" + window.location.host;

	var qrCode = new QRCode($qrCode[0]);

	initSockets();
	initEngine();

	//------------------------------------------------------------------------//

	/**
	 * Setups all the socket connections and callbacks.
	 */
	function initSockets() {
		var socket = io.connect(host);
		socket.on('command', onCommand);
		socket.on('playerAdded', onPlayerAdded);
		socket.on('playerRemoved', onPlayerRemoved);
		socket.emit('registerGame', null, onRegistered);
	}


	/**
	 * Called when the game receives a command from a player.
	 *
	 * @param  {*} data
	 *         The data received from the server.
	 */
	function onCommand(data) {
		if (data && data.type) {
			/*switch (data.type) {
				case 'lookAt':
					lookAtScript.lookAt(data.x, data.y);
					break;
			}*/
		}
	}


	function onPlayerAdded(data) {
		console.log('Player was added: ' + data.playerId);
	}


	function onPlayerRemoved(data) {
		console.log('Player was removed: ' + data.playerId);
	}


	/**
	 * Called when the game has been registered with the server.
	 *
	 * @param  {*} data
	 *         The data received from the server and which should contain the
	 *         game id and the game key.
	 */
	function onRegistered(data) {
		if (data && data.id && data.key) {
			makeCode(data.id, data.key);
		}
	}


	/**
	 * Initializes the engine and the game.
	 */
	function initEngine() {
		goo = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: false,
			logo: true
		});

		var gooCanvas = goo.renderer.domElement;
		gooCanvas.style.width = '100%';
		gooCanvas.style.height = '100%';
		document.body.appendChild(gooCanvas);

		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'assets'
		});

		var loaderOpts = { recursive: false, preloadBinaries: true };
		loader.loadFromBundle('project.project', 'root.bundle', loaderOpts)
		.then(function (configs) {


			setupAnimationControl(goon, clip);
			setupSwitchIdle(goon);
		});
	}


	function setupAnimationControl(entity, clip) {
		var joints = [
			{
				name: 'BackA_M',
				x: 0.2,
				y: 0.4
			},
			{
				name: 'BackB_M',
				x: 0.3,
				y: 0.05
			},
			{
				name: 'Chest_M',
				x: 0.3,
				y: 0.05
			},
			{
				name: 'Neck_M',
				x: 0.2,
				y: 0.5
			}
		];

		var jointNames = joints.map(function(joint) { return joint.name; });

		var clipSource = addManagedLayer(entity, clip, jointNames);

		lookAtScript = new LookAtScript({
			clipSource: clipSource,
			joints: joints,
			origo: [0, 0.4, 0]
		});

		entity.setComponent(new ScriptComponent([lookAtScript]));
	}


	function addManagedLayer(entity, clip, jointNames) {
		var clipSource = new ManagedTransformSource('Managed Clipsource');
		clipSource.initFromClip(clip, 'Include', jointNames);

		var state = new SteadyState('Managed State');
		state.setClipSource(clipSource);

		var layer = new AnimationLayer('Managed Layer');
		layer.setState('managed', state);
		layer.setCurrentStateByName('managed');
		entity.animationComponent.addLayer(layer);

		return clipSource;
	}


	function setupSwitchIdle(entity) {
		var timer = function () {
			var rand = Math.random();
			var script = entity.scriptComponent.scripts[0];
			var animComponent = entity.animationComponent;

			if (rand > 0.7 && !script.focus) {
				transitionToAndBack(entity, 'idle_a', 'idle_b');
			} else if (rand > 0.4 &&  !script.focus) {
				transitionToAndBack(entity, 'idle_a', 'idle_c');
			} else if (rand > 0.1 && !script.focus) {
				transitionToAndBack(entity, 'idle_a', 'Take_001');
			}

			setTimeout(timer, 4000);
		};

		timer();
	}


	/**
	 * Transitions to the toState and then back to the fromState after 1.5
	 * seconds.
	 *
	 * @param  {Entity} entity
	 *         The entity which is to be animated.
	 * @param  {string} fromState
	 *         The name of the state from which to transition.
	 * @param  {string} toState
	 *         The name of the state to which to transition.
	 */
	function transitionToAndBack(entity, fromState, toState) {
		entity.animationComponent.transitionTo(toState);
		setTimeout(function () {
			entity.animationComponent.transitionTo(fromState);
		}, 1500);
	}


	/**
	 * Generates a new QR code through which players can join the game.
	 *
	 * @param  {string} id
	 *         The identifier of the game.
	 * @param  {string} key
	 *         The key used to authenticate players.
	 */
	function makeCode(id, key) {
		var baseUrl = host + '/controller'
		var encodedId = encodeURIComponent(id);
		var encodedKey = encodeURIComponent(key);

		var url = baseUrl + '?gameId=' + encodedId + '&key=' + encodedKey

		qrCode.makeCode(url);

		$qrCode.attr('href', url);
	}
});