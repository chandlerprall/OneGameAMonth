define(
	[ 'src/Events', 'src/GameOptions' ],
	function( Events, GameOptions ) {
		return React.createClass({
			mixins: [ React.addons.LinkedStateMixin ],

			getInitialState: function() {
				return GameOptions.getState();
			},

			showMenu: function() {
				Events.emit( 'options.save', this.state );
				Events.emit( 'app.screen', 'Menu' );
			},

			soundLevelText: function( value ) {
				value = parseInt( value, 10 );
				return value + '%';
			},

			graphicsQualityText: function() {
				if ( this.state.graphics_quality == 0 ) {
					return 'Low';
				} else if ( this.state.graphics_quality == 1 ) {
					return 'Mid';
				} else if ( this.state.graphics_quality == 2 ) {
					return 'High';
				}
			},

			render: function() {
				return (
					React.createElement("section", {id: "options-screen"}, 
						React.createElement("div", {className: "centered panel"}, 
							React.createElement("h1", null, "Options"), 

							React.createElement("label", null, "Graphics Quality"), 
							React.createElement("input", {type: "range", min: "0", max: "2", valueLink: this.linkState( 'graphics_quality')}), 
							React.createElement("span", null,  this.graphicsQualityText() ), 

							React.createElement("br", null), 
							React.createElement("button", {onClick: this.showMenu}, "Back to Menu")
						)
					)
				);
			}
		});
	}
);