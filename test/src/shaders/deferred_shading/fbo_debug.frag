#version 300 es
precision mediump float;

out vec4 FragColor;
in  vec2 vTexCoord;

uniform sampler2D fboAttachment;

void main()
{
    FragColor = vec4(texture(fboAttachment, vTexCoord).rgb, 1.);
}
