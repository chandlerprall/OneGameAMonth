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
					<section id="options-screen">
						<div className="centered panel">
							<h1>Options</h1>

							<label>Graphics Quality</label>
							<input type="range" min="0" max="2" valueLink={this.linkState( 'graphics_quality' )}/>
							<span>{ this.graphicsQualityText() }</span>

							<br/>
							<button onClick={this.showMenu}>Back to Menu</button>
						</div>
					</section>
				);
			}
		});
	}
);