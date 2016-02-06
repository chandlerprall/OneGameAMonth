var font_loader = new THREE.TextureLoader();
var font_material = new THREE.MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	map: font_loader.load('images/font.png'),
	transparent: true
});

function getTextMesh(text, height, scale) {
	var segments = text.length * 2 - 1;
	var geometry = new THREE.PlaneGeometry(0, height, segments, 1);
	var current_x = 0;

	for (var i = 0; i < segments; i += 2) {
		var char_idx = Math.floor(i / 2);
		var char = text[char_idx];
		var chardef = fontdef[char];
		var char_width = chardef.right - chardef.left;

		var vertex_left_top = geometry.vertices[i];
		var vertex_left_bottom = geometry.vertices[i+segments+1];

		var vertex_right_top = geometry.vertices[i+1];
		var vertex_right_bottom = geometry.vertices[i+segments+2];

		vertex_left_bottom.x = vertex_left_top.x = current_x;

		current_x += char_width;

		vertex_right_bottom.x = vertex_right_top.x = current_x;

		var tri_a_idx = i*2;
		var tri_b_idx = i*2+1;

		var uv_top = 1 - chardef.top / fontdef.height;
		var uv_bottom = 1 - chardef.bottom / fontdef.height;
		var uv_left = chardef.left / fontdef.width;
		var uv_right = chardef.right / fontdef.width;

		geometry.faceVertexUvs[0][tri_a_idx][0].set( uv_left, uv_top );
		geometry.faceVertexUvs[0][tri_a_idx][1].set( uv_left, uv_bottom );
		geometry.faceVertexUvs[0][tri_a_idx][2].set( uv_right, uv_top );

		geometry.faceVertexUvs[0][tri_b_idx][0].set( uv_left, uv_bottom );
		geometry.faceVertexUvs[0][tri_b_idx][1].set( uv_right, uv_bottom );
		geometry.faceVertexUvs[0][tri_b_idx][2].set( uv_right, uv_top );
	}

	geometry.center();
	var mesh = new THREE.Mesh(geometry, font_material);
	mesh.scale.multiplyScalar( scale );
	return mesh;
}

