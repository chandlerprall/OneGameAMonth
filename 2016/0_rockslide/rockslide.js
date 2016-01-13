var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( new THREE.Color( 0xffffff ) );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

var scene = new physijs.Scene( 'lib/physijs-worker.min.js' );
var camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 100 );
camera.position.set( 0, 50, 50 );
camera.lookAt( scene.position );

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
house.position.set( 17, 2.5, 0 );
house.castShadow = house.receiveShadow = true;
scene.add( house );

var rocks = [];
var rock_geometry = new THREE.SphereGeometry( 2, 4, 4 );
var rock_material = new THREE.MeshPhongMaterial({ color: 0x999999, shading: THREE.FlatShading });
var rock_description = { mass: 1 };
function spawnRock() {
    var rock = new physijs.Convex( rock_geometry, rock_material, rock_description );
    rock.position.set( -20 + Math.random() * 3, 10, 0 );
    rock.physics.linear_velocity.set( 15, -20, 0 );
	rock.physics.angular_velocity.set( Math.random() * 3, Math.random() * 3, Math.random() * 3 );
    rock.castShadow = rock.receiveShadow = true;
    scene.add( rock );
	rocks.push( rock );
}

var physics_framerate = 1000 / 60;
function onStep(step_index) {
    if ( step_index % 120 === 0 ) {
        spawnRock();
    }
    renderer.render( scene, camera );
    setTimeout( scene.step.bind( scene, physics_framerate / 1000, undefined, onStep ), physics_framerate );
}
spawnRock();
scene.step( physics_framerate / 1000, undefined, onStep );

var cut = {};
var cutter = new THREE.Mesh(
    new THREE.BoxGeometry( 6, 50, 20 ),
    new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, color: 0x4444ff })
);
var cutter_orientation = new THREE.Vector3( 0, 0, 1 );
cutter.geometry.vertices.forEach(function(vertex) {
    vertex.x += 3;
});
scene.add( cutter );

renderer.domElement.addEventListener(
    'mousedown',
    function( e ) {
        cut.startx = e.clientX;
        cut.starty = e.clientY;
    }
);

function getWorldPointFromCoords(x, y) {
    raycaster.setFromCamera(
        {
            x: ( x / renderer.domElement.clientWidth ) * 2 - 1,
            y: - ( y / renderer.domElement.clientHeight ) * 2 + 1
        },
        camera
    );
    var y_scale = camera.position.y / raycaster.ray.direction.y;
    var pos0 = new THREE.Vector3().copy( raycaster.ray.direction ).multiplyScalar( y_scale );
    return new THREE.Vector3().copy( camera.position ).sub( pos0 );
}

function centerMeshGeometry( mesh ) {
	var offset = mesh.geometry.center();
	mesh.position.sub( offset );
}

var raycaster = new THREE.Raycaster();
renderer.domElement.addEventListener(
    'mouseup',
    function( e ) {
        cut.endx = e.clientX;
        cut.endy = e.clientY;

        var start_point = getWorldPointFromCoords( cut.startx, cut.starty );
        var end_point = getWorldPointFromCoords( cut.endx, cut.endy );
        var transition = new THREE.Vector3().copy( end_point ).sub( start_point ).normalize();

        var cross = new THREE.Vector3().crossVectors( cutter_orientation, transition );
        cutter.quaternion.set(
            cross.x, cross.y, cross.z,
            1 + cutter_orientation.dot( transition )
        ).normalize();

        cutter.position.copy( start_point );

		var cutter_bsp = new ThreeBSP( cutter );
		var new_rocks = [];
		for ( var i = 0; i < rocks.length; i++ ) {
			var rock = rocks[i];
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
				scene.add( side_a );
				new_rocks.push( side_a );
			}

			if ( side_b.geometry.vertices.length > 0 ) {
				has_a_side = true;
				side_b = physijs.Convex( side_b, rock_description );
				side_b.physics.linear_velocity.copy( rock.physics.linear_velocity );
				side_b.physics.angular_velocity.copy( rock.physics.angular_velocity );
				centerMeshGeometry( side_b );
				side_b.castShadow = side_b.receiveShadow = true;
				scene.add( side_b );
				new_rocks.push( side_b );
			}

			if ( has_a_side ) {
				scene.remove( rock );
			} else {
				new_rocks.push( rock );
			}
		}
		rocks = new_rocks;
    }
);