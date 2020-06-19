// https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
#version 300 es

precision highp float;
in vec2 vTexCoord;
uniform sampler2D texture0;

out vec4 FragColor;

void main(void) {
	vec4 color = texture2D(uSampler0, vTextureCoord);

    #ifdef USE_LIGHTNESS
        float gray = (min(color.r, color.g, color.b) + max(color.r, color.g, color.b)) / 2.;
    #elif USE_AVERAGE
        float gray = (color.r + color.g + color.b) / 3.;
    #else
	    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    #endif
	FragColor = vec4(vec3(gray), 1.0);
}