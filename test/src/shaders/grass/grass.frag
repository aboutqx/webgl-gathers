#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 Normal;
in vec3 vPosition;
in vec2 vTexCoord;

uniform sampler2D texture0;


void main()
{   
    vec4 grass = texture(texture0, vec2(vTexCoord.x, 1. - vTexCoord.y));
    if(grass.a < 0.1 ) discard;
    FragColor = grass;
}
