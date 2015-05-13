import React from "lib/react";
import {HopComponent} from "js/views/HopComponent";
import {SplashComponent} from "js/views/SplashComponent";
import {Assets} from "js/Assets";
import {Events} from "js/Events";

export var GameComponent = React.createClass({
    scene: null,
    camera: null,

    materials: {},

    player: null,
    player_speed: 15,
    player_speed_increase: 0.4,
    player_direction: 0,

    ground: [],
    ground_spawns: 0,
    ground_distance: 15,
    ground_width: 12,
    ground_shrinkage: 2,
    ground_min_width: 2,
    ground_last_points: [],
    ground_last_offset: 0,

    lavas: [],
    lava_size: 150,

    is_dead: false,

    raycaster: new THREE.Raycaster(),

    componentDidMount: function() {
        document.body.addEventListener( 'keydown', this.handleKeyDown );
        document.body.addEventListener( 'keyup', this.handleKeyUp );
        window.addEventListener( 'deviceorientation', this.handleOrient );

        this.initScene();

        this.step();
    },

    componentWillUnmount: function() {
        document.body.removeEventListener( 'keydown', this.handleKeyDown );
        document.body.removeEventListener( 'keyup', this.handleKeyUp );
        window.removeEventListener( 'deviceorientation', this.handleOrient );
    },

    initScene: function() {
        this.materials.ground_material = new THREE.MeshLambertMaterial({
            map: Assets.textures.rock_diffuse
        });

        this.scene = new THREE.Scene();

        var ambient_light = new THREE.AmbientLight( 0xCCCCCC );
        this.scene.add( ambient_light );

        var directional_light = new THREE.DirectionalLight( 0x555555 );
        directional_light.position.set( -10, 10, -5 );
        directional_light.castShadow = true;
        directional_light.shadowCameraNear = 1;
        directional_light.shadowCameraFar = 20;

        directional_light.shadowCameraLeft = -5;
        directional_light.shadowCameraRight = 5;
        directional_light.shadowCameraTop = 5;
        directional_light.shadowCameraBottom = -5;

        directional_light.shadowBias = 0;
        directional_light.shadowDarkness = 1.0;

        directional_light.shadowMapWidth = 512;
        directional_light.shadowMapHeight = 512;

        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 500 );
        this.camera.position.set( 0, 30, -20 );
        this.camera.lookAt( new THREE.Vector3( 0, 0, 10 ) );

        this.player = new THREE.Mesh(
            Assets.geometries.monkey,
            Assets.materials.monkey
        );
        this.player.castShadow = true;
        this.player.scale.set( 0.35, 0.35, 0.35 );
        this.player.position.y = 0;
        this.scene.add( this.player );

        this.player.add( this.camera );
        this.player.add( directional_light );
        directional_light.target =  this.player;

        this.animation = new THREE.MorphAnimation( this.player );
        this.animation.duration = 0.5;
        this.animation.play();

        this.ground_last_points = [ new THREE.Vector3( -this.ground_width, 0, -this.ground_distance ), new THREE.Vector3( this.ground_width, 0, -this.ground_distance ) ];
        this.ground.length = 0;
        this.spawnGround();

        // Lava tiles
        var lava_geometry = new THREE.PlaneBufferGeometry( this.lava_size, this.lava_size ),
            lava_material = new THREE.MeshBasicMaterial({ map: Assets.textures.lava_diffuse, fog: false }),
            lava;

        lava = new THREE.Mesh( lava_geometry, lava_material );
        lava.rotation.x = -Math.PI / 2;
        lava.position.y = -4;
        this.scene.add( lava );
        this.lavas.push( lava );

        lava = new THREE.Mesh( lava_geometry, lava_material );
        lava.rotation.x = -Math.PI / 2;
        lava.position.y = -4;
        lava.position.z = this.lava_size;
        this.scene.add( lava );
        this.lavas.push( lava );
    },

    spawnGround: function() {
        this.ground_width -= this.ground_shrinkage;
        this.ground_width = Math.max( this.ground_width, this.ground_min_width );

        var new_offset = Math.random() * 20 - 10;
        new_offset += this.ground_last_offset;
        new_offset = Math.min( Math.max( new_offset, -30 ), 30 );

        var new_points = [];
        new_points.push( new THREE.Vector3( -this.ground_width + new_offset, 0, this.ground_distance ) );
        new_points.push( new THREE.Vector3( this.ground_width + new_offset, 0, this.ground_distance ) );

        var ground_vertices = new_points.slice();
        for ( var i = 0; i < this.ground_last_points.length; i++ ) {
            var vertex = this.ground_last_points[i];
            ground_vertices.push( new THREE.Vector3( vertex.x, 0, -this.ground_distance ) );
        }

        var top_vertices_count = ground_vertices.length;
        for ( var i = 0; i < top_vertices_count; i++ ) {
            var vertex = ground_vertices[i];
            ground_vertices.push( new THREE.Vector3( vertex.x, -10, vertex.z ) );
        }

        this.ground_last_points = new_points;
        this.ground_last_offset = new_offset;

        var ground = new THREE.Mesh( new THREE.ConvexGeometry( ground_vertices ), this.materials.ground_material );

        ground.receiveShadow = true;
        ground.position.z = (this.ground_spawns++) * this.ground_distance * 2;

        this.ground.push( ground );
        this.scene.add( ground );
    },

    handleKeyDown: function( e ) {
        var key = e.keyCode || e.which;
        switch( key ) {
            case 37:
                this.player_direction = 4;
                break;
            case 39:
                this.player_direction = -4;
                break;
        }
    },

    handleKeyUp: function(e) {
        var key = e.keyCode || e.which;
        switch( key ) {
            case 37:
            case 39:
                this.player_direction = 0;
                break;
        }
    },

    handleOrient: function(e) {
        var rotation = Math.min( Math.max( e.beta, -20 ), 20 );
        this.player_direction = -rotation / 2;
    },

    render: function() {
        return (
            <div id="GameComponent"></div>
        );
    },

    step: function() {
        var now = window.performance.now();

        if ( last_frame_time ) {
            var frame_delta = Math.min(( now - last_frame_time ) / 1000, 1 / 60 );

            if ( this.animation ) {
                this.animation.update( frame_delta );
            }

            this.player.position.z += this.player_speed * frame_delta;
            this.player.position.x += this.player_direction * frame_delta;

            this.player_speed += this.player_speed_increase * frame_delta;

            if ( this.player.position.z > this.lavas[0].position.z ) {
                var lava = this.lavas.pop();
                this.lavas.unshift( lava );

                lava.position.z = this.lavas[1].position.z + this.lava_size;
            }

            if ( this.player.position.z + this.ground_distance > this.ground[this.ground.length-1].position.z ) {
                this.spawnGround();
            }

            // Check for death
            this.raycaster.set(
                new THREE.Vector3( this.player.position.x, 5, this.player.position.z ),
                new THREE.Vector3( 0, -1, 0 )
            );
            var intersection = this.raycaster.intersectObjects( this.ground, false );
            if ( intersection.length === 0 ) {
                this.is_dead = true;
                Events.emit( 'changeView', [SplashComponent] );
            }

            if ( HopComponent.renderer ) {
                HopComponent.renderer.render( this.scene, this.camera );
            }
        }

        last_frame_time = now;

        if ( !this.is_dead ) {
            requestAnimationFrame( this.step );
        }
    }
});
var last_frame_time = null;