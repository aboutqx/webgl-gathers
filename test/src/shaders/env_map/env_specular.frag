#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vPosition;
uniform vec3 uCameraPos;
uniform samplerCube skybox;
uniform sampler2D aoMap;
out vec4 FragColor;
in vec2 vTexCoord;

// vec3 reflect (vec3  I, vec3 N)
// {
//   return I - 2.0 * N * dot(N, I);
// }

void main()
{             
    vec3 I = normalize(vPosition - uCameraPos);
    vec3 R = reflect(I, normalize(vNormal));
    vec3 baseColor = texture(skybox, R).rgb;
    float ao = texture(aoMap, vTexCoord).r;
    FragColor = vec4(baseColor + baseColor * .03 * ao, 1.0);
}