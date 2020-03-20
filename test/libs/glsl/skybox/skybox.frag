#version 300 es
#define SHADER_NAME SKYBOX_FRAGMENT

precision highp float;
in   vec2 TexCoords;
in vec3 vertex;
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

void main(void){
    vec3 color = texture(tex, vertex).rgb;
    color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );

	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

    outColor = vec4(color, 1.);
}
