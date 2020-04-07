#version 300 es
precision mediump float;

out vec4 outColor;

in vec2 vTexCoord;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
uniform sampler2D ssao;

struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
};
uniform Light lights;

void main() {
    vec3 FragPos = texture(gPosition, vTexCoord).rgb;
    vec3 Normal = texture(gNormal, vTexCoord).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, vTexCoord).rgb;
    float AmbientOcclusion = texture(ssao, vTexCoord).r;

    // then calculate lighting as usual
    vec3 ambient = vec3(0.3 * Diffuse * AmbientOcclusion);
    vec3 lighting  = ambient;
    vec3 viewDir  = normalize(-FragPos);


    // diffuse
    vec3 lightDir = normalize(lights.Position - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * lights.Color;
    // specular
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
    vec3 specular = lights.Color * spec;
    // attenuation
    float distance = length(lights.Position - FragPos);
    float attenuation = 1.0 / (1.0 + lights.Linear * distance + lights.Quadratic * distance * distance);
    diffuse *= attenuation;
    specular *= attenuation;
    lighting += diffuse + specular;

    outColor = vec4(lighting, 1.0);
}
