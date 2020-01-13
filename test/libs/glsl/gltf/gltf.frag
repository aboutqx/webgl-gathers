#version 300 es
#define SHADER_NAME gltf_frag

precision highp float;

uniform sampler2D 	uBRDFMap;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;

#ifdef HAS_BASECOLORMAP
uniform sampler2D uColorMap;
#endif

#ifdef HAS_METALROUGHNESSMAP
uniform sampler2D uMetallicRoughnessMap;
#endif

#ifdef HAS_OCCLUSIONMAP
uniform sampler2D uAoMap;
uniform float uOcclusionStrength;
#endif

#ifdef HAS_NORMALMAP
uniform sampler2D uNormalMap;
uniform float uNormalScale;
#endif

#ifdef HAS_EMISSIVEMAP
uniform sampler2D uEmissiveMap;
uniform vec3 uEmissiveFactor;
#endif

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPos;

uniform vec4 uScaleDiffBaseMR;
uniform vec4 uScaleFGDSpec;
uniform vec4 uScaleIBLAmbient;

uniform vec3 uBaseColor;
uniform float uRoughness;
uniform float uMetallic;
uniform float uGamma;

in vec2 vTextureCoord;
in vec3 vPosition;

#ifdef HAS_NORMALS
in vec3 vNormal;
#endif
out vec4 FragColor;

//	From GLTF WebGL PBR :
//	https://github.com/KhronosGroup/glTF-WebGL-PBR

// Encapsulate the various inputs used by the various functions in the shading equation
// We store values in this struct to simplify the integration of alternative implementations
// of the shading terms, outlined in the Readme.MD Appendix.
struct PBRInfo
{
	float NdotL;                  // cos angle between normal and light direction
	float NdotV;                  // cos angle between normal and view direction
	float NdotH;                  // cos angle between normal and half vector
	float LdotH;                  // cos angle between light direction and half vector
	float VdotH;                  // cos angle between view direction and half vector
	float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
	float metalness;              // metallic value at the surface
	vec3 reflectance0;            // full reflectance color (normal incidence angle)
	vec3 reflectance90;           // reflectance color at grazing angle
	float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
	vec3 diffuseColor;            // color contribution from diffuse lighting
	vec3 specularColor;           // color contribution from specular lighting
};


const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;


vec4 SRGBtoLINEAR(vec4 srgbIn)
{
	#ifdef MANUAL_SRGB
	#ifdef SRGB_FAST_APPROXIMATION
	vec3 linOut = pow(srgbIn.xyz,vec3(2.2));
	#else //SRGB_FAST_APPROXIMATION
	vec3 bLess = step(vec3(0.04045),srgbIn.xyz);
	vec3 linOut = mix( srgbIn.xyz/vec3(12.92), pow((srgbIn.xyz+vec3(0.055))/vec3(1.055),vec3(2.4)), bLess );
	#endif //SRGB_FAST_APPROXIMATION
	return vec4(linOut,srgbIn.w);;
	#else //MANUAL_SRGB
	return srgbIn;
	#endif //MANUAL_SRGB
}


vec3 getNormal() {
	vec3 pos_dx = dFdx(vPosition);
	vec3 pos_dy = dFdy(vPosition);
	vec3 tex_dx = dFdx(vec3(vTextureCoord, 0.0));
	vec3 tex_dy = dFdy(vec3(vTextureCoord, 0.0));
	vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

	
#ifdef HAS_NORMALS
	vec3 ng = normalize(vNormal);
#else
	vec3 ng = cross(pos_dx, pos_dy);
#endif

	t = normalize(t - ng * dot(ng, t));
	vec3 b = normalize(cross(ng, t));
	mat3 tbn = mat3(t, b, ng);

#ifdef HAS_NORMALMAP
	vec3 n = texture(uNormalMap, vTextureCoord).rgb;
	n = normalize(tbn * ((2.0 * n - 1.0) * vec3(uNormalScale, uNormalScale, 1.0)));
#else
	// The tbn matrix is linearly interpolated, so we need to re-normalize
	vec3 n = normalize(tbn[2].xyz);
#endif

	return n;
}


vec3 getIBLContribution(PBRInfo pbrInputs, vec3 n, vec3 reflection)
{
	float mipCount = 7.0; // resolution of 512x512
	float lod = (pbrInputs.perceptualRoughness * mipCount);
	// retrieve a scale and bias to F0. See [1], Figure 3
	vec3 brdf = SRGBtoLINEAR(texture(uBRDFMap, vec2(pbrInputs.NdotV, 1.0 - pbrInputs.perceptualRoughness))).rgb;
	vec3 diffuseLight = SRGBtoLINEAR(texture(uIrradianceMap, n)).rgb;

	vec3 specularLight = SRGBtoLINEAR(texture(uRadianceMap, reflection, lod)).rgb;

	vec3 diffuse = diffuseLight * pbrInputs.diffuseColor;
	vec3 specular = specularLight * (pbrInputs.specularColor * brdf.x + brdf.y);

	// For presentation, this allows us to disable IBL terms
	diffuse *= uScaleIBLAmbient.x;
	specular *= uScaleIBLAmbient.y;

	return diffuse + specular;
}


vec3 diffuse(PBRInfo pbrInputs)
{
	return pbrInputs.diffuseColor / M_PI;
}


