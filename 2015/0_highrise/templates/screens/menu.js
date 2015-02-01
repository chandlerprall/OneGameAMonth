define(
	[ 'src/Events' ],
	function( Events ) {
		return React.createClass({
			getInitialState: function() {
				return {

				}
			},

			startGame: function() {
				Events.emit( 'app.screen', 'Loading' );
			},

			showOptions: function() {
				Events.emit( 'app.screen', 'Options' );
			},

			quitApp: function() {
				var gui = require( 'nw.gui' );
				gui.App.quit();
			},

			render: function() {
				return (
					React.createElement("section", {id: "menu-screen"}, 
						React.createElement("div", {className: "centered panel"}, 
							React.createElement("h1", null, "Highrise"), 

							React.createElement("p", null, 
								"Build the tallest tower you can.", 
								React.createElement("br", null), 
								"Drop blocks by left clicking,", 
								React.createElement("br", null), 
								"rotate them with a right click."
							), 

							React.createElement("nav", null, 
								React.createElement("button", {onClick: this.startGame}, "Start Game"), 
								React.createElement("button", {onClick: this.showOptions}, "Options"), 
								 window.require != null ? ( React.createElement("button", {onClick: this.quitApp}, "Quit") ) : null
							)
						)
					)
				);
			}
		});
	}
);