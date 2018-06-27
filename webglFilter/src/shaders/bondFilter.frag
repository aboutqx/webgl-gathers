precision highp float;
uniform vec2 iResolution;
uniform vec3 filterBg;

uniform float filterRange;

uniform sampler2D targetBg;
uniform sampler2D texture;

/*.05,.632,.148*/
vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    uv.y = 1.-uv.y;
    vec4 c = texture2D(texture, uv);
    vec3 t = rgb2hsb(c.rgb);
    vec2 pos = gl_FragCoord.xy+4.0*sin(1./2000.*1.*vec2(1,1.7))*iResolution.y/400.;
    float r=length(pos-iResolution.xy*.5)/iResolution.x;
    float vign=1.-r*r*r;
    if(abs(t.r-rgb2hsb(filterBg).r)<filterRange) {
        gl_FragColor = texture2D(targetBg,uv)*vign;


    } else {
        gl_FragColor = vec4(1,0,0,1.)*vign;
        discard;

    }


}
