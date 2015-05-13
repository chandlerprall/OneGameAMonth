import React from "lib/react";
import {Events} from "js/Events";

export var HopComponent = React.createClass({
    statics: {
        renderer: null
    },

    getInitialState: function() {
        return {
            view: this.props.view
        }
    },

    changeView: function( component ) {
        this.setState({ view: component });
    },

    componentDidMount: function() {
        HopComponent.renderer = new THREE.WebGLRenderer({ antialias: true });
        HopComponent.renderer.setPixelRatio( window.devicePixelRatio );
        HopComponent.renderer.setSize( window.innerWidth, window.innerHeight );
        HopComponent.renderer.setClearColor( 0xFFFFFF );
        HopComponent.renderer.shadowMapEnabled = true;
        HopComponent.renderer.shadowMapType = THREE.PCFShadowMap;

        document.body.insertBefore( HopComponent.renderer.domElement, document.body.children[0] );

        Events.on( 'changeView', this.changeView );
    },

    componentWillUnmount: function() {
        document.body.removeChild( HopComponent.renderer.domElement );

        Events.off( 'changeView', this.changeView );
    },

    render: function() {
        return (
            <this.state.view/>
        );
    }
});