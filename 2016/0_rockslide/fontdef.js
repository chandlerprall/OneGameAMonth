var font_loader = new THREE.TextureLoader();
var font_material = new THREE.MeshBasicMaterial({
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
	height: 256,
	width: 256,
	"0": {
		"top": 0,
		"left": 0,
		"bottom": 27,
		"right": 12
	},
	"1": {
		"top": 0,
		"left": 15,
		"bottom": 27,
		"right": 27
	},
	"2": {
		"top": 0,
		"left": 30,
		"bottom": 27,
		"right": 42
	},
	"3": {
		"top": 0,
		"left": 45,
		"bottom": 27,
		"right": 57
	},
	"4": {
		"top": 0,
		"left": 60,
		"bottom": 27,
		"right": 72
	},
	"5": {
		"top": 0,
		"left": 75,
		"bottom": 27,
		"right": 87
	},
	"6": {
		"top": 0,
		"left": 90,
		"bottom": 27,
		"right": 102
	},
	"7": {
		"top": 0,
		"left": 105,
		"bottom": 27,
		"right": 117
	},
	"8": {
		"top": 0,
		"left": 120,
		"bottom": 27,
		"right": 132
	},
	"9": {
		"top": 0,
		"left": 135,
		"bottom": 27,
		"right": 147
	},
	"!": {
		"top": 32,
		"left": 0,
		"bottom": 59,
		"right": 8
	},
	"@": {
		"top": 32,
		"left": 11,
		"bottom": 59,
		"right": 33
	},
	"#": {
		"top": 32,
		"left": 36,
		"bottom": 59,
		"right": 48
	},
	"$": {
		"top": 32,
		"left": 51,
		"bottom": 59,
		"right": 63
	},
	"%": {
		"top": 32,
		"left": 66,
		"bottom": 59,
		"right": 90
	},
	"^": {
		"top": 32,
		"left": 93,
		"bottom": 59,
		"right": 107
	},
	"&": {
		"top": 32,
		"left": 110,
		"bottom": 59,
		"right": 130
	},
	"*": {
		"top": 32,
		"left": 133,
		"bottom": 59,
		"right": 145
	},
	"(": {
		"top": 32,
		"left": 148,
		"bottom": 59,
		"right": 156
	},
	")": {
		"top": 32,
		"left": 159,
		"bottom": 59,
		"right": 167
	},
	"a": {
		"top": 64,
		"left": 0,
		"bottom": 91,
		"right": 12
	},
	"b": {
		"top": 64,
		"left": 15,
		"bottom": 91,
		"right": 28
	},
	"c": {
		"top": 64,
		"left": 31,
		"bottom": 91,
		"right": 42
	},
	"d": {
		"top": 64,
		"left": 45,
		"bottom": 91,
		"right": 58
	},
	"e": {
		"top": 64,
		"left": 61,
		"bottom": 91,
		"right": 72
	},
	"f": {
		"top": 64,
		"left": 75,
		"bottom": 91,
		"right": 83
	},
	"g": {
		"top": 64,
		"left": 86,
		"bottom": 91,
		"right": 98
	},
	"h": {
		"top": 64,
		"left": 101,
		"bottom": 91,
		"right": 114
	},
	"i": {
		"top": 64,
		"left": 117,
		"bottom": 91,
		"right": 124
	},
	"j": {
		"top": 64,
		"left": 127,
		"bottom": 91,
		"right": 135
	},
	"k": {
		"top": 64,
		"left": 138,
		"bottom": 91,
		"right": 151
	},
	"l": {
		"top": 64,
		"left": 154,
		"bottom": 91,
		"right": 161
	},
	"m": {
		"top": 64,
		"left": 164,
		"bottom": 91,
		"right": 184
	},
	"n": {
		"top": 96,
		"left": 0,
		"bottom": 123,
		"right": 13
	},
	"o": {
		"top": 96,
		"left": 16,
		"bottom": 123,
		"right": 28
	},
	"p": {
		"top": 96,
		"left": 31,
		"bottom": 123,
		"right": 44
	},
	"q": {
		"top": 96,
		"left": 47,
		"bottom": 123,
		"right": 60
	},
	"r": {
		"top": 96,
		"left": 63,
		"bottom": 123,
		"right": 74
	},
	"s": {
		"top": 96,
		"left": 77,
		"bottom": 123,
		"right": 86
	},
	"t": {
		"top": 96,
		"left": 89,
		"bottom": 123,
		"right": 97
	},
	"u": {
		"top": 96,
		"left": 100,
		"bottom": 123,
		"right": 113
	},
	"v": {
		"top": 96,
		"left": 116,
		"bottom": 123,
		"right": 128
	},
	"w": {
		"top": 96,
		"left": 131,
		"bottom": 123,
		"right": 148
	},
	"x": {
		"top": 96,
		"left": 151,
		"bottom": 123,
		"right": 163
	},
	"y": {
		"top": 96,
		"left": 166,
		"bottom": 123,
		"right": 178
	},
	"z": {
		"top": 96,
		"left": 181,
		"bottom": 123,
		"right": 192
	},
	"-": {
		"top": 128,
		"left": 0,
		"bottom": 155,
		"right": 8
	},
	"=": {
		"top": 128,
		"left": 11,
		"bottom": 155,
		"right": 25
	},
	"_": {
		"top": 128,
		"left": 28,
		"bottom": 155,
		"right": 40
	},
	"+": {
		"top": 128,
		"left": 43,
		"bottom": 155,
		"right": 57
	},
	"[": {
		"top": 128,
		"left": 60,
		"bottom": 155,
		"right": 68
	},
	"]": {
		"top": 128,
		"left": 71,
		"bottom": 155,
		"right": 79
	},
	"\\": {
		"top": 128,
		"left": 82,
		"bottom": 155,
		"right": 89
	},
	"{": {
		"top": 128,
		"left": 92,
		"bottom": 155,
		"right": 101
	},
	"}": {
		"top": 128,
		"left": 104,
		"bottom": 155,
		"right": 113
	},
	"|": {
		"top": 128,
		"left": 116,
		"bottom": 155,
		"right": 121
	},
	";": {
		"top": 128,
		"left": 124,
		"bottom": 155,
		"right": 132
	},
	"'": {
		"top": 128,
		"left": 135,
		"bottom": 155,
		"right": 142
	},
	":": {
		"top": 128,
		"left": 145,
		"bottom": 155,
		"right": 153
	},
	"\"": {
		"top": 128,
		"left": 156,
		"bottom": 155,
		"right": 169
	},
	",": {
		"top": 128,
		"left": 172,
		"bottom": 155,
		"right": 178
	},
	".": {
		"top": 128,
		"left": 181,
		"bottom": 155,
		"right": 187
	},
	"/": {
		"top": 128,
		"left": 190,
		"bottom": 155,
		"right": 197
	},
	"<": {
		"top": 128,
		"left": 200,
		"bottom": 155,
		"right": 214
	},
	">": {
		"top": 128,
		"left": 217,
		"bottom": 155,
		"right": 231
	},
	"?": {
		"top": 128,
		"left": 234,
		"bottom": 155,
		"right": 246
	}
};