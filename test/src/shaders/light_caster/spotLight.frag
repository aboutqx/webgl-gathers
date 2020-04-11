#version 300 es
precision highp float;
out vec4 FragColor;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D emission;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;

    float cutOff;
    float outerCutOff;
};

in vec3 FragPos;
in vec3 Normal;
in vec2 vTexCoord;

uniform vec3 cameraPos;
uniform Material material;
uniform Light light;

void main()
{
  vec3 result;
  vec3 lightDir = normalize(light.position - FragPos);


  // ambient
  vec3 ambient = light.ambient * texture(material.diffuse, vTexCoord).rgb;

  // diffuse
  vec3 norm = normalize(Normal);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = light.diffuse * diff * texture(material.diffuse, vTexCoord).rgb;

  // specular
  vec3 viewDir = normalize(cameraPos - FragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
  vec3 specular = light.specular * spec * texture(material.specular, vTexCoord).rgb;

  // spotlight (soft edges)
  float theta = dot(lightDir, normalize(-light.direction)); 
  float epsilon = (light.cutOff - light.outerCutOff);
  float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
  diffuse  *= intensity;
  specular *= intensity;

  // attenuation
  float distance    = length(light.position - FragPos);
  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

  ambient  *= attenuation;
  diffuse   *= attenuation;
  specular *= attenuation;

  vec3 emission = texture(material.emission, vTexCoord).rgb * vec3(.3,.3,7.) * .6;
  result = ambient + diffuse + specular + emission;


  FragColor = vec4(result, 1.0);
}
