
precision highp float;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler2D iChannel0;

const float blurSize = 1.0/512.0;
const float intensity = 0.35;
void main()
{
   vec4 sum = vec4(0);
   vec2 texcoord = gl_FragCoord.xy/iResolution.xy;
   texcoord.y=1.-texcoord.y;
   int j;
   int i;

   //thank you! http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/ for the 
   //blur tutorial
   // blur in y (vertical)
   // take nine samples, with the distance blurSize between them
   sum += texture2D(iChannel0, vec2(texcoord.x - 4.0*blurSize, texcoord.y)) * 0.05;
   sum += texture2D(iChannel0, vec2(texcoord.x - 3.0*blurSize, texcoord.y)) * 0.09;
   sum += texture2D(iChannel0, vec2(texcoord.x - 2.0*blurSize, texcoord.y)) * 0.12;
   sum += texture2D(iChannel0, vec2(texcoord.x - blurSize, texcoord.y)) * 0.15;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y)) * 0.16;
   sum += texture2D(iChannel0, vec2(texcoord.x + blurSize, texcoord.y)) * 0.15;
   sum += texture2D(iChannel0, vec2(texcoord.x + 2.0*blurSize, texcoord.y)) * 0.12;
   sum += texture2D(iChannel0, vec2(texcoord.x + 3.0*blurSize, texcoord.y)) * 0.09;
   sum += texture2D(iChannel0, vec2(texcoord.x + 4.0*blurSize, texcoord.y)) * 0.05;
	
	// blur in y (vertical)
   // take nine samples, with the distance blurSize between them
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y - 4.0*blurSize)) * 0.05;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y - 3.0*blurSize)) * 0.09;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y - 2.0*blurSize)) * 0.12;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y - blurSize)) * 0.15;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y)) * 0.16;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y + blurSize)) * 0.15;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y + 2.0*blurSize)) * 0.12;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y + 3.0*blurSize)) * 0.09;
   sum += texture2D(iChannel0, vec2(texcoord.x, texcoord.y + 4.0*blurSize)) * 0.05;

   //increase blur with intensity!
   //fragColor = sum*intensity + texture(iChannel0, texcoord); 
   if(sin(iGlobalTime) > 0.0)
      gl_FragColor = sum * sin(iGlobalTime)+ texture2D(iChannel0, texcoord);
   
   else
	   gl_FragColor =  sum * -  sin(iGlobalTime)+ texture2D(iChannel0, texcoord);
   
}