vec3 specularReflection(PBRInfo pbrInputs)
{
	return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);
}

float geometricOcclusion(PBRInfo pbrInputs)
{
	float NdotL = pbrInputs.NdotL;
	float NdotV = pbrInputs.NdotV;
	float r = pbrInputs.alphaRoughness;

	float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
	float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
	return attenuationL * attenuationV;
}


float microfacetDistribution(PBRInfo pbrInputs)
{
	float roughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;
	float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;
	return roughnessSq / (M_PI * f * f);
}

void main() {

	float perceptualRoughness   = uRoughness;
	float metallic              = uMetallic;
#ifdef HAS_METALROUGHNESSMAP
	// Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
	// This layout intentionally reserves the 'r' channel for (optional) occlusion map data
	vec4 mrSample = texture(uMetallicRoughnessMap, vTextureCoord);
	perceptualRoughness = mrSample.g * perceptualRoughness;
	metallic = mrSample.b * metallic;
#endif	
	perceptualRoughness         = clamp(perceptualRoughness, c_MinRoughness, 1.0);
	metallic                    = clamp(metallic, 0.0, 1.0);
	float alphaRoughness        = perceptualRoughness * perceptualRoughness;

#ifdef HAS_BASECOLORMAP	
	vec4 baseColor = SRGBtoLINEAR(texture(uColorMap, vTextureCoord));
#else
	vec4 baseColor              = vec4(uBaseColor, 1.0);
#endif	
	
	vec3 f0                     = vec3(0.04);
	vec3 diffuseColor           = baseColor.rgb * (vec3(1.0) - f0);
	diffuseColor                *= 1.0 - metallic;
	vec3 specularColor          = mix(f0, baseColor.rgb, metallic);
	
	// Compute reflectance.
	float reflectance           = max(max(specularColor.r, specularColor.g), specularColor.b);
	
	// For typical incident reflectance range (between 4% to 100%) set the grazing reflectance to 100% for typical fresnel effect.
	// For very low reflectance range on highly diffuse objects (below 4%), incrementally reduce grazing reflecance to 0%.
	float reflectance90         = clamp(reflectance * 25.0, 0.0, 1.0);
	vec3 specularEnvironmentR0  = specularColor.rgb;
	vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;
	
	vec3 n                      = getNormal();                             // normal at surface point
	vec3 v                      = normalize(uCameraPos - vPosition);        // Vector from surface point to camera
	vec3 l                      = normalize(uLightDirection);             // Vector from surface point to light
	vec3 h                      = normalize(l+v);                          // Half vector between both l and v
	vec3 reflection             = -normalize(reflect(v, n));
	
	float NdotL                 = clamp(dot(n, l), 0.001, 1.0);
	float NdotV                 = abs(dot(n, v)) + 0.001;
	float NdotH                 = clamp(dot(n, h), 0.0, 1.0);
	float LdotH                 = clamp(dot(l, h), 0.0, 1.0);
	float VdotH                 = clamp(dot(v, h), 0.0, 1.0);

	PBRInfo pbrInputs = PBRInfo(
		NdotL,
		NdotV,
		NdotH,
		LdotH,
		VdotH,
		perceptualRoughness,
		metallic,
		specularEnvironmentR0,
		specularEnvironmentR90,
		alphaRoughness,
		diffuseColor,
		specularColor
	);

	// Calculate the shading terms for the microfacet specular shading model
	vec3 F              = specularReflection(pbrInputs);
	float G             = geometricOcclusion(pbrInputs);
	float D             = microfacetDistribution(pbrInputs);
	
	// Calculation of analytical lighting contribution
	vec3 diffuseContrib = (1.0 - F) * diffuse(pbrInputs);
	vec3 specContrib    = F * G * D / (4.0 * NdotL * NdotV);
	// Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
	vec3 color          = NdotL * uLightColor * (diffuseContrib + specContrib);
	
#ifdef USE_IBL
	color += getIBLContribution(pbrInputs, n, reflection);
#endif

#ifdef HAS_OCCLUSIONMAP	
	float ao            = texture(uAoMap, vTextureCoord).r;
	color               = mix(color, color * ao, uOcclusionStrength);
#endif	

#ifdef HAS_EMISSIVEMAP
	vec3 emissive = SRGBtoLINEAR(texture(uEmissiveMap, vTextureCoord)).rgb * uEmissiveFactor;
	color += emissive;
#endif
	
	// This section uses mix to override final color for reference app visualization
	// of various parameters in the lighting equation.
	color               = mix(color, F, uScaleFGDSpec.x);
	color               = mix(color, vec3(G), uScaleFGDSpec.y);
	color               = mix(color, vec3(D), uScaleFGDSpec.z);
	color               = mix(color, specContrib, uScaleFGDSpec.w);
	
	color               = mix(color, diffuseContrib, uScaleDiffBaseMR.x);
	color               = mix(color, baseColor.rgb, uScaleDiffBaseMR.y);
	color               = mix(color, vec3(metallic), uScaleDiffBaseMR.z);
	color               = mix(color, vec3(perceptualRoughness), uScaleDiffBaseMR.w);
	
	// output the fragment color
	FragColor        = vec4(pow(color,vec3(1.0/uGamma)), baseColor.a);
	// gl_FragColor        = vec4(vec3(metallic), 1.0);

}