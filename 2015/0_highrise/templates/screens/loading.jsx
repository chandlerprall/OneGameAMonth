define(
	[
		'src/Game',
		'src/AssetLoader',
		'src/Events',
		'src/MaterialBuilder',
		'src/GameOptions',
		'templates/components/progress_bar'
	],
	function( Game, AssetLoader, Events, MaterialBuilder, GameOptions, ProgressBar ) {
		return React.createClass({
			getInitialState: function() {
				return {
					progress_percent: 0,
					loading_message: ''
				}
			},

			componentDidMount: function() {
				// Start loading things
				var game = new Game();
				this.loadAssets( game );
			},

			updateProgress: function( loader ) {
				this.setState({
					progress_percent: loader.loaded_assets / loader.total_assets * 100
				});
			},

			imageLoaded: function( game, loader, image, name ) {
				game.assets.images[name] = image;
				this.updateProgress( loader );
			},

			soundLoaded: function( game, loader, sound, name ) {
				game.assets.sounds[name] = sound;
				this.updateProgress( loader );
			},

			loadAssets: function( game ) {
				var loader = new AssetLoader(
					function() {
						this.createMaterials( game );
						Events.emit( 'app.startgame', game );
					}.bind( this )
				);

				this.loadImages( game, loader );
				this.loadModels( game, loader );
				this.loadSounds( game, loader );
			},

			createMaterials: function( game ) {
				var graphics_quality = GameOptions.graphics_quality,
					anisotropy = graphics_quality == 2 ? 8 : ( graphics_quality == 1 ? 2 : 1 );

				game.assets.materials.bounds = MaterialBuilder.createBasic({
					color: 0x8888ff,
					opacity: 0.4,
					transparent: true
				});

				game.assets.materials.ground = MaterialBuilder.createPhong({
					map: MaterialBuilder.createTexture( game.assets.images.ground_diffuse )
						.anisotropy( anisotropy )
						.repeat( 5, 5 )
						.create(),
					normalMap: graphics_quality < 1 ? null :
						MaterialBuilder.createTexture( game.assets.images.ground_normal )
							.anisotropy( anisotropy )
							.repeat( 5, 5 )
							.create()
				});

				game.assets.materials.rock = MaterialBuilder.createPhong({
					map: MaterialBuilder.createTexture( game.assets.images.rock_diffuse )
						.anisotropy( anisotropy )
						.create(),
					normalMap: graphics_quality < 1 ? null :
						MaterialBuilder.createTexture( game.assets.images.rock_normal )
							.anisotropy( anisotropy )
							.create(),
					specularMap: graphics_quality < 2 ? null :
						MaterialBuilder.createTexture( game.assets.images.rock_specular )
							.anisotropy( anisotropy )
							.create(),
					bumpMap: graphics_quality < 2 ? null :
						MaterialBuilder.createTexture( game.assets.images.rock_height )
							.anisotropy( anisotropy )
							.create()
				});
				game.assets.materials.rock.normalScale.set( 2, 2 );
				game.assets.materials.rock.bumpScale = 8;

				game.assets.materials.metal = MaterialBuilder.createPhong({
					map: MaterialBuilder.createTexture( game.assets.images.metal_diffuse )
						.anisotropy( anisotropy )
						.create(),
					normalMap: graphics_quality < 1 ? null :
						MaterialBuilder.createTexture( game.assets.images.metal_normal )
							.anisotropy( anisotropy )
							.create(),
					specularMap: graphics_quality < 2 ? null :
						MaterialBuilder.createTexture( game.assets.images.metal_specular )
							.anisotropy( anisotropy )
							.create()
				});
				game.assets.materials.metal.normalScale.set( 2, 2 );
			},

			loadImages: function( game, loader ) {
				loader.loadImage( 'ground_diffuse', 'data/images/textures/ground/diffuse.jpg', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'ground_normal', 'data/images/textures/ground/normal.png', this.imageLoaded.bind( this, game, loader ) );

				loader.loadImage( 'metal_diffuse', 'data/images/textures/metal/diffuse.jpg', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'metal_normal', 'data/images/textures/metal/normal.png', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'metal_specular', 'data/images/textures/metal/specular.png', this.imageLoaded.bind( this, game, loader ) );

				loader.loadImage( 'rock_diffuse', 'data/images/textures/rock/diffuse.jpg', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'rock_normal', 'data/images/textures/rock/normal.png', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'rock_specular', 'data/images/textures/rock/specular.png', this.imageLoaded.bind( this, game, loader ) );
				loader.loadImage( 'rock_height', 'data/images/textures/rock/height.png', this.imageLoaded.bind( this, game, loader ) );
			},

			loadModels: function( game, loader ) {

			},

			loadSounds: function( game, loader ) {

			},

			render: function() {
				return (
					<section id="loading-screen">
						<div className="centered">
							<h1>Loading</h1>
							<ProgressBar progress={this.state.progress_percent}/>
							<p>{this.state.loading_message}</p>
						</div>
					</section>
				);
			}
		});
	}
);