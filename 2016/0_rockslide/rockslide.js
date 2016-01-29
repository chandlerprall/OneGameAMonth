var Game = function() {
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor( new THREE.Color( 0xffffff ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	document.body.appendChild( renderer.domElement );

	var GROUP_ROCK = 2;

	var scene = new physijs.Scene( 'lib/physijs-worker.min.js' );
	var camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( 40, 20, 0 );
	camera.lookAt( new THREE.Vector3( 0, 5, 0 ) );

	// initial render to calibrate camera for raycaster
	renderer.render(scene, camera);

	var raycaster = new THREE.Raycaster();

	// light
	var ambient = new THREE.AmbientLight( 0x444444 );
	scene.add( ambient );

	var sunlight = new THREE.DirectionalLight( 0x888888 );
	sunlight.position.set( 0, 50, 0 );
	sunlight.castShadow = true;
	sunlight.shadow.bias = -0.01;
	sunlight.shadow.mapSize.set( 1024, 1024 );
	sunlight.shadow.camera.left = sunlight.shadow.camera.top = -50;
	sunlight.shadow.camera.right = sunlight.shadow.camera.bottom = 50;
	sunlight.shadow.camera.near = 1;
	sunlight.shadow.camera.far = 100;
	scene.add( sunlight );

	var ground_geometry = new THREE.BoxGeometry( 50, 50, 0.1, 10, 10, 1 );
	ground_geometry.vertices.forEach(function(vertex) {
		if ( vertex.z > 0 && vertex.x < -10 ) {
			vertex.z = Math.max( 0, -vertex.x ) / 3;
		}
	});
	ground_geometry.computeVertexNormals();
	ground_geometry.computeFaceNormals();
	var ground = new physijs.TriangleMesh(
		ground_geometry,
		new THREE.MeshPhongMaterial({ color: 0x55ee33, shading: THREE.FlatShading })
	);
	ground.quaternion.set( -1, 0, 0, 1 ).normalize();
	ground.receiveShadow = true;
	scene.add( ground );

	var house = new physijs.Box(
		new THREE.BoxGeometry( 5, 5, 5 ),
		new THREE.MeshPhongMaterial({ color: 0xdd3355, shading: THREE.FlatShading })
	);
	house.health = 100;
	house.position.set( 17, 2.5, 0 );
	house.castShadow = house.receiveShadow = true;
	house.addEventListener(
		'physics.newContact',
		function( details ) {
			if ( details.other_body.physics.collision_groups && GROUP_ROCK ) {
				house.health -= details.relative_linear_velocity.length();
				renderHealth();

				if ( house.health <= 0 ) {
					endGame();
					Menu();
				}
			}
		}
	);
	scene.add( house );

	raycaster.setFromCamera( { x: 0, y: -1.25 }, camera );
	var health_position = raycaster.ray.direction.clone();
	health_position.multiplyScalar( camera.position.x / health_position.x ).sub( camera.position );

	var health_text;
	function renderHealth() {
		if ( health_text ) {
			scene.remove( health_text );
		}
		health_text = getTextMesh('health: ' + Math.round(house.health), 50, 0.075);
		health_text.position.copy( health_position );
		health_text.lookAt( camera.position );
		scene.add( health_text );
	}
	renderHealth();

	// trees
	var tree_timetofade = 3000;
	function fadeTree( tree, details ) {
		if ( details.other_body.physics.collision_groups && GROUP_ROCK && !tree.is_fading ) {
			tree.is_fading = true;
			setTimeout( makeFader.bind( null, tree ), tree_timetofade );
		}
	}

	var tree_geometry = new THREE.BoxGeometry( 1, 4, 1 );
	var tree_material = new THREE.MeshLambertMaterial({ color: 0x33dd33, transparent: true, opacity: 1 });
	var tree_description = { mass: 0.2 };
	for ( var i = 0; i < 6; i++ ) {
		for ( var j = 0; j < 3; j++ ) {
			var tree = new physijs.Box( tree_geometry, tree_material, tree_description );
			tree.castShadow = tree.receiveShadow = true;
			tree.position.set( j * 4, 2, i * 2 - 6 );

			tree.addEventListener( 'physics.newContact', fadeTree.bind( null, tree ) );

			scene.add( tree );
		}
	}

	var rocks = [];
	var fading = [];
	var rock_geometry = new THREE.SphereGeometry( 2, 4, 4 );
	var rock_material = new THREE.MeshPhongMaterial({ color: 0x999999, transparent: true, opacity: 1, shading: THREE.FlatShading });
	var rock_description = { mass: 1, collision_groups: GROUP_ROCK };
	var rock_lifetime = 5000;
	var object_fadetime = 1000;
	function spawnRock() {
		var rock = new physijs.Convex( rock_geometry, rock_material, rock_description );
		rock.position.set( -20 + Math.random() * 3, 10, 0 );
		rock.physics.linear_velocity.set( 15, -20, 0 );
		rock.physics.angular_velocity.set( Math.random() * 3, Math.random() * 3, Math.random() * 3 );
		rock.castShadow = rock.receiveShadow = true;
		rock.time_alive = 0;
		scene.add( rock );
		rocks.push( rock );
	}

	function makeFader( object ) {
		scene.remove( object );

		object.physics = null;
		object.material = object.material.clone();
		scene.add( object );

		object.castShadow = false;
		object.fadetime = object_fadetime;
		fading.push( object );
	}

	var is_game_ended = false;
	var physics_framerate = 1000 / 60;
	function onStep(step_index) {
		if ( is_game_ended ) return;

		if ( step_index % 120 === 0 ) {
			spawnRock();
		}

		// update rock alive times
		rocks.forEach(function(rock, idx) {
			rock.time_alive += physics_framerate;

			if ( rock.time_alive > rock_lifetime ) {
				// remove from rocks array
				rocks.splice( idx, 1 );

				makeFader( rock );
			}
		});

		// update faders
		fading.forEach(function(fader, idx) {
			fader.fadetime -= physics_framerate;

			if ( fader.fadetime <= 0 ) {
				// remove from scene
				scene.remove( fader );

				// remove from fading array
				fading.splice( idx, 1 );
			} else {
				fader.material.opacity = fader.fadetime / object_fadetime;
			}
		});

		renderer.render( scene, camera );
		setTimeout( scene.step.bind( scene, physics_framerate / 1000, undefined, onStep ), physics_framerate );
	}
	spawnRock();
	scene.step( physics_framerate / 1000, undefined, onStep );

	var is_cutting = false;
	var cut_points = [];
	var cutter = new THREE.Mesh(
		new THREE.BoxGeometry( 6, 10, 40 ),
		new THREE.MeshLambertMaterial({ transparent: true, depthWrite: false, opacity: 0, color: 0x4444ff })
	);
	var cutter_orientation = new THREE.Vector3( 0, 0, 1 );
	cutter.geometry.vertices.forEach(function(vertex) {
		vertex.y += 5;
	});
	scene.add( cutter );

	renderer.domElement.addEventListener(
		'mousedown',
		function( e ) {
			is_cutting = true;
			cut_points.push( e.clientX, e.clientY );
		}
	);

	renderer.domElement.addEventListener(
		'touchstart',
		function( e ) {
			is_cutting = true;
			cut_points.push( e.changedTouches[0].clientX, e.changedTouches[0].clientY );
		}
	);

	renderer.domElement.addEventListener(
		'mousemove',
		function( e ) {
			if ( is_cutting === true ) {
				cut_points.push(e.clientX, e.clientY);
			}
		}
	);

	renderer.domElement.addEventListener(
		'touchmove',
		function( e ) {
			if ( is_cutting === true ) {
				cut_points.push(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			}
		}
	);

	function getRayFromCoords(x, y) {
		raycaster.setFromCamera(
			{
				x: ( x / renderer.domElement.clientWidth ) * 2 - 1,
				y: - ( y / renderer.domElement.clientHeight ) * 2 + 1
			},
			camera
		);
		return raycaster.ray.direction.clone().multiplyScalar( 100 ).add( camera.position );
	}

	function centerMeshGeometry( mesh ) {
		var offset = mesh.geometry.center();
		mesh.position.sub( offset );
	}

	function startCut() {
		var points = [];
		for (var i = 0; i < cut_points.length; i += 2) {
			points.push({
				start: camera.position,
				end: getRayFromCoords( cut_points[i], cut_points[i+1])
			});
		}

		scene.physics.raytrace(
			points,
			function(rays) {
				var closest_rock;
				var closest_distance = Infinity;
				var vec3 = new THREE.Vector3();

				rays.forEach(function(ray) {
					ray.forEach(function(intersection) {
						var body = intersection.body;
						if ( body.physics && body.physics.collision_groups && GROUP_ROCK ) {
							var rock_distance = vec3.copy( body.position ).sub( camera.position ).length();
							if ( rock_distance < closest_distance ) {
								closest_distance = rock_distance;
								closest_rock = body;
							}
						}
					});
				});

				if ( closest_rock ) {
					// project onto closest rock
					var start_point = getRayFromCoords( cut_points[0], cut_points[1] );
					var end_point = getRayFromCoords( cut_points[cut_points.length - 2], cut_points[cut_points.length - 1] );
					var transition = new THREE.Vector3().copy( end_point ).sub( start_point ).normalize();
					var cut_speed = transition.clone().multiplyScalar( 5 ).add( new THREE.Vector3( -3, 0, 0 ) );

					var cross = new THREE.Vector3().crossVectors( cutter_orientation, transition );
					cutter.quaternion.set(
						cross.x, cross.y, cross.z,
						1 + cutter_orientation.dot( transition )
					).normalize();

					cutter.position.copy( closest_rock.position );

					finishCut( closest_rock, cut_speed );
				}

				cut_points.length = 0;
			}
		)
	}

	function finishCut( rock, cut_speed ) {
		var cutter_bsp = new ThreeBSP( cutter );

		var rock_bsp = new ThreeBSP( rock );
		var side_a_bsp = rock_bsp.intersect( cutter_bsp );
		var side_b_bsp = rock_bsp.subtract( side_a_bsp );

		var side_a = side_a_bsp.toMesh( rock_material );
		var side_b = side_b_bsp.toMesh( rock_material );

		var has_a_side = false;

		if ( side_a.geometry.vertices.length > 0 ) {
			has_a_side = true;
			side_a = physijs.Convex( side_a, rock_description );
			side_a.physics.linear_velocity.copy( rock.physics.linear_velocity );
			side_a.physics.angular_velocity.copy( rock.physics.angular_velocity );
			centerMeshGeometry( side_a );
			side_a.castShadow = side_a.receiveShadow = true;
			side_a.time_alive = rock.time_alive;
			scene.add( side_a );
			rocks.push( side_a );
		}

		if ( side_b.geometry.vertices.length > 0 ) {
			has_a_side = true;
			side_b = physijs.Convex( side_b, rock_description );
			side_b.physics.linear_velocity.copy( rock.physics.linear_velocity );
			side_b.physics.angular_velocity.copy( rock.physics.angular_velocity );
			centerMeshGeometry( side_b );
			side_b.castShadow = side_b.receiveShadow = true;
			side_b.time_alive = rock.time_alive;
			scene.add( side_b );
			rocks.push( side_b );
		}

		if ( side_a.geometry.vertices.length > 0 && side_b.geometry.vertices.length > 0 ) {
			side_a.physics.linear_velocity.add( cut_speed );
			side_b.physics.linear_velocity.add( cut_speed );
		}

		if ( has_a_side ) {
			scene.remove( rock );
			rocks.splice( rocks.indexOf( rock ), 1 );
		}
	}

	renderer.domElement.addEventListener(
		'mouseup',
		function( e ) {
			is_cutting = false;
			cut_points.push( e.clientX, e.clientY );
			startCut();
		}
	);

	renderer.domElement.addEventListener(
		'touchend',
		function( e ) {
			is_cutting = false;
			cut_points.push( e.changedTouches[0].clientX, e.changedTouches[0].clientY );
			startCut();
		}
	);

	function endGame() {
		if (!is_game_ended) { // ? ohhh yeah race conditions ?
			is_game_ended = true;
			document.body.removeChild(renderer.domElement);
		}
	}
};