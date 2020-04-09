#version 300 es
precision highp float;
in vec3 Normal;
in vec3 Position;
uniform vec3 cameraPos;
uniform samplerCube skybox;
uniform sampler2D aoMap;
out vec4 FragColor;
in vec2 vTexCoord;

vec3 reflect (vec3  I, vec3 N)
{
  return I - 2.0 * N * dot(N, I);
}

void main()
{             
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    vec3 baseColor = texture(skybox, R).rgb;
    float ao = texture(aoMap, vTexCoord).r;
    FragColor = vec4(baseColor + baseColor * .03 * ao, 1.0);
}