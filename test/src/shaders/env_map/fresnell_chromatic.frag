#version 300 es
precision highp float;
in vec3 Normal;
in vec3 Position;
uniform vec3 cameraPos;
uniform samplerCube skybox;
uniform float fresnelBias;

uniform float fresnelScale;

uniform float fresnelPower;

uniform vec3 etaRatio;

out vec4 FragColor;

void main()
{             
    float ratio = 1.00 / 1.52;
    vec3 I = normalize(Position - cameraPos);
    vec3 N = normalize(Normal);
    vec3 R = refract(I, N, ratio);
    
    vec3 TRed   = refract(I, N, etaRatio.x);

    vec3 TGreen = refract(I, N, etaRatio.y);

    vec3 TBlue  = refract(I, N, etaRatio.z);

     // Compute the reflection factor

    float reflectionFactor = fresnelBias + fresnelScale * pow(1. + dot(I, N), fresnelPower);
    vec4 reflectedColor = texture(skybox, R);


    // Compute the refracted environment color

    vec4 refractedColor;

    refractedColor.r = texture(skybox, TRed).r;

    refractedColor.g = texture(skybox, TGreen).g;

    refractedColor.b = texture(skybox, TBlue).b;

    refractedColor.a = 1.;


    // Compute the final color

    FragColor = mix(refractedColor, reflectedColor, vec4(reflectionFactor));

}  