#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 Normal;
in vec2 TexCoord;
in vec3 FragPos;

uniform vec3 objectColor;
uniform vec3 lightColor;

void main()
{   
    vec3 normal = normalize(Normal);
    FragColor = vec4(clamp(normal, vec3(0.), vec3(1.)), 1.0);

}
