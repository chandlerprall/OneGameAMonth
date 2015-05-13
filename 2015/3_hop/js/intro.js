define(["exports", "lib/react", "js/views/HopComponent", "js/views/SplashComponent"], function (exports, _libReact, _jsViewsHopComponent, _jsViewsSplashComponent) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _React = _interopRequire(_libReact);

    _React.render(_React.createElement(_jsViewsHopComponent.HopComponent, {
        view: _jsViewsSplashComponent.SplashComponent
    }), document.getElementById("container"));
});