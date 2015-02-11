define(
	[
		'lib/require.text!src/shaders/vertex.shader',
		'lib/require.text!src/shaders/terrain.shader',
		'lib/require.text!src/shaders/terrain_depth.shader'
	],
	function( VertexShader, TerrainShader, TerrainDepthShader ) {
		var tile_size = 2,
			tile_material = new THREE.ShaderMaterial({
				vertexShader: VertexShader,
				fragmentShader: TerrainShader
			}),
			tile_depth_material = new THREE.ShaderMaterial({
				vertexShader: VertexShader,
				fragmentShader: TerrainShader,
				uniforms: {
					mNear: { type: "f", value: 1 },
					mFar: { type: "f", value: 150 }
				}
			});

		var tile_geometry = new THREE.Geometry();
		tile_geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

		var points = 6,
			angle = ( ( 2 * Math.PI ) / points ),
			i;

		for ( i = 0; i < points; i++ ) {
			tile_geometry.vertices.push(new THREE.Vector3(
				tile_size * Math.cos( angle * i ),
				0,
				tile_size * Math.sin( angle * i )
			));
		}

		tile_geometry.faces.push(
			new THREE.Face3( 2, 1, 0 ),
			new THREE.Face3( 3, 2, 0 ),
			new THREE.Face3( 4, 3, 0 ),
			new THREE.Face3( 5, 4, 0 ),
			new THREE.Face3( 6, 5, 0 ),
			new THREE.Face3( 1, 6, 0 )
		);

		tile_geometry.computeBoundingBox();
		var tile_width = tile_geometry.boundingBox.max.x - tile_geometry.boundingBox.min.x,
			tile_height = tile_geometry.boundingBox.max.z - tile_geometry.boundingBox.min.z;

		var GameTile = function( x, y ) {
			this.x = x;
			this.y = y;

			this.renderable = new THREE.Mesh( tile_geometry, tile_depth_material );
			this.renderable.position.set(
				( this.x * tile_width * 1.5 ) + ( this.y % 2 === 1 ? tile_width * 0.75 : 0 ),
				0,
				this.y * tile_height * 0.5
			);
		};

		GameTile.prototype = {

		};

		return GameTile;
	}
);