define(
	[ 'src/Events' ],
	function( Events ) {
		return React.createClass({
			getInitialState: function() {
				return {
					max_height: null,
					time_remaining: null
				};
			},

			componentDidMount: function() {
				this.getDOMNode().appendChild( this.props.game.renderer.domElement );
				this.props.game.bind();

				Events.on( 'game.hud_values', this.updateHud );
			},

			componentWillUnmount: function() {
				this.props.game.unbind();

				Events.off( 'game.hud_values', this.updateHud );
			},

			restart: function() {
				Events.emit( 'app.unloadgame' );
				Events.emit( 'app.screen', 'Menu' );
			},

			render: function() {
				return (
					<section id="game-screen"></section>
				);
			}
		});
	}
);