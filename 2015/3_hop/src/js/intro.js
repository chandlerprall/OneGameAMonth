import React from "lib/react";
import {HopComponent} from "js/views/HopComponent";
import {SplashComponent} from "js/views/SplashComponent";

React.render(
    React.createElement(
        HopComponent,
        {
            view: SplashComponent
        }
    ),
    document.getElementById( 'container' )
);