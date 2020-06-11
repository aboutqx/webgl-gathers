#version 300 es
#define SHADER_NAME SKYBOX_FRAGMENT

precision highp float;
in   vec2 vTexCoord;
in vec3 vPosition;
uniform samplerCube tex;
uniform float uGamma;
uniform float uExposure;
out vec4 outColor;

// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

#define FOG_DENSITY 0.0005
const vec3 fogColor = vec3(254.0/255.0, 242.0/255.0, 226.0/255.0);

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

void main(void){
    vec3 color = texture(tex, vPosition).rgb;

	    

    color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	// color = contrast(color, 1.08);

	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

    outColor = vec4(color, 1.);
}
