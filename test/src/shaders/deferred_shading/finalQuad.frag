#version 300 es
precision highp float;

out vec4 outColor;

in vec2 vTexCoord;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
};
const int NR_LIGHTS = 100;

uniform Light lights[NR_LIGHTS];
uniform vec3 viewPos;

void main() {
    vec3 FragPos = texture(gPosition, vTexCoord).rgb;
    vec3 Normal = texture(gNormal, vTexCoord).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, vTexCoord).rgb;
    float Specular = texture(gAlbedoSpec, vTexCoord).a;

    // then calculate lighting as usual
    vec3 lighting  = Diffuse * .1; // hard-coded ambient component
    vec3 viewDir  = normalize(viewPos - FragPos);
    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // diffuse
        vec3 lightDir = normalize(lights[i].Position - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * lights[i].Color;
        // specular
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
        vec3 specular = lights[i].Color * spec * Specular;
        // attenuation
        float distance = length(lights[i].Position - FragPos);
        float attenuation = 1.0 / (1.0 + lights[i].Linear * distance + lights[i].Quadratic * distance * distance);
        diffuse *= attenuation;
        specular *= attenuation;
        lighting += diffuse + specular;
    }
    outColor = vec4(lighting, 1.0);
}
