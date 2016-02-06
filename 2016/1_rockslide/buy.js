var Buy = function() {
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor( new THREE.Color( 0xffffff ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();

	var camera = new THREE.OrthographicCamera( -50, 50, 25, -25, 1, 100 );
	camera.position.set( 0, 0, 50 );
	camera.lookAt( scene.position );

	var title_text = getTextMesh( 'buy things', 50, 0.1 );
	title_text.position.set( 0, 14, 0 );
	scene.add( title_text );

	var updateDollarText = (function() {
		var dollar_text;
		return function updateDollarText() {
			if ( dollar_text ) {
				scene.remove( dollar_text );
			}
			dollar_text = getTextMesh( '$' + dollars, 45, 0.07 );
			dollar_text.position.set( 0, 10, 0 );
			scene.add( dollar_text );
		}
	})();
	updateDollarText();

	var num_trees = 0;
	var tree_cost = 10;
	var updateTreesText = (function() {
		var tree_text;
		return function updateTreesText() {
			if ( tree_text ) {
				scene.remove( tree_text );
			}
			tree_text = getTextMesh( 'trees: ' + num_trees, 45, 0.07 );
			tree_text.position.set( 0, 6, 0 );
			scene.add( tree_text );
		}
	})();
	var trees_box = {
		tl: {
			x: 0.45,
			y: 0.35
		},
		br: {
			x: 0.55,
			y: 0.41
		}
	};
	updateTreesText();

	var num_fences = 0;
	var fence_cost = 30;
	var updateFenceText = (function() {
		var fence_text;
		return function updateFenceText() {
			if ( fence_text ) {
				scene.remove( fence_text );
			}
			fence_text = getTextMesh( 'fences: ' + num_fences, 45, 0.07 );
			fence_text.position.set( 0, 2, 0 );
			scene.add( fence_text );
		}
	})();
	var fences_box = {
		tl: {
			x: 0.44,
			y: 0.43
		},
		br: {
			x: 0.55,
			y: 0.49
		}
	};
	updateFenceText();

	var start_text = getTextMesh( 'start game', 50, 0.1 );
	start_text.position.set( 0, -14, 0 );
	scene.add( start_text );
	var start_text_box = {
		tl: {
			x: 0.41,
			y: 0.73
		},
		br: {
			x: 0.6,
			y: 0.84
		}
	};

	function isPointInBox( point, box ) {
		if ( point.x < box.tl.x || point.x > box.br.x ) {
			return false;
		}

		if ( point.y < box.tl.y || point.y > box.br.y ) {
			return false;
		}

		return true;
	}

	function handleClick( e ) {
		var point;

		if ( e.changedTouches ) {
			point = {
				x: e.changedTouches[0].clientX,
				y: e.changedTouches[0].clientY
			};
		} else {
			point = {
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight
			};
		}

		if ( isPointInBox( point, start_text_box ) ) {
			startGame();
		}

		if ( isPointInBox( point, trees_box ) ) {
			if ( dollars >= tree_cost ) {
				num_trees++;
				dollars -= tree_cost;
				updateTreesText();
				updateDollarText();
			}
		}

		if ( isPointInBox( point, fences_box ) ) {
			if ( dollars >= fence_cost ) {
				num_fences++;
				dollars -= fence_cost;
				updateFenceText();
				updateDollarText();
			}
		}
	}

	renderer.domElement.addEventListener( 'click', handleClick );
	renderer.domElement.addEventListener( 'touch', handleClick );

	var is_game_started = false;
	function render() {
		if ( is_game_started ) return;

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}
	render();

	function startGame() {
		is_game_started = false;
		document.body.removeChild( renderer.domElement );
		Game({
			trees: num_trees,
			fences: num_fences
		});
	}
};