#version 300 es
precision mediump float;

uniform samplerCube environmentMap;
in vec3 WorldPos;
out vec4 outColor;
void main()
{
    vec3 envColor = textureLod(environmentMap, WorldPos, 0.).rgb;

    // HDR tonemap and gamma correct
    envColor = envColor / (envColor + vec3(1.0));
    envColor = pow(envColor, vec3(1.0/2.2));

    outColor = vec4(envColor, 1.0);
}
