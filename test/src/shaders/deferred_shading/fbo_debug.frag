#version 300 es
precision mediump float;

out vec4 FragColor;
in  vec2 TexCoords;

uniform sampler2D fboAttachment;

void main()
{
    FragColor = vec4(texture(fboAttachment, TexCoords).rgb, 1.);
}
