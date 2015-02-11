
varying vec4 vPosition;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec4 colorize( vec4 baseColor, float elevation, vec4 color, vec2 elevations, float falloff, float mixAmt ) {
    if ( elevation >= elevations.x && elevation <= elevations.y ) {
        return mix( baseColor, color, mixAmt );
    } else {
        float distance = min(
            abs( elevations.x - elevation ),
            abs( elevations.y - elevation )
        );
        if ( distance <= falloff ) {
            return mix( baseColor, color, ( 1.0 - smoothstep( 0.0, falloff, distance ) ) * mixAmt );
        }
    }

    return baseColor;
}

float octaveElevation( float idx, float octaves, vec2 position ) {
    return 0.0;
}

float getElevation( vec2 position, float detail ) {
    float elevation = 0.0;

    //float divisor = pow( 2.0, detail ) - 1.0;
    float divisor = 511.0;

    position /= 10.0;
    elevation += ( 256.0 / divisor ) * snoise( position );

    position *= 4.0;
    elevation += ( 128.0 / divisor ) * snoise( position );

    position *= 2.5;
    elevation += ( 64.0 / divisor ) * snoise( position );

    position *= 4.0;
    elevation += ( 16.0 / divisor ) * snoise( position );

    position *= 8.0;
    elevation += ( 8.0 / divisor ) * snoise( position );

    position *= 10.0;
    elevation += ( 4.0 / divisor ) * snoise( position );

    position *= 10.0;
    elevation += ( 2.0 / divisor ) * snoise( position );

    position *= 10.0;
    elevation += ( 1.0 / divisor ) * snoise( position );

    return ( elevation + 1.0 ) * 0.5; // 0.0 - 1.0
}

void main() {
    float elevation = getElevation( vec2( vPosition.x, vPosition.z ), 9.0 );

    vec4 color = vec4( 0.78, 0.57, 0.37, 1.0 );

    vec4 waterColor = vec4( 0.18, 0.37, 0.57, 1.0 );
    vec2 waterElevation = vec2( 0.0, 0.55 );
    float waterFalloff = 0.0;
    float waterMix = 1.0;

    vec4 grassColor = vec4( 0.36, 0.39, 0.17, 1.0 );
    vec2 grassElevation = vec2( 0.2, 0.4 );
    float grassFalloff = 0.4;
    float grassMix = 1.0;

    vec4 snowColor = vec4( 1.0, 1.0, 1.0, 1.0 );
    vec2 snowElevation = vec2( 0.9, 1.0 );
    float snowFalloff = 0.2;
    float snowMix = 1.0;

    color = colorize( color, elevation, grassColor, grassElevation, grassFalloff, grassMix );
    color = colorize( color, elevation, snowColor, snowElevation, snowFalloff, snowMix );
    color = colorize( color, elevation, waterColor, waterElevation, waterFalloff, waterMix );

    // Apply shading
    float shading = 0.0;
    shading += getElevation( vec2( vPosition.x + 0.01, vPosition.z + 0.01 ), 9.0 );
    //shading += getElevation( vec2( vPosition.x - 0.01, vPosition.z + 0.01 ), 9.0 );
    //shading += getElevation( vec2( vPosition.x + 0.01, vPosition.z - 0.01 ), 9.0 );
    shading += getElevation( vec2( vPosition.x - 0.01, vPosition.z - 0.01 ), 9.0 );
    shading /= 2.0;

    shading = shading - elevation;

    color = mix( color, vec4( 0.0, 0.0, 0.0, 1.0 ), shading * 5.0 );

    gl_FragColor = color;
}