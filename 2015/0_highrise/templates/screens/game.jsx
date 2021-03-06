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

			updateHud: function( hud_values ) {
				this.setState( hud_values );
			},

			renderRemaining: function() {
				var remaining = this.state.time_remaining,
					minutes = Math.floor( remaining / 60 / 60 ),
					seconds = Math.floor( remaining / 60 ) - minutes * 60,
					milli = Math.floor( ( remaining - minutes*60*60 - seconds*60 ) * ( 1000 / 60 / 100 ) );
				return minutes + ':' + seconds + '.' + milli;
			},

			renderGameOver: function() {
				if ( this.state.time_remaining == null || this.state.time_remaining > 0 ) {
					return null;
				}

				return (
					<div id="gameOver" className="centered">
						<h1>Game Over</h1>
						Score: { this.state.max_height.toFixed( 2 ) }m
						<br/><br/>
						<button onClick={this.restart}>Back to Menu</button>
					</div>
				);
			},

			render: function() {
				return (
					<section id="game-screen">
						{this.state.max_height != null && (
							<header>
								<div id="timeHud">{this.renderRemaining()}</div>
								<div id="heightHud">Height: {this.state.max_height.toFixed( 2 )}m</div>
							</header>
						)}
						{this.renderGameOver()}
					</section>
				);
			}
		});
	}
);