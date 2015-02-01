define(
	[
		'src/Events',
		'src/GameOptions',
		'src/WebAudio',
		'src/PhysicsScene'
	],
	function( Events, GameOptions, WebAudio, PhysicsScene ) {
		var Game = function() {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			if ( GameOptions.getShadowMapSize() > 0 ) {
				this.renderer.shadowMapEnabled = true;
			}

			this.world = null;

			this.camera_fov = 50;
			this.camera = new THREE.PerspectiveCamera( this.camera_fov, 640 / 480, 1, 150 );
			this.camera.position.set( 0, 4, 25 );

			this.fog_color = 0xe2e2e2;
			this.renderer.setClearColor( this.fog_color );

			this.assets = {
				images: {},
				sounds: {},
				models: {},
				materials: {}
			};

			this.left_bound = null;
			this.right_bound = null;
			this.active_block = null;
			this.max_height = 0;
			this.current_height = 0;
			this.next_block_at = Infinity;
			this.time_remaining = 60 * 60 * 1; // 60 ticks * 60fps * 1 = 1 minute
			this.exclude_last_block_from_height = false;

			this.animation_frame = null;

			this.onWindowResize = this.onWindowResize.bind( this );
			this.render = this.render.bind( this );
		};

		Game.prototype = {
			setupLights: function() {
				var ambient = new THREE.AmbientLight( 0x444444 );
				this.world.addObject( ambient );

				this.sunlight = new THREE.DirectionalLight( 0xffffff );
				this.sunlight.position.set( 10, 15, 10 );
				this.sunlight.castShadow = true;
				this.sunlight.shadowBias = -0.008;
				this.sunlight.shadowMapWidth = this.sunlight.shadowMapHeight = GameOptions.getShadowMapSize();
				this.sunlight.shadowCameraNear = 1;
				this.sunlight.shadowCameraFar = 50;
				this.sunlight.shadowDarkness = 0.7;
				this.sunlight.shadowCameraLeft = -50;
				this.sunlight.shadowCameraTop = -50;
				this.sunlight.shadowCameraRight = 50;
				this.sunlight.shadowCameraBottom = 50;
				this.world.addObject( this.sunlight );
			},

			setupWorld: function() {
				this.world = new PhysicsScene();
				this.world.world.gravity.set( 0, -12, 0 );
				this.world.scene.fog = new THREE.Fog( this.fog_color, 25, 80 );
				this.world.world.solver.relaxation = 0.5;

				this.renderer.domElement.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );
				this.renderer.domElement.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
				this.renderer.domElement.addEventListener( 'contextmenu', this.onContextMenu.bind( this ) );

				this.setupLights();

				var ground = this.world.createPlane( 200, 200, this.assets.materials.ground, Infinity );
				ground.body.restitution = 0;
				ground.body.rotation.x = -1;
				ground.body.rotation.normalize();
				ground.body.updateDerived();

				var bounds_geometry = new THREE.PlaneBufferGeometry( 15, 100 );
				this.left_bound = new THREE.Mesh( bounds_geometry, this.assets.materials.bounds );
				this.right_bound = new THREE.Mesh( bounds_geometry, this.assets.materials.bounds );
				this.left_bound.position.x = -40;
				this.right_bound.position.x = 40;
				this.left_bound.quaternion.set( 0, 1, 0, 1 ).normalize();
				this.right_bound.quaternion.set( 0, -1, 0, 1 ).normalize();
				this.world.scene.add( this.left_bound );
				this.world.scene.add( this.right_bound );

				this.world.world.addListener( 'stepStart', this.onTick.bind( this ) );

				this.createBlock();
			},

			destroyWorld: function() {
				this.world = null;
			},

			createBlock: function() {
				var block_type = Math.floor( Math.random() * 2 );

				if ( block_type === 0 ) {
					this.active_block = this.world.createBox( 2.5, 6, 2.5, this.assets.materials.rock, 0 );
					this.active_block.mass = 50;
				} else if ( block_type === 1 ) {
					this.active_block = this.world.createBox( 3, 3, 2.5, this.assets.materials.metal, 0 );
					this.active_block.mass = 20;
				}

				this.active_block.body.position.y = this.current_height + this.active_block.body.shape.aabb.max.y + 1;
				this.active_block.body.friction = 20;
				this.active_block.body.restitution = 0;

				this.exclude_last_block_from_height = true;

				var game = this,
					contactListener = function() {
						game.next_block_at = game.world.world.ticks + 15; // 15 ticks from now
						game.exclude_last_block_from_height = false;
						this.removeListener( 'newContact', contactListener );
					};

				this.active_block.body.addListener( 'newContact', contactListener );
			},

			onMouseUp: function( event ) {
				if ( this.active_block == null ) {
					return;
				}

				if ( event.which === 1 ) {
					this.active_block.body.mass = this.active_block.mass;
					this.active_block = null;
				} else if ( event.which === 3 ) {
					var rotation = new Goblin.Quaternion( 0, 0, 1, 1 );
					rotation.normalize();
					this.active_block.body.rotation.multiply( rotation );
				}
			},

			onMouseMove: function( event ) {
				if ( this.active_block != null ) {
					var ray = new THREE.Vector3(
						( event.clientX / window.innerWidth ) * 2 - 1,
						-( event.clientY / window.innerHeight ) * 2 + 1,
						-0.5 ).unproject( this.camera ).sub( this.camera.position ).normalize();
					ray.multiplyScalar( -this.camera.position.z / ray.z );

					ray.x = Math.min( this.right_bound.position.x + this.active_block.body.shape.aabb.min.x, Math.max( this.left_bound.position.x + this.active_block.body.shape.aabb.max.x, ray.x ) );

					this.active_block.body.position.x = ray.x;
				}
			},

			onContextMenu: function( event ) {
				event.preventDefault();
			},

			onTick: function( tick ) {
				this.time_remaining -= 1;

				WebAudio.context.listener.setPosition( this.camera.position.x, this.camera.position.y, this.camera.position.z );
				var forward = new THREE.Vector3( 0, 0, -1 ),
					up = new THREE.Vector3( 0, 1, 0 );
				forward.applyQuaternion( this.camera.quaternion );
				up.applyQuaternion( this.camera.quaternion );
				WebAudio.context.listener.setOrientation( forward.x, forward.y, forward.z, up.x, up.y, up.z );

				if ( this.next_block_at === tick ) {
					this.createBlock();
				}

				this.current_height = 0;
				for ( var i = 0; i < this.world.world.rigid_bodies.length; i++ ) {
					var body = this.world.world.rigid_bodies[i];
					if ( this.exclude_last_block_from_height && i === this.world.world.rigid_bodies.length - 1 ) {
						continue;
					}
					if ( this.active_block != null && this.active_block.body === body ) {
						continue;
					}
					this.max_height = Math.max( this.max_height, body.aabb.max.y );
					this.current_height = Math.max( this.current_height, body.aabb.max.y );
				}
				Events.emit(
					'game.hud_values',
					{
						max_height: this.max_height,
						current_height: this.current_height,
						time_remaining: this.time_remaining
					}
				);

				var camera_height = Math.max( 4, this.current_height ),
					camera_difference = ( camera_height - this.camera.position.y ) * 0.1;
				if ( camera_difference > 0.5 ) {
					camera_difference *= 0.5;
				}
				this.camera.position.y += camera_difference;
				this.left_bound.position.y = this.right_bound.position.y = this.camera.position.y;
				if ( this.active_block != null ) {
					this.active_block.body.position.y = this.current_height + this.active_block.body.shape.aabb.max.y + 1;
				}
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
				if ( this.time_remaining > 0 ) {
					this.animation_frame = requestAnimationFrame( this.render );
					this.world.step( 1 / 60 );
					this.renderer.render( this.world.scene, this.camera );
				} else {
					Events.emit( 'game.over' );
				}
			}
		};

		return Game;
	}
);