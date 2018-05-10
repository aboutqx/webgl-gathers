
precision highp float;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
varying vec2 uv;
const float blurSize = 1.0/512.0;
const float intensity = 0.35;
void main()
{
   vec4 sum = vec4(0);

   int j;
   int i;
   //thank you! http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/ for the
   //blur tutorial
   // blur in y (vertical)
   // take nine samples, with the distance blurSize between them
   sum += texture2D(iChannel0, vec2(uv.x - 4.0*blurSize, uv.y)) * 0.05;
   sum += texture2D(iChannel0, vec2(uv.x - 3.0*blurSize, uv.y)) * 0.09;
   sum += texture2D(iChannel0, vec2(uv.x - 2.0*blurSize, uv.y)) * 0.12;
   sum += texture2D(iChannel0, vec2(uv.x - blurSize, uv.y)) * 0.15;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y)) * 0.16;
   sum += texture2D(iChannel0, vec2(uv.x + blurSize, uv.y)) * 0.15;
   sum += texture2D(iChannel0, vec2(uv.x + 2.0*blurSize, uv.y)) * 0.12;
   sum += texture2D(iChannel0, vec2(uv.x + 3.0*blurSize, uv.y)) * 0.09;
   sum += texture2D(iChannel0, vec2(uv.x + 4.0*blurSize, uv.y)) * 0.05;

	// blur in y (vertical)
   // take nine samples, with the distance blurSize between them
   sum += texture2D(iChannel0, vec2(uv.x, uv.y - 4.0*blurSize)) * 0.05;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y - 3.0*blurSize)) * 0.09;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y - 2.0*blurSize)) * 0.12;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y - blurSize)) * 0.15;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y)) * 0.16;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y + blurSize)) * 0.15;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y + 2.0*blurSize)) * 0.12;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y + 3.0*blurSize)) * 0.09;
   sum += texture2D(iChannel0, vec2(uv.x, uv.y + 4.0*blurSize)) * 0.05;

   //increase blur with intensity!
   //fragColor = sum*intensity + texture(iChannel0, uv);
   if(sin(iGlobalTime) > 0.0)
      gl_FragColor = sum * sin(iGlobalTime)+ texture2D(iChannel0, uv);

   else
	   gl_FragColor =  sum * -  sin(iGlobalTime)+ texture2D(iChannel0, uv);

}
