var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( new THREE.Color( 0xffffff ) );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

var GROUP_ROCK = 2;

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
house.health = 100;
house.position.set( 17, 2.5, 0 );
house.castShadow = house.receiveShadow = true;
house.addEventListener(
    'physics.newContact',
    function( details ) {
        house.health -= details.relative_linear_velocity.length();
    }
);
scene.add( house );

// trees
var tree_timetofade = 3000;
function fadeTree( tree, details ) {
    if ( details.other_body.physics.collision_groups && GROUP_ROCK && !tree.is_fading ) {
        tree.is_fading = true;
        setTimeout( makeFader.bind( null, tree ), tree_timetofade );
    }
}

var tree_geometry = new THREE.BoxGeometry( 1, 4, 1 );
var tree_material = new THREE.MeshLambertMaterial({ color: 0x33dd33, depthTest: false, transparent: true, opacity: 1 });
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
var rock_material = new THREE.MeshPhongMaterial({ color: 0x999999, depthTest: false, transparent: true, opacity: 1, shading: THREE.FlatShading });
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

var physics_framerate = 1000 / 60;
var $health = document.getElementById( 'health' );
function onStep(step_index) {
    $health.textContent = Math.round( house.health );

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

renderer.domElement.addEventListener(
    'touchstart',
    function( e ) {
        cut.startx = e.changedTouches[0].clientX;
        cut.starty = e.changedTouches[0].clientY;
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
function doCut() {
    var start_point = getWorldPointFromCoords( cut.startx, cut.starty );
    var end_point = getWorldPointFromCoords( cut.endx, cut.endy );
    var transition = new THREE.Vector3().copy( end_point ).sub( start_point ).normalize();
    var cut_speed = transition.clone().multiplyScalar( 5 );

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
            side_a.time_alive = rock.time_alive;
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
            side_b.time_alive = rock.time_alive;
            scene.add( side_b );
            new_rocks.push( side_b );
        }

        if ( side_a.geometry.vertices.length > 0 && side_b.geometry.vertices.length > 0 ) {
            side_a.physics.linear_velocity.add( cut_speed );
            side_b.physics.linear_velocity.add( cut_speed );
        }

        if ( has_a_side ) {
            scene.remove( rock );
        } else {
            new_rocks.push( rock );
        }
    }
    rocks = new_rocks;
}

renderer.domElement.addEventListener(
    'mouseup',
    function( e ) {
        cut.endx = e.clientX;
        cut.endy = e.clientY;
        doCut();
    }
);

renderer.domElement.addEventListener(
    'touchend',
    function( e ) {
        cut.endx = e.changedTouches[0].clientX;
        cut.endy = e.changedTouches[0].clientY;
        doCut();
    }
);