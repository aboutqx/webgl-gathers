#version 300 es
// basic.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float terrainHeight;
uniform float uTime;

out vec2 vTextureCoord;
out vec3 vNormal;

float random(float _x) {
    return fract(sin(_x)*1e4);
}
// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main(void) {
    vec3 Position;

    Position = vec3(position.x, noise(position.xz - vec2(cos(uTime*0.15),sin(uTime*0.1))) * terrainHeight, position.z);

    gl_Position = uProjectionMatrix * uViewMatrix * mMatrix * vec4(Position, 1.0);
    vTextureCoord = texCoord;
    vNormal = normal;
}