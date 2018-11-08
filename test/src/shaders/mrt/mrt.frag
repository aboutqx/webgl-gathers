#extension GL_EXT_draw_buffers: require

precision mediump float;

varying vec4  vDest;
varying vec4  vColor;
varying vec3  vNormal;
varying float vDepth;

float near = 0.1;
float far  = 100.0;

// https://learnopengl-cn.github.io/04%20Advanced%20OpenGL/01%20Depth%20testing/
// http://www.songho.ca/opengl/gl_projectionmatrix.html
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main(){
    gl_FragData[0] = vDest;
    gl_FragData[1] = vColor;
    gl_FragData[2] = vec4((vNormal + 1.0) / 2.0, 1.0);
    float depth = (LinearizeDepth(gl_FragCoord.z) -near) /(far-near);
    gl_FragData[3] = vec4(vec3(depth), 1.);

    // gl_FragColor = vec4(.3,.3,.3,1.);
}
