#version 300 es
precision highp float;
layout (location = 0) out vec3 gPositionDepth;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec2 vTexCoord;
in vec3 vPosition;
in vec3 Normal;

const float NEAR = 0.1; // 投影矩阵的近平面
const float FAR = 50.0f; // 投影矩阵的远平面
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // 回到NDC
    return (2.0 * NEAR * FAR) / (FAR + NEAR - z * (FAR - NEAR));
}


void main()
{
    // store the fragment position vector in the first gbuffer texture
    gPositionDepth.xyz = vPosition;
    // // 储存线性深度到gPositionDepth的alpha分量
    // gPositionDepth.a = LinearizeDepth(gl_FragCoord.z);
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(Normal);
    // and the diffuse per-fragment color
    gAlbedoSpec.rgb = vec3(0.95);
}
