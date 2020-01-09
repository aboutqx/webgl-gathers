#version 300 es
precision mediump float;
in vec3 Normal;
in vec3 Position;
uniform vec3 cameraPos;
uniform samplerCube skybox;
out vec4 FragColor;

vec3 reflect (vec3  I, vec3 N)
{
  return I - 2.0 * N * dot(N, I);
}

void main()
{             
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}