var fontdef = {
	"0": {
		"top": 0,
		"left": 0,
		"bottom": 45,
		"right": 20
	},
	"1": {
		"top": 0,
		"left": 23,
		"bottom": 45,
		"right": 43
	},
	"2": {
		"top": 0,
		"left": 46,
		"bottom": 45,
		"right": 66
	},
	"3": {
		"top": 0,
		"left": 69,
		"bottom": 45,
		"right": 89
	},
	"4": {
		"top": 0,
		"left": 92,
		"bottom": 45,
		"right": 112
	},
	"5": {
		"top": 0,
		"left": 115,
		"bottom": 45,
		"right": 135
	},
	"6": {
		"top": 0,
		"left": 138,
		"bottom": 45,
		"right": 158
	},
	"7": {
		"top": 0,
		"left": 161,
		"bottom": 45,
		"right": 181
	},
	"8": {
		"top": 0,
		"left": 184,
		"bottom": 45,
		"right": 204
	},
	"9": {
		"top": 0,
		"left": 207,
		"bottom": 45,
		"right": 227
	},
	"!": {
		"top": 50,
		"left": 0,
		"bottom": 95,
		"right": 13
	},
	"@": {
		"top": 50,
		"left": 16,
		"bottom": 95,
		"right": 52
	},
	"#": {
		"top": 50,
		"left": 55,
		"bottom": 95,
		"right": 75
	},
	"$": {
		"top": 50,
		"left": 78,
		"bottom": 95,
		"right": 98
	},
	"%": {
		"top": 50,
		"left": 101,
		"bottom": 95,
		"right": 140
	},
	"^": {
		"top": 50,
		"left": 143,
		"bottom": 95,
		"right": 166
	},
	"&": {
		"top": 50,
		"left": 169,
		"bottom": 95,
		"right": 202
	},
	"*": {
		"top": 50,
		"left": 205,
		"bottom": 95,
		"right": 225
	},
	"(": {
		"top": 50,
		"left": 228,
		"bottom": 95,
		"right": 241
	},
	")": {
		"top": 50,
		"left": 244,
		"bottom": 95,
		"right": 257
	},
	" ": {
		"top": 100,
		"left": 0,
		"bottom": 100,
		"right": 10
	},
	"a": {
		"top": 100,
		"left": 3,
		"bottom": 145,
		"right": 23
	},
	"b": {
		"top": 100,
		"left": 26,
		"bottom": 145,
		"right": 48
	},
	"c": {
		"top": 100,
		"left": 51,
		"bottom": 145,
		"right": 68
	},
	"d": {
		"top": 100,
		"left": 71,
		"bottom": 145,
		"right": 93
	},
	"e": {
		"top": 100,
		"left": 96,
		"bottom": 145,
		"right": 113
	},
	"f": {
		"top": 100,
		"left": 116,
		"bottom": 145,
		"right": 129
	},
	"g": {
		"top": 100,
		"left": 132,
		"bottom": 145,
		"right": 152
	},
	"h": {
		"top": 100,
		"left": 155,
		"bottom": 145,
		"right": 177
	},
	"i": {
		"top": 100,
		"left": 180,
		"bottom": 145,
		"right": 191
	},
	"j": {
		"top": 100,
		"left": 194,
		"bottom": 145,
		"right": 207
	},
	"k": {
		"top": 100,
		"left": 210,
		"bottom": 145,
		"right": 232
	},
	"l": {
		"top": 100,
		"left": 235,
		"bottom": 145,
		"right": 246
	},
	"m": {
		"top": 100,
		"left": 249,
		"bottom": 145,
		"right": 282
	},
	"n": {
		"top": 150,
		"left": 0,
		"bottom": 195,
		"right": 22
	},
	"o": {
		"top": 150,
		"left": 25,
		"bottom": 195,
		"right": 45
	},
	"p": {
		"top": 150,
		"left": 48,
		"bottom": 195,
		"right": 70
	},
	"q": {
		"top": 150,
		"left": 73,
		"bottom": 195,
		"right": 95
	},
	"r": {
		"top": 150,
		"left": 98,
		"bottom": 195,
		"right": 115
	},
	"s": {
		"top": 150,
		"left": 118,
		"bottom": 195,
		"right": 133
	},
	"t": {
		"top": 150,
		"left": 136,
		"bottom": 195,
		"right": 149
	},
	"u": {
		"top": 150,
		"left": 152,
		"bottom": 195,
		"right": 174
	},
	"v": {
		"top": 150,
		"left": 177,
		"bottom": 195,
		"right": 197
	},
	"w": {
		"top": 150,
		"left": 200,
		"bottom": 195,
		"right": 228
	},
	"x": {
		"top": 150,
		"left": 231,
		"bottom": 195,
		"right": 251
	},
	"y": {
		"top": 150,
		"left": 254,
		"bottom": 195,
		"right": 274
	},
	"z": {
		"top": 150,
		"left": 277,
		"bottom": 195,
		"right": 294
	},
	"-": {
		"top": 200,
		"left": 0,
		"bottom": 245,
		"right": 13
	},
	"=": {
		"top": 200,
		"left": 16,
		"bottom": 245,
		"right": 38
	},
	"_": {
		"top": 200,
		"left": 41,
		"bottom": 245,
		"right": 61
	},
	"+": {
		"top": 200,
		"left": 64,
		"bottom": 245,
		"right": 86
	},
	"[": {
		"top": 200,
		"left": 89,
		"bottom": 245,
		"right": 102
	},
	"]": {
		"top": 200,
		"left": 105,
		"bottom": 245,
		"right": 118
	},
	"\\": {
		"top": 200,
		"left": 121,
		"bottom": 245,
		"right": 132
	},
	"{": {
		"top": 200,
		"left": 135,
		"bottom": 245,
		"right": 150
	},
	"}": {
		"top": 200,
		"left": 153,
		"bottom": 245,
		"right": 168
	},
	"|": {
		"top": 200,
		"left": 171,
		"bottom": 245,
		"right": 180
	},
	";": {
		"top": 200,
		"left": 183,
		"bottom": 245,
		"right": 196
	},
	"'": {
		"top": 200,
		"left": 199,
		"bottom": 245,
		"right": 210
	},
	":": {
		"top": 200,
		"left": 213,
		"bottom": 245,
		"right": 226
	},
	"\"": {
		"top": 200,
		"left": 229,
		"bottom": 245,
		"right": 251
	},
	",": {
		"top": 200,
		"left": 254,
		"bottom": 245,
		"right": 264
	},
	".": {
		"top": 200,
		"left": 267,
		"bottom": 245,
		"right": 277
	},
	"/": {
		"top": 200,
		"left": 280,
		"bottom": 245,
		"right": 291
	},
	"<": {
		"top": 200,
		"left": 294,
		"bottom": 245,
		"right": 316
	},
	">": {
		"top": 200,
		"left": 319,
		"bottom": 245,
		"right": 341
	},
	"?": {
		"top": 200,
		"left": 344,
		"bottom": 245,
		"right": 364
	},
	"height": 256,
	"width": 512
};