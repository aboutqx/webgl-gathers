#version 300 es
// sky.frag
#define SHADER_NAME SKY_FRAGMENT

precision highp float;

in vec3 vPosition;
in vec2 vTexCoord;
uniform sampler2D texture0;
out vec4 FragColor;
uniform vec3 uFogColor;

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

vec3 contrast(vec3 mValue, float mScale, float mMidPoint) {
	return vec3( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint), contrast(mValue.b, mScale, mMidPoint) );
}

vec3 contrast(vec3 mValue, float mScale) {
	return contrast(mValue, mScale, .5);
}

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

#define FOG_DENSITY 0.05
// const vec3 fogColor = vec3(254.0/255.0, 242.0/255.0, 226.0/255.0);

void main(void) {
    
     vec3 color = texture(texture0, vTexCoord).rgb;
    // color = contrast(color, 1.);

    //sky fog only has a y direction change
    float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);
    
    float grey = (color.r + color.g + color.b) / 3.0;
	float offset = smoothstep(5., 1., vPosition.y);
	color.rgb = mix(color.rgb, uFogColor, offset );

    // float grey = (color.r + color.g + color.b) / 3.0;
	// color.rgb = mix(color.rgb, vec3(grey), 1.);

    FragColor = vec4(color , 1.);
}
