
precision mediump float;

uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec3 vNormal;
varying vec4 vColor;
varying float dist;

void main(void){
    vec3  invLight  = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3  invEye    = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    vec3  halfLE    = normalize(invLight + invEye);
    float diffuse   = clamp(dot(vNormal, invLight), 0.0, 1.0);
    float specular  = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0); // 50.0来模仿粗糙度
    vec4  destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;
    // float gamma = 2.2; // 我们本身用的已经是数字颜色，而不是看到的颜色，所以不需要gamma校正
    // destColor.rgb = pow(destColor.rgb, vec3(1.0/gamma));
    gl_FragColor    = destColor;
    // gl_FragColor = vec4(700.,0.3,1.,1.);
}
