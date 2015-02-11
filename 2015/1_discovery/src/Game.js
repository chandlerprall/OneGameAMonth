define(
	[
		'src/Events',
		'src/GameOptions',
		'src/WebAudio',
		'src/GameMap'
	],
	function( Events, GameOptions, WebAudio, GameMap ) {
		var Game = function() {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.renderer.setClearColor( 0xFFFFFF );
			if ( GameOptions.getShadowMapSize() > 0 ) {
				this.renderer.shadowMapEnabled = true;
			}

			this.scene = null;
			this.map = null;

			this.camera_fov = 50;
			this.camera = new THREE.PerspectiveCamera( this.camera_fov, window.innerWidth / window.innerHeight, 1, 150 );
			//this.camera = new THREE.OrthographicCamera( -50, 50, -50, 50, 1, 150 );
			this.camera.position.set( 0, 15, 5 );
			this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
			this.camera.position.set( 10, 15, 10 );

			this.assets = {
				images: {},
				sounds: {},
				models: {},
				materials: {}
			};

			this.animation_frame = null;

			this.onWindowResize = this.onWindowResize.bind( this );
			this.render = this.render.bind( this );
		};

		Game.prototype = {

			setupWorld: function() {
				this.scene = new THREE.Scene();

				this.map = new GameMap( 6, 15 );
				this.scene.add( this.map.renderable );
			},

			destroyWorld: function() {
				this.scene = null;
			},

			bind: function() {
				window.addEventListener( 'resize', this.onWindowResize );

				this.setupWorld();

				this.animation_frame = requestAnimationFrame( this.render );

				this.onWindowResize();
			},

			unbind: function() {
				window.removeEventListener( 'resize', this.onWindowResize );
				this.destroyWorld();
				cancelAnimationFrame( this.animation_frame );
			},

			onWindowResize: function() {
				this.camera.aspect = window.innerWidth / window.innerHeight;

				// adjust the FOV
				this.camera.fov = ( 360 / Math.PI ) * Math.atan( Math.tan( ( ( Math.PI / 180 ) * this.camera_fov / 2 ) ) * ( window.innerHeight / 640 ) );
				this.camera.updateProjectionMatrix();

				this.renderer.setSize( window.innerWidth, window.innerHeight );
			},

			render: function() {
				this.animation_frame = requestAnimationFrame( this.render );
				this.renderer.render( this.scene, this.camera );
			}
		};

		return Game;
	}
);