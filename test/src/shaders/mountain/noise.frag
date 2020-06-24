#version 300 es
// Author @patriciogv - 2015
// Title: Mosaic

precision highp float;

in vec2 vTexCoord;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float uTime;
out vec4 FragColor;

float frequency = 43758.5453123;
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * frequency 
        );
}

void main() {
    vec2 st = vTexCoord;

    vec2 st0 = st * 19999.960; // Scale the coordinate system by 10
    vec2 ipos = floor(st0);  // get the integer coords
    vec2 fpos = fract(st0);  // get the fractional coords
    
    vec2 st1 = st * 99999.704; // Scale the coordinate system by 10
    vec2 ipos1 = floor(st1);  // get the integer coords
    vec2 fpos1 = fract(st1);  // get the fractional 
    
    vec2 st2 = st * 99999.256; // Scale the coordinate system by 10
    vec2 ipos2 = floor(st2);  // get the integer coords
    vec2 fpos2 = fract(st2);  // get the fractional 
    // Assign a random value based on the integer coord
    vec3 color = vec3(random( ipos ), random(ipos1), random(ipos2));
    // vec3 color = vec3(random( st ), random(st), random(st));
    // Uncomment to see the subdivided grid
    //color = vec3(fpos,0.0);

    FragColor = vec4(color * 3. , 1.0);
}