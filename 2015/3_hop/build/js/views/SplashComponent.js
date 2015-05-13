define(["exports", "lib/react", "js/views/HopComponent", "js/views/GameComponent", "js/Events", "js/Assets"], function (exports, _libReact, _jsViewsHopComponent, _jsViewsGameComponent, _jsEvents, _jsAssets) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _React = _interopRequire(_libReact);

    var animation_frame = null;

    var SplashComponent = _React.createClass({
        displayName: "SplashComponent",

        scene: null,
        camera: null,
        animation: null,

        getInitialState: function getInitialState() {
            return {
                total_assets: 0,
                loaded_assets: 0
            };
        },

        componentDidMount: function componentDidMount() {
            this.initScene();
            this.loadAssets();
            this.step();
        },

        componentWillUnmount: function componentWillUnmount() {
            cancelAnimationFrame(animation_frame);
        },

        initScene: function initScene() {
            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100);
            this.camera.position.set(10, 10, 10);
            this.camera.lookAt(this.scene.position);
        },

        loadAssets: function loadAssets() {
            var json_loader = new THREE.JSONLoader();
            var total_assets = 0;
            var loaded_assets = 0;

            // textures
            THREE.ImageUtils.loadTexture("./lib/textures/lava/lava-diffuse.png", THREE.Texture.DEFAULT_MAPPING, (function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(4, 4);
                _jsAssets.Assets.textures.lava_diffuse = texture;
                this.setState({ loaded_assets: ++loaded_assets });
            }).bind(this));
            total_assets++;

            THREE.ImageUtils.loadTexture("./lib/textures/rock/rock-diffuse.png", THREE.Texture.DEFAULT_MAPPING, (function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(0.1, 0.1);
                _jsAssets.Assets.textures.rock_diffuse = texture;
                this.setState({ loaded_assets: ++loaded_assets });
            }).bind(this));
            total_assets++;

            // models
            json_loader.load("./lib/models/monkey.json", (function (geometry, materials) {
                _jsAssets.Assets.geometries.monkey = geometry;
                _jsAssets.Assets.materials.monkey = new THREE.MeshLambertMaterial({ morphTargets: true, morphNormals: false, vertexColors: THREE.VertexColors });

                var ambient = new THREE.AmbientLight(13421772);
                this.scene.add(ambient);

                var monkey = new THREE.Mesh(_jsAssets.Assets.geometries.monkey, _jsAssets.Assets.materials.monkey);
                monkey.position.y = -1;
                monkey.scale.set(0.8, 0.8, 0.8);
                this.scene.add(monkey);

                this.animation = new THREE.MorphAnimation(monkey);
                this.animation.duration = 0.5;
                this.animation.play();

                this.setState({ loaded_assets: ++loaded_assets });
            }).bind(this));
            total_assets++;

            this.setState({ total_assets: total_assets });
        },

        startGame: function startGame() {
            _jsEvents.Events.emit("changeView", [_jsViewsGameComponent.GameComponent]);
        },

        renderStartButton: function renderStartButton() {
            var $button = null;

            if (this.state.loaded_assets === this.state.total_assets) {
                $button = _React.createElement(
                    "button",
                    { onClick: this.startGame },
                    "start"
                );
            }

            return $button;
        },

        render: function render() {
            return _React.createElement(
                "div",
                { id: "SplashComponent" },
                _React.createElement(
                    "h1",
                    null,
                    "Hop"
                ),
                this.renderStartButton()
            );
        },

        step: function step() {
            if (_jsViewsHopComponent.HopComponent.renderer) {
                _jsViewsHopComponent.HopComponent.renderer.render(this.scene, this.camera);
            }
            if (this.animation) {
                this.animation.update(0.016);
            }

            animation_frame = requestAnimationFrame(this.step);
        }
    });
    exports.SplashComponent = SplashComponent;
});