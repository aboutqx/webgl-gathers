# pbr

## hdr
hdr 设置texture filter为linear必须启用extension
```
    gl.getExtension('OES_texture_float')
    gl.getExtension('OES_texture_float_linear')
```

## exposure（曝光）
As we said before HDR images have a lot more information in both the lower and the higher range of pixel brightness values. 
That allows us to change the exposure just like in a real camera.
```
    ...
    gl_FragColor.rgb = texture2D(uEnvMap, envMapEquirect(reflectionWorld)).rgb;

    gl_FragColor.rgb *= uExposure;

    if (uCorrectGamma) {
        gl_FragColor.rgb = toGamma(gl_FragColor.rgb);
    }
    ...
```

## webgl2（opengl es3.0)
First off, rendering to floating point requires an extension in WebGL2, EXT_color_buffer_float.

You can see in the table [here](https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html) copied from the [spec section 3.8.3.2](https://www.khronos.org/registry/OpenGL/specs/es/3.0/es_spec_3.0.pdf) that floating point textures are not renderable in WebGL2 by default.

glTexImage2D internal format,format,type [combinations](https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml)

From [stackoverflow](https://stackoverflow.com/questions/45571488/webgl-2-readpixels-on-framebuffers-with-float-textures)

Example renderable(can be attach to a framebuffer)
```
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 512, 512, 0, gl.RGBA, gl.FLOAT, null)
```