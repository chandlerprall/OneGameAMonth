define(["exports", "lib/react", "js/Events"], function (exports, _libReact, _jsEvents) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _React = _interopRequire(_libReact);

    var HopComponent = _React.createClass({
        displayName: "HopComponent",

        statics: {
            renderer: null
        },

        getInitialState: function getInitialState() {
            return {
                view: this.props.view
            };
        },

        changeView: function changeView(component) {
            this.setState({ view: component });
        },

        componentDidMount: function componentDidMount() {
            HopComponent.renderer = new THREE.WebGLRenderer({ antialias: true });
            HopComponent.renderer.setPixelRatio(window.devicePixelRatio);
            HopComponent.renderer.setSize(window.innerWidth, window.innerHeight);
            HopComponent.renderer.setClearColor(16777215);
            HopComponent.renderer.shadowMapEnabled = true;
            HopComponent.renderer.shadowMapType = THREE.PCFShadowMap;

            document.body.insertBefore(HopComponent.renderer.domElement, document.body.children[0]);

            _jsEvents.Events.on("changeView", this.changeView);
        },

        componentWillUnmount: function componentWillUnmount() {
            document.body.removeChild(HopComponent.renderer.domElement);

            _jsEvents.Events.off("changeView", this.changeView);
        },

        render: function render() {
            return _React.createElement(this.state.view, null);
        }
    });
    exports.HopComponent = HopComponent;
});