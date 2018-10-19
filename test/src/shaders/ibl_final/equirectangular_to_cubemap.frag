#version 300 es
precision mediump float;

uniform sampler2D equirectangularMap;
in vec3 WorldPos;
in vec2 vUv;
out vec4 outColor;

const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 SampleSphericalMap(vec3 v)
{
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y)); // [-PI/2,PI/2]
    uv *= invAtan; //[-.5,.5]
    uv += 0.5;
    return uv;
}

void main()
{
    vec2 uv = SampleSphericalMap(normalize(WorldPos));
    vec3 color = texture(equirectangularMap, uv).rgb;

    outColor = vec4(color, 1.0);
    // gl_FragColor = vec4(WorldPos,1.);
}
