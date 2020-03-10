#version 300 es
precision highp float;
in vec3 Normal;
in vec3 Position;
in vec2 vTexCoord;
uniform vec3 cameraPos;
uniform samplerCube skybox;
uniform sampler2D aoMap;
out vec4 FragColor;

void main()
{             
    float ratio = 1.00 / 1.52;
    vec3 I = normalize(Position - cameraPos);
    vec3 R = refract(I, normalize(Normal), ratio);
    vec3 baseColor = texture(skybox, R).rgb;
    float ao = texture(aoMap, vTexCoord).r;
    FragColor = vec4(baseColor + baseColor * .03 * ao, 1.0);
}  