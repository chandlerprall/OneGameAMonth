var Menu = function() {
	var texture_loader = new THREE.TextureLoader();

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor( new THREE.Color( 0xffffff ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();

	var camera = new THREE.OrthographicCamera( -50, 50, 25, -25, 1, 100 );
	camera.position.set( 0, 0, 50 );
	camera.lookAt( scene.position );

	var sprite_rockslide = new THREE.Sprite(new THREE.SpriteMaterial({
		map: texture_loader.load('images/rockslide.png')
	}));
	sprite_rockslide.scale.set( 40, 20, 1 );
	scene.add( sprite_rockslide );

	var start_text = getTextMesh('click to start', 50, 0.1);
	start_text.position.set( 0, -8, 0 );
	scene.add( start_text );

	function startGame() {
		closeMenu();
	}

	renderer.domElement.addEventListener( 'click', startGame );
	renderer.domElement.addEventListener( 'touch', startGame );

	var is_game_started = false;
	function render() {
		if ( is_game_started ) return;

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}
	render();

	function closeMenu() {
		is_game_started = false;
		document.body.removeChild( renderer.domElement );
		Game();
	}
};