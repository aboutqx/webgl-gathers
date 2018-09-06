#extension GL_EXT_draw_buffers: require

precision mediump float;

varying vec4  vDest;
varying vec4  vColor;
varying vec3  vNormal;
varying float vDepth;

void main(){
    gl_FragData[0] = vDest;
    gl_FragData[1] = vColor;
    gl_FragData[2] = vec4((vNormal + 1.0) / 2.0, 1.0);
    gl_FragData[3] = vec4(vec3((vDepth + 1.0) / 2.0), 1.0);

    // gl_FragColor = vec4(.3,.3,.3,1.);
}
