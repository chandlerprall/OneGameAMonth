define(
	[ 'src/Events' ],
	function( Events ) {
		Events.on(
			'options.save',
			function( update ) {
				for ( var key in update ) {
					if ( options.hasOwnProperty( key ) ) {
						options[key] = update[key];
					}
				}
			}
		);

		var GameOptions = function() {
			this.ambient_sound_level = 40;
			this.sound_effects_level = 100;

			this.graphics_quality = 2;
		};
		GameOptions.prototype = {
			getShadowMapSize: function() {
				if ( this.graphics_quality == 2 ) {
					return 1024;
				} else if ( this.graphics_quality == 1 ) {
					return 256;
				} else if ( this.graphics_quality == 0 ) {
					return 0;
				}
			},

			getState: function() {
				var state = {};
				for ( var key in this ) {
					if ( this.hasOwnProperty( key ) ) {
						state[key] = this[key];
					}
				}
				return state;
			}
		};

		var options = new GameOptions();

		return options;
	}
);