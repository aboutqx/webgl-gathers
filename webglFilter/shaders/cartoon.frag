//http://www.geeks3d.com/20140523/glsl-shader-library-toonify-post-processing-filter/
precision highp float;
uniform sampler2D texture;
uniform vec2 iResolution;
uniform float HueLevels[6];
uniform float SatLevels[7];
uniform float ValLevels[4];
uniform vec2 textureSize;
varying vec2 uv;
#define HueLevCount 6
#define SatLevCount 7
#define ValLevCount 4


vec3 RGBtoHSV( float r, float g, float b) {
   float minv, maxv, delta;
   vec3 res;

   minv = min(min(r, g), b);
   maxv = max(max(r, g), b);
   res.z = maxv;            // v

   delta = maxv - minv;

   if( maxv != 0.0 )
      res.y = delta / maxv;      // s
   else {
      // r = g = b = 0      // s = 0, v is undefined
      res.y = 0.0;
      res.x = -1.0;
      return res;
   }

   if( r == maxv )
      res.x = ( g - b ) / delta;      // between yellow & magenta
   else if( g == maxv )
      res.x = 2.0 + ( b - r ) / delta;   // between cyan & yellow
   else
      res.x = 4.0 + ( r - g ) / delta;   // between magenta & cyan

   res.x = res.x * 60.0;            // degrees
   if( res.x < 0.0 )
      res.x = res.x + 360.0;

   return res;
}

vec3 HSVtoRGB(float h, float s, float v ) {
   int i;
   float f, p, q, t;
   vec3 res;

   if( s == 0.0 ) {
      // achromatic (grey)
      res.x = v;
      res.y = v;
      res.z = v;
      return res;
   }

   h /= 60.0;         // sector 0 to 5
   i = int(floor( h ));
   f = h - float(i);         // factorial part of h
   p = v * ( 1.0 - s );
   q = v * ( 1.0 - s * f );
   t = v * ( 1.0 - s * ( 1.0 - f ) );

    if(i== 0){
        res.x = v;
        res.y = t;
        res.z = p;
    }else if(i==1){
    	res.x = q;
        res.y = v;
        res.z = p;
    }else if(i==2){
    	res.x = p;
        res.y = v;
        res.z = t;
    }else if(i==3){
        res.x = p;
        res.y = q;
        res.z = v;
    }else if(i==4){
        res.x = t;
        res.y = p;
        res.z = v;
    }else if(i==5){
        res.x = v;
        res.y = p;
        res.z = q;
   }

   return res;
}
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}
float nearestLevel0(float col) {

   for (int i =0; i<HueLevCount-1; i++ ) {

        if (col >= HueLevels[i] && col <= HueLevels[i+1]) {
          return HueLevels[i+1];
        }


   }
}
float nearestLevel1(float col) {

   for (int i =0; i<SatLevCount-1; i++ ) {

        if (col >= SatLevels[i] && col <= SatLevels[i+1]) {
          return SatLevels[i+1];
        }

   }
}
float nearestLevel2(float col) {
   for (int i =0; i<ValLevCount-1; i++ ) {

        if (col >= ValLevels[i] && col <= ValLevels[i+1]) {
          return ValLevels[i+1];
        }

   }
}
// averaged pixel intensity from 3 color channels
float avg_intensity(vec4 pix) {
 return (pix.r + pix.g + pix.b)/3.;
}

vec4 get_pixel(vec2 coords, float dx, float dy) {
 return texture2D(texture,coords + vec2(dx, dy));
}

// returns pixel color
float IsEdge(vec2 coords){
  float dxtex = 1.0 /float(textureSize.x) ;
  float dytex = 1.0 /float(textureSize.y);
  float pix[9];
  int k = -1;
  float delta;

  // read neighboring pixel intensities
  /*
  for (int i=-1; i<2; i++) {
   for(int j=-1; j<2; j++) {
    k++;
    pix[k] = avg_intensity(get_pixel(coords,float(i)*dxtex,float(j)*dytex));
   }
  }*/
  pix[0] = avg_intensity(get_pixel(coords,float(-1)*dxtex,
                                          float(-1)*dytex));
  pix[1] = avg_intensity(get_pixel(coords,float(-1)*dxtex,
                                          float(0)*dytex));
  pix[2] = avg_intensity(get_pixel(coords,float(-1)*dxtex,
                                          float(1)*dytex));

  pix[3] = avg_intensity(get_pixel(coords,float(0)*dxtex,
                                          float(-1)*dytex));
  pix[4] = avg_intensity(get_pixel(coords,float(0)*dxtex,
                                          float(0)*dytex));
  pix[5] = avg_intensity(get_pixel(coords,float(0)*dxtex,
                                          float(1)*dytex));

  pix[6] = avg_intensity(get_pixel(coords,float(1)*dxtex,
                                          float(-1)*dytex));
  pix[7] = avg_intensity(get_pixel(coords,float(1)*dxtex,
                                          float(0)*dytex));
  pix[8] = avg_intensity(get_pixel(coords,float(1)*dxtex,
                                          float(1)*dytex));
  // average color differences around neighboring pixels
  delta = (abs(pix[1]-pix[7])+
          abs(pix[5]-pix[3]) +
          abs(pix[0]-pix[8])+
          abs(pix[2]-pix[6])
           )/4.;

  return clamp(5.5*delta,0.0,1.0);
}

void main(void)
{
    vec4 colorOrg = texture2D( texture, uv );
    vec3 vHSV =  RGBtoHSV(colorOrg.r,colorOrg.g,colorOrg.b);
    vHSV.x = nearestLevel0(vHSV.x);
    vHSV.y = nearestLevel1(vHSV.y);
    vHSV.z = nearestLevel2(vHSV.z);
    float edg = IsEdge(uv);
    vec3 vRGB = (edg >= 0.3)? vec3(0.0,0.0,0.0):HSVtoRGB(vHSV.x,vHSV.y,vHSV.z);
    //gl_FragColor = vec4(vRGB.x,vRGB.y,vRGB.z,1.0);
    gl_FragColor =vec4(vRGB.x,vRGB.y,vRGB.z,1.);

}
