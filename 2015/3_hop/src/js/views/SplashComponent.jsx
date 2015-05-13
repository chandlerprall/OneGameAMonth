import React from "lib/react";
import {HopComponent} from "js/views/HopComponent";
import {GameComponent} from "js/views/GameComponent";
import {Events} from "js/Events";
import {Assets} from "js/Assets";

var animation_frame = null;

export var SplashComponent = React.createClass({
    scene: null,
    camera: null,
    animation: null,

    getInitialState: function() {
        return {
            total_assets: 0,
            loaded_assets: 0
        };
    },

    componentDidMount: function() {
        this.initScene();
        this.loadAssets();
        this.step();
    },

    componentWillUnmount: function() {
        cancelAnimationFrame( animation_frame );
    },

    initScene: function() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
        this.camera.position.set( 10, 10, 10 );
        this.camera.lookAt( this.scene.position );
    },

    loadAssets: function() {
        var json_loader = new THREE.JSONLoader();
        var total_assets = 0;
        var loaded_assets = 0;

        // textures
        THREE.ImageUtils.loadTexture(
            './lib/textures/lava/lava-diffuse.png',
            THREE.Texture.DEFAULT_MAPPING,
            function( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 4, 4 );
                Assets.textures.lava_diffuse = texture;
                this.setState({loaded_assets: ++loaded_assets });
            }.bind( this )
        );
        total_assets++;

        THREE.ImageUtils.loadTexture(
            './lib/textures/rock/rock-diffuse.png',
            THREE.Texture.DEFAULT_MAPPING,
            function( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 0.1, 0.1 );
                Assets.textures.rock_diffuse = texture;
                this.setState({loaded_assets: ++loaded_assets });
            }.bind( this )
        );
        total_assets++;

        // models
        json_loader.load(
            './lib/models/monkey.json',
            function( geometry, materials ) {
                Assets.geometries.monkey = geometry;
                Assets.materials.monkey = new THREE.MeshLambertMaterial({ morphTargets: true, morphNormals: false, vertexColors: THREE.VertexColors })

                var ambient = new THREE.AmbientLight( 0xCCCCCC );
                this.scene.add( ambient );

                var monkey = new THREE.Mesh(
                    Assets.geometries.monkey,
                    Assets.materials.monkey
                );
                monkey.position.y = -1;
                monkey.scale.set( 0.8, 0.8, 0.8 );
                this.scene.add( monkey );

                this.animation = new THREE.MorphAnimation( monkey );
                this.animation.duration = 0.5;
                this.animation.play();

                this.setState({loaded_assets: ++loaded_assets });
            }.bind( this )
        );
        total_assets++;

        this.setState({ total_assets });
    },

    startGame: function() {
        Events.emit( 'changeView', [GameComponent] );
    },

    renderStartButton: function() {
        var $button = null;

        if ( this.state.loaded_assets === this.state.total_assets ) {
            $button = (
                <button onClick={this.startGame}>start</button>
            );
        }

        return $button;
    },

    render: function() {
        return (
            <div id="SplashComponent">
                <h1>Hop</h1>
                {this.renderStartButton()}
            </div>
        );
    },

    step: function() {
        if ( HopComponent.renderer ) {
            HopComponent.renderer.render( this.scene, this.camera );
        }
        if ( this.animation ) {
            this.animation.update( 0.016 );
        }

        animation_frame = requestAnimationFrame( this.step );
    }
});