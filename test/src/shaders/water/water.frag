#version 300 es
precision mediump float;
// basic.frag
in vec4 clipSpace;
in vec2 vTextureCoord;
uniform sampler2D reflectionTexture;
out vec4 FragColor;



void main(void) {
    vec2 ndc = clipSpace.xy / clipSpace.w / 2. + .5;
    vec2 reflectionTexCoord = vec2(1.-ndc.x ,ndc.y);

    vec3 reflection = texture(reflectionTexture, reflectionTexCoord).rgb;
    vec3 mixColor = mix(reflection, vec3(0., 0.3, 0.5), .3);
    
    FragColor = vec4(mixColor, 1.);
}