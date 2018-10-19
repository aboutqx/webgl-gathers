
precision mediump float;

uniform samplerCube environmentMap;
varying vec3 WorldPos;

void main()
{
    vec3 envColor = textureCube(environmentMap, WorldPos).rgb;

    // HDR tonemap and gamma correct
    envColor = envColor / (envColor + vec3(1.0));
    envColor = pow(envColor, vec3(1.0/2.2));

    gl_FragColor = vec4(envColor, 1.0);
}
