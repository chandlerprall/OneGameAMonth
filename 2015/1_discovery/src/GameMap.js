define(
	[ 'src/GameTile' ],
	function( GameTile ) {
		var GameMap = function( width, height ) {
			this.width = width;
			this.height = height;

			this.renderable = new THREE.Object3D();

			this.tiles = [];
			this.createTiles();
		};

		GameMap.prototype = {
			createTiles: function() {
				for ( var x = 0; x < this.width; x++ ) {
					for ( var y = 0; y < this.height; y++ ) {
						var tile = new GameTile( x, y );
						this.renderable.add( tile.renderable );
						this.tiles.push( tile );
					}
				}
			}
		};

		return GameMap;
	}
);