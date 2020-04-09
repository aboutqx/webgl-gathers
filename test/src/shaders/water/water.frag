#version 300 es
precision highp float;
// basic.frag
in vec4 clipSpace;
in vec2 vTexCoord;
in vec3 vToLightVector;
in vec3 vToCameraVector;

uniform sampler2D reflectionTexture;
uniform sampler2D dudvMap;
uniform sampler2D normalMap;
uniform float count;
uniform float waveStrength;
uniform vec3 lightColor;
out vec4 FragColor;


void main(void) {
    vec3  diffuseColor = vec3(0., 0.3, 0.5);
    vec2 ndc = clipSpace.xy / clipSpace.w / 2. + .5;
    vec2 reflectionTexCoord = vec2(1.-ndc.x ,ndc.y);

    float moveFactor = fract(count) * .3;
    vec2 distortedvTexCoord = texture(dudvMap, vec2(vTexCoord.x + moveFactor, vTexCoord.y)).rg*0.1;
	distortedvTexCoord = vTexCoord + vec2(distortedvTexCoord.x, distortedvTexCoord.y+moveFactor);
	vec2 totalDistortion = (texture(dudvMap, distortedvTexCoord).rg * 2.0 - 1.0) * waveStrength;
    reflectionTexCoord += totalDistortion;


    vec3 reflection = texture(reflectionTexture, reflectionTexCoord).rgb;
    vec4 normalMapColor = texture(normalMap, distortedvTexCoord);
    vec3 normal = vec3(normalMapColor.r * 2. - 1., normalMapColor.g, normalMapColor.b * 2. - 1.);
    normal = normalize(normal);


    vec3  halfLE    = normalize(vToLightVector + vToCameraVector);
    float specular  = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);
    float reflectivity = .2;
    vec3 specularHightlights = lightColor * specular * reflectivity;

    vec3 mixColor = mix(reflection,  diffuseColor, .3);
    mixColor += specularHightlights;
    FragColor = vec4(mixColor, 1.);
    //FragColor = vec4(reflectionTexCoord.x + .7,0., 0.,1.);
}