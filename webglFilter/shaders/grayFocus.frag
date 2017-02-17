precision highp float;
varying vec2 vUv;
uniform float lt;
uniform float gt;
uniform float clamp;
uniform sampler2D texture;

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
	vec4 c = texture2D(texture, vUv);
	vec3 t = rgb2hsb(c.rgb);
    if (clamp < 0.5) {
        if(t.r <lt||t.r>gt) {
            gl_FragColor = c;
        } else {
            //apply B&W image.
            float y = c.r;
            y -= 0.0627;
            y *= 1.164;
            gl_FragColor = vec4(y, y, y, c.a);
        }
    } else {
        if(t.r <=lt&&t.r>=gt) {
            gl_FragColor = c;
        } else {
            //apply B&W image.
            float y = c.r;
            y -= 0.0627;
            y *= 1.164;
            gl_FragColor = vec4(y, y, y, c.a);
        }        
    }
	
}