THREE.ClampShader = {
    shaderID: "clamp",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = clamp( texel, vec4( 0.0 ), vec4( 1.0 ) );", "}"].join("\n")
};
THREE.ConvolutionShader = {
    shaderID: "convolution",
    defines: {
        KERNEL_SIZE_FLOAT: "25.0",
        KERNEL_SIZE_INT: "25"
    },
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        uImageIncrement: {
            type: "v2",
            value: new THREE.Vector2(.001953125,0)
        },
        cKernel: {
            type: "fv1",
            value: []
        }
    },
    vertexShader: ["uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float cKernel[ KERNEL_SIZE_INT ];", "uniform sampler2D tDiffuse;", "uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vec2 imageCoord = vUv;", "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );", "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {", "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];", "imageCoord += uImageIncrement;", "}", "gl_FragColor = sum;", "}"].join("\n"),
    buildKernel: function(kernelSize) {
        function quadratic(x, radius) {
            radius = Math.abs(radius);
            x = Math.abs(x);
            if (x >= radius)
                return 0;
            var f = 1 - x * x / (radius * radius);
            return f * f
        }
        function cubic(x, radius) {
            radius = Math.abs(radius);
            x = Math.abs(x);
            if (x >= radius)
                return 0;
            var f = 1 - x * x / (radius * radius);
            return f * f * f
        }
        function gauss(x, sigma) {
            return Math.exp(-(x * x) / (2 * sigma * sigma))
        }
        var i, values, sum, halfWidth, kMaxKernelSize = 25;
        if (kernelSize > kMaxKernelSize)
            kernelSize = kMaxKernelSize;
        halfWidth = (kernelSize - 1) * .5;
        values = new Array(kernelSize);
        sum = 0;
        for (i = 0; i < kernelSize; ++i) {
            values[i] = cubic(i - halfWidth, halfWidth);
            sum += values[i]
        }
        for (i = 0; i < kernelSize; ++i)
            values[i] /= sum;
        return values
    }
};
THREE.CopyShader = {
    shaderID: "copy",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        opacity: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
};
THREE.DOFShader = {
    shaderID: "dof",
    defines: {
        NUM_SAMPLES: 8,
        NUM_RINGS: 3,
        NUM_SAMPLES_HQ: 32,
        NUM_RINGS_HQ: 7
    },
    uniforms: {
        tColor: {
            type: "t",
            value: null
        },
        tDepth: {
            type: "t",
            value: null
        },
        focalDepth: {
            type: "f",
            value: 1
        },
        zNear: {
            type: "f",
            value: 1
        },
        zFar: {
            type: "f",
            value: 2e3
        },
        fStop: {
            type: "f",
            value: 2.8
        },
        filmSize: {
            type: "f",
            value: 35
        },
        focalLength: {
            type: "f",
            value: 40
        },
        fStop: {
            type: "f",
            value: 2.8
        },
        maxblur: {
            type: "f",
            value: 1
        },
        randomSeed: {
            type: "f",
            value: 0
        },
        highQuality: {
            type: "i",
            value: 0
        },
        viewportResolution: {
            type: "v2",
            value: new THREE.Vector2(256,256)
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["#define PI    3.14159", "#define PI2   6.28318", "varying vec2 vUv;", "uniform sampler2D tColor;", "uniform sampler2D tDepth;", "uniform float maxblur;", "uniform float focalDepth;", "uniform float focalLength;", "uniform float fStop;", "uniform float filmSize;", "uniform float randomSeed;", "uniform vec2 viewportResolution;", "uniform float zNear;", "uniform float zFar;", "uniform int highQuality;", "float unpackDepth( const in vec4 rgba_depth ) {", "const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );", "float depth = dot( rgba_depth, bit_shift );", "return depth;", "}", "highp float rand(vec2 co) {", "highp float a = 12.9898;", "highp float b = 78.233;", "highp float c = 43758.5453;", "highp float dt= dot(co.xy + vec2( randomSeed ),vec2(a,b));", "highp float sn= mod(dt,3.14159265359);", "return fract(sin(sn) * c);", "}", "float getViewSpaceZ(float depth) {", "#ifdef LINEAR_DEPTH_BUFFER", "    return zNear + (zFar - zNear) * depth;", "#else", "    return ( zFar * zNear ) / ( depth * ( zNear - zFar ) + zFar );", "#endif", "}", "float circleOfConfusion(float depth) {", "float A = focalLength / fStop;", "float C = A * abs( depth - focalDepth ) / depth;", "float m = focalLength / ( focalDepth * 1000.0 - focalLength );", "float c = m * C;", "return clamp( abs( c / filmSize ), 0.0, 1.0 );", "}", "float toDepth( vec2 uv ) { return getViewSpaceZ( unpackDepth( texture2D( tDepth, uv ) ) ); }", "void lowQualityDOF() {", "float random = rand( vUv );", "float zDepth = toDepth( vUv );", "float blurRadius = circleOfConfusion( zDepth );", "vec4 color = texture2D( tColor, vUv );", "vec4 colorSum = vec4( 0.0 );", "float numSamples = float( NUM_SAMPLES );", "float numRings = float( NUM_RINGS );", "float alphaStep = 1.0 / numSamples;", "float alpha = 0.0;", "float weightSum = 0.0;", "float maxBlurRelative = maxblur / viewportResolution.x;", "for( int i = 0; i < NUM_SAMPLES; i ++ ) {", "float angle = PI2 * ( numRings * alpha + random );", "float currentRadius = maxBlurRelative * pow( clamp( alpha, 0.0, 1.0 ), 1.0 );", "vec2 offset = vec2( cos(angle), sin(angle) ) * currentRadius;", "vec2 uv2 = vUv + offset * vec2( 1.0, viewportResolution.x / viewportResolution.y );", "float zDepth2 = toDepth( uv2 );", "float blurRadius2 = circleOfConfusion( zDepth2 );", "float weight = 1.0;// / pow( min( min( blurRadius, maxBlurRelative ), blurRadius2 ), 2.0 );", "if( currentRadius <= min( blurRadius2, blurRadius ) ) {", "colorSum += texture2D( tColor, uv2 ) * weight;", "weightSum += weight;", "} else if( ( zDepth <= zDepth2 ) && ( blurRadius >= blurRadius2 ) && ( currentRadius <= blurRadius ) ) {", "colorSum += texture2D( tColor, uv2 ) * weight;", "weightSum += weight;", "}", "alpha += alphaStep;", "}", "if( weightSum == 0.0 ) {", "gl_FragColor = color;", "return;", "}", "gl_FragColor = colorSum / weightSum;", "}", "void highQualityDOF() {", "float random = rand( vUv );", "float zDepth = toDepth( vUv );", "float blurRadius = circleOfConfusion( zDepth );", "vec4 color = texture2D( tColor, vUv );", "vec4 colorSum = vec4( 0.0 );", "float numSamples = float( NUM_SAMPLES_HQ );", "float numRings = float( NUM_RINGS_HQ );", "float alphaStep = 1.0 / numSamples;", "float alpha = 0.0;", "float weightSum = 0.0;", "float maxBlurRelative = maxblur / viewportResolution.x;", "for( int i = 0; i < NUM_SAMPLES_HQ; i ++ ) {", "float angle = PI2 * ( numRings * alpha + random );", "float currentRadius = maxBlurRelative * pow( clamp( alpha, 0.0, 1.0 ), 1.0 );", "vec2 offset = vec2( cos(angle), sin(angle) ) * currentRadius;", "vec2 uv2 = vUv + offset * vec2( 1.0, viewportResolution.x / viewportResolution.y );", "float zDepth2 = toDepth( uv2 );", "float blurRadius2 = circleOfConfusion( zDepth2 );", "float weight = 1.0;// / pow( min( min( blurRadius, maxBlurRelative ), blurRadius2 ), 2.0 );", "if( currentRadius <= min( blurRadius2, blurRadius ) ) {", "colorSum += texture2D( tColor, uv2 ) * weight;", "weightSum += weight;", "} else if( ( zDepth <= zDepth2 ) && ( blurRadius >= blurRadius2 ) && ( currentRadius <= blurRadius ) ) {", "colorSum += texture2D( tColor, uv2 ) * weight;", "weightSum += weight;", "}", "alpha += alphaStep;", "}", "if( weightSum == 0.0 ) {", "gl_FragColor = color;", "return;", "}", "gl_FragColor = colorSum / weightSum;", "}", "void main() {", "if( highQuality == 1 ) {", "highQualityDOF();", "} else {", "lowQualityDOF();", "}", "}"].join("\n")
};
THREE.FXAAShader = {
    shaderID: "fxaa",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2(1 / 1024,1 / 512)
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform vec2 resolution;", "varying vec2 vUv;", "#define FXAA_REDUCE_MIN   (1.0/128.0)", "#define FXAA_REDUCE_MUL   (1.0/8.0)", "#define FXAA_SPAN_MAX     8.0", "void main() {", "vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;", "vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;", "vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;", "vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;", "vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );", "vec3 rgbM  = rgbaM.xyz;", "vec3 luma = vec3( 0.299, 0.587, 0.114 );", "float lumaNW = dot( rgbNW, luma );", "float lumaNE = dot( rgbNE, luma );", "float lumaSW = dot( rgbSW, luma );", "float lumaSE = dot( rgbSE, luma );", "float lumaM  = dot( rgbM,  luma );", "float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );", "float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );", "vec2 dir;", "dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));", "dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));", "float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );", "float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );", "dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),", "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),", "dir * rcpDirMin)) * resolution;", "vec4 rgbA = (1.0/2.0) * (", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));", "vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));", "float lumaB = dot(rgbB, vec4(luma, 0.0));", "if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {", "gl_FragColor = rgbA;", "} else {", "gl_FragColor = rgbB;", "}", "}"].join("\n")
};
THREE.FilmShader = {
    shaderID: "film",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        time: {
            type: "f",
            value: 0
        },
        nIntensity: {
            type: "f",
            value: .5
        },
        sIntensity: {
            type: "f",
            value: .05
        },
        sCount: {
            type: "f",
            value: 4096
        },
        grayscale: {
            type: "i",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float time;", "uniform bool grayscale;", "uniform float nIntensity;", "uniform float sIntensity;", "uniform float sCount;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 cTextureScreen = texture2D( tDiffuse, vUv );", "float x = vUv.x * vUv.y * time *  1000.0;", "x = mod( x, 13.0 ) * mod( x, 123.0 );", "float dx = mod( x, 0.01 );", "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );", "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );", "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;", "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );", "if( grayscale ) {", "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );", "}", "gl_FragColor =  vec4( cResult, cTextureScreen.a );", "}"].join("\n")
};
THREE.LinearDepthShader = {
    shaderID: "linearDepth",
    uniforms: {
        zNear: {
            type: "f",
            value: 1
        },
        zFar: {
            type: "f",
            value: 1e3
        }
    },
    vertexShader: [THREE.ShaderChunk["common"], THREE.ShaderChunk["morphtarget_pars_vertex"], THREE.ShaderChunk["skinning_pars_vertex"], THREE.ShaderChunk["logdepthbuf_pars_vertex"], "varying vec3 vPosition;", "void main() {", THREE.ShaderChunk["skinbase_vertex"], THREE.ShaderChunk["morphtarget_vertex"], THREE.ShaderChunk["skinning_vertex"], THREE.ShaderChunk["default_vertex"], THREE.ShaderChunk["logdepthbuf_vertex"], "vPosition = -mvPosition.xyz;", "}"].join("\n"),
    fragmentShader: [THREE.ShaderChunk["common"], THREE.ShaderChunk["logdepthbuf_pars_fragment"], "uniform float zNear;", "uniform float zFar;", "varying vec3 vPosition;", "vec4 pack_depth( const in float depth ) {", " const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );", " const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );", " vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );", " res -= res.xxyz * bit_mask;", " return res;", "}", "void main() {", THREE.ShaderChunk["logdepthbuf_fragment"], "#ifdef LINEAR_DEPTH_BUFFER", "float depthBufferZ = clamp( (vPosition.z - zNear) / (zFar - zNear), 0.0, 1.0 );", "#else", "float depthBufferZ = zFar * ( vPosition.z - zNear ) / ( vPosition.z * ( zFar - zNear ) );", "#endif", "gl_FragData[ 0 ] = pack_depth( depthBufferZ );", "}"].join("\n")
};
THREE.LuminosityHighPassShader = {
    shaderID: "luminosityHighPass",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        luminosityThreshold: {
            type: "f",
            value: 1
        },
        smoothWidth: {
            type: "f",
            value: 1
        },
        defaultColor: {
            type: "c",
            value: new THREE.Color(0)
        },
        defaultOpacity: {
            type: "f",
            value: 0
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform vec3 defaultColor;", "uniform float defaultOpacity;", "uniform float luminosityThreshold;", "uniform float smoothWidth;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "vec3 luma = vec3( 0.299, 0.587, 0.114 );", "float v = dot( texel.xyz, luma );", "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );", "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );", "gl_FragColor = mix( outputColor, texel, alpha );", "}"].join("\n")
};
THREE.LuminosityShader = {
    shaderID: "luminosity",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "vec3 luma = vec3( 0.299, 0.587, 0.114 );", "float v = dot( texel.xyz, luma );", "gl_FragColor = vec4( v, v, v, texel.w );", "}"].join("\n")
};
THREE.MSAA4Shader = {
    shaderID: "msaa",
    uniforms: {
        tBackground: {
            type: "t",
            value: null
        },
        tSample0: {
            type: "t",
            value: null
        },
        tSample1: {
            type: "t",
            value: null
        },
        nSamples: {
            type: "i",
            value: 4
        },
        scale: {
            type: "f",
            value: 1
        },
        exposureGain: {
            type: "f",
            value: 1
        },
        whitePoint: {
            type: "f",
            value: 12
        },
        toneMapStyle: {
            type: "i",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tBackground;", "uniform sampler2D tSample0;", "uniform sampler2D tSample1;", "uniform int nSamples;", "uniform float scale;", "uniform int toneMapStyle;", "uniform float exposureGain;", "uniform float whitePoint;", "#define A 0.15", "#define B 0.50", "#define C 0.10", "#define D 0.20", "#define E 0.02", "#define F 0.30", "vec3 Uncharted2Tonemap( vec3 x ) {", "return max( ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F, vec3( 0.0 ) );", "}", "vec3 ToneMap( vec3 color ) {", "color.rgb *= exposureGain;", "if( toneMapStyle == 1 ) {", "return pow( clamp( color.rgb, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "} else if( toneMapStyle == 2 ) {", "color.rgb = color.rgb / ( 1.0 + color.rgb );", "return pow( clamp( color.rgb, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "} else if( toneMapStyle == 3 ) {", "vec3 x = max( vec3( 0.0 ), color.rgb - 0.004 );", "return ( x * ( 6.2 * x + 0.5 ) ) / ( x * ( 6.2 * x + 1.7 ) + 0.06 );", "} else if( toneMapStyle == 4 ) {", "vec3 curr = Uncharted2Tonemap( color.rgb );", "vec3 whiteScale = vec3( 1.0 ) / Uncharted2Tonemap( vec3( whitePoint ) );", "vec3 currAdjusted = curr.rgb * whiteScale;", "return pow( clamp( currAdjusted, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "}", "return color;", "}", "vec3 composite( vec4 foreground, vec4 background ) {", "return mix( background.rgb * background.a, foreground.rgb, foreground.a );", "}", "vec4 compositeToneMap( vec4 foreground, vec4 background ) {", "return vec4( ToneMap( composite( foreground, background ) ), background.a * ( 1.0 - foreground.a ) + foreground.a );", "}", "void main() {", "vec4 background = texture2D( tBackground, vUv );", "vec4 foreground = vec4( 0.0 );", "foreground += compositeToneMap( texture2D( tSample0, vUv ), background );", "if( scale < 0.9 ) {", "foreground += compositeToneMap( texture2D( tSample1, vUv ), background );", "}", "gl_FragColor = vec4( foreground.rgb * scale, foreground.a * scale );", "}"].join("\n")
};
THREE.NormalShader = {
    shaderID: "normal",
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["bumpmap"], THREE.UniformsLib["normalmap"], {}]),
    vertexShader: [THREE.ShaderChunk["common"], THREE.ShaderChunk["morphtarget_pars_vertex"], THREE.ShaderChunk["skinning_pars_vertex"], "varying vec3 vPosition;", "varying vec3 vNormal;", "void main() {", THREE.ShaderChunk["morphnormal_vertex"], THREE.ShaderChunk["skinbase_vertex"], THREE.ShaderChunk["skinnormal_vertex"], THREE.ShaderChunk["defaultnormal_vertex"], THREE.ShaderChunk["morphtarget_vertex"], THREE.ShaderChunk["skinning_vertex"], THREE.ShaderChunk["default_vertex"], "vNormal = normalize( transformedNormal );", "vPosition = -mvPosition.xyz;", "}"].join("\n"),
    fragmentShader: [THREE.ShaderChunk["common"], THREE.ShaderChunk["logdepthbuf_pars_fragment"], THREE.ShaderChunk["bumpmap_pars_fragment"], THREE.ShaderChunk["normalmap_pars_fragment"], "varying vec3 vPosition;", "varying vec3 vNormal;", "vec4 pack_normal( const in vec3 normal ) {", "return vec4( clamp( normal * 0.5 + vec3( 0.5 ), vec3( 0.0 ), vec3( 1.0 ) ), 1.0 );", "}", "void main() {", "#ifdef USE_NORMALMAP", "normal = perturbNormal2Arb( -vPosition, normal );", "#endif", "#if defined( USE_BUMPMAP )", "normal = perturbNormalArb( -vPosition, normal, dHdxy_fwd() );", "#endif", "vec3 normal = vNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );", "gl_FragColor = pack_normal( normal );", "}"].join("\n")
};
THREE.SAOShader = {
    shaderID: "soa",
    defines: {
        NUM_SAMPLES: 8,
        NUM_RINGS: 3,
        NUM_SAMPLES_HQ: 16,
        NUM_RINGS_HQ: 5
    },
    uniforms: {
        tDepth: {
            type: "t",
            value: null
        },
        tNormal: {
            type: "t",
            value: null
        },
        tDiffuse: {
            type: "t",
            value: null
        },
        scale: {
            type: "f",
            value: 24
        },
        intensity: {
            type: "f",
            value: 1
        },
        bias: {
            type: "f",
            value: .1
        },
        randomSeed: {
            type: "f",
            value: 0
        },
        sampleRadiusPixels: {
            type: "f",
            value: 15
        },
        msaaOffsets: {
            type: "v2v",
            value: [new THREE.Vector2(0,0)]
        },
        highQuality: {
            type: "i",
            value: 0
        },
        zNear: {
            type: "f",
            value: 1
        },
        zFar: {
            type: "f",
            value: 1e3
        },
        viewportResolution: {
            type: "v2",
            value: new THREE.Vector2(256,256)
        },
        projMatrix: {
            type: "m4",
            value: new THREE.Matrix4
        },
        projMatrixInv: {
            type: "m4",
            value: new THREE.Matrix4
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["#extension GL_OES_standard_derivatives : enable", "#define PI    3.14159", "#define PI2   6.28318", "#define MIN_RESOLUTION         0.0002", "varying vec2 vUv;", "uniform sampler2D tDepth;", "uniform sampler2D tNormal;", "uniform sampler2D tDiffuse;", "uniform mat4 projMatrix;", "uniform mat4 projMatrixInv;", "uniform float scale;", "uniform float intensity;", "uniform float bias;", "uniform float sampleRadiusPixels;", "uniform float zNear;", "uniform float zFar;", "uniform float randomSeed;", "uniform int highQuality;", "uniform vec2 viewportResolution;", "uniform vec2 msaaOffsets[NUM_SAMPLES];", "float unpackDepth( const in vec4 rgba_depth ) {", "const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );", "float depth = dot( rgba_depth, bit_shift );", "return depth;", "}", "vec3 unpackNormal( const in vec4 rgba_normal ) {", "return - ( rgba_normal.xyz * 2.0 - vec3( 1.0 ) );", "}", "float getViewSpaceZ(float depth) {", "#ifdef LINEAR_DEPTH_BUFFER", "    return zNear + (zFar - zNear) * depth;", "#else", "    return ( zFar * zNear ) / ( depth * ( zNear - zFar ) + zFar );", "#endif", "}", "vec3 getViewSpacePosition(vec2 screenSpacePosition ) {", "   float depth = unpackDepth( texture2D( tDepth, screenSpacePosition ) );", "   float viewSpaceZ = getViewSpaceZ( depth );", "   float w = projMatrix[2][3] * viewSpaceZ + projMatrix[3][3];", "   vec3 clipPos = ( vec3( screenSpacePosition, depth ) - 0.5 ) * 2.0;", "   return ( projMatrixInv * vec4( w * clipPos.xyz, w ) ).xyz;", "}", "vec3 getViewSpaceNormal( vec2 vUv ) {", "    return normalize( unpackNormal( texture2D( tNormal, vUv ) ) );", "}", "vec3 getViewSpaceNormalFromDepth(vec3 viewSpacePosition ) {", "    return normalize( cross(dFdy(viewSpacePosition), dFdx(viewSpacePosition)) );", "}", "float square(float a) {", "    return a*a;", "}", "float getOcclusion( vec3 viewSpacePosition, vec3 viewSpaceNormal, vec3 viewSpacePositionOffset ) {", "vec3 viewSpaceDelta = viewSpacePositionOffset - viewSpacePosition;", "float viewSpaceDistance = length( viewSpaceDelta );", "float distance = scale * viewSpaceDistance / zFar;", "return intensity * max(0.0, (dot(viewSpaceNormal, viewSpaceDelta) - MIN_RESOLUTION * zFar) / viewSpaceDistance - bias) / (1.0 + square( viewSpaceDistance ) );", "}", "highp float rand(vec2 co) {", "highp float a = 12.9898;", "highp float b = 78.233;", "highp float c = 43758.5453;", "highp float dt= dot(co.xy + vec2( randomSeed ),vec2(a,b));", "highp float sn= mod(dt,3.14159265359);", "return fract(sin(sn) * c);", "}", "float basicPattern( vec3 viewSpacePosition ) {", "vec3 viewSpaceNormal  = getViewSpaceNormal( vUv );", "float random = rand( vUv );", "vec2 radius = vec2( sampleRadiusPixels ) / viewportResolution;", "float numSamples = float( NUM_SAMPLES );", "float numRings = float( NUM_RINGS );", "float alphaStep = 1.0 / numSamples;", "float occlusionSum = 0.0;", "float alpha = 0.0;", "float weight = 0.0;", "for( int i = 0; i < NUM_SAMPLES; i ++ ) {", "float angle = PI2 * ( numRings * alpha + random );", "vec2 currentRadius = radius * ( 0.1 + alpha * 0.9 );", "vec2 offset = vec2( cos(angle), sin(angle) ) * currentRadius;", "alpha += alphaStep;", "vec3 viewSpacePositionOffset = getViewSpacePosition( vUv + offset );", "if( viewSpacePositionOffset.z >= zFar ) {", "continue;", "}", "occlusionSum += getOcclusion( viewSpacePosition, viewSpaceNormal, viewSpacePositionOffset );", "weight += 1.0;", "}", "if( weight == 0.0 ) return 0.0;", "return occlusionSum / weight;", "}", "float jitterPattern() {", "float random = rand( vUv );", "vec2 radius = vec2( sampleRadiusPixels ) / viewportResolution;", "float numSamples = float( NUM_SAMPLES_HQ );", "float numRings = float( NUM_RINGS_HQ );", "float alphaStep = 1.0 / numSamples;", "float occlusionSum = 0.0;", "float alpha = 0.0;", "float weight = 0.0;", "for( int i = 0; i < NUM_SAMPLES_HQ; i ++ ) {", "float angle = PI2 * ( numRings * alpha + random );", "vec2 currentRadius = radius * ( 0.1 + alpha * 0.9 );", "vec2 offset = vec2( cos(angle), sin(angle) ) * currentRadius;", "vec2 vUvJitter = vUv;", "alpha += alphaStep;", "vUvJitter += 1.25 * msaaOffsets[ i ] / viewportResolution;", "vec3 viewSpacePosition = getViewSpacePosition( vUvJitter );", "if( viewSpacePosition.z >= zFar ) {", "continue;", "}", "vec3 viewSpacePositionOffset = getViewSpacePosition( vUvJitter + offset );", "if( viewSpacePositionOffset.z >= zFar ) {", "continue;", "}", "vec3 viewSpaceNormal = getViewSpaceNormal( vUvJitter );", "occlusionSum += getOcclusion( viewSpacePosition, viewSpaceNormal, viewSpacePositionOffset );", "weight += 1.0;", "}", "if( weight == 0.0 ) return 0.0;", "return occlusionSum / weight;", "}", "void main() {", "  vec4 color = texture2D( tDiffuse, vUv );", "  vec3 viewSpacePosition = getViewSpacePosition( vUv );", "  if( viewSpacePosition.z >= zFar ) {", "   gl_FragColor = color;", "   return;", "  }", "float occlusion = 0.0;", "if( highQuality == 1 ) {", "occlusion = jitterPattern();", "}", "else {", "occlusion = basicPattern( viewSpacePosition );", "}", "gl_FragColor = color * vec4( vec3( 1.0 - occlusion ), 1.0 );", "}"].join("\n")
};
THREE.SSAOShader = {
    shaderID: "ssao",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        tDepth: {
            type: "t",
            value: null
        },
        size: {
            type: "v2",
            value: new THREE.Vector2(512,512)
        },
        cameraNear: {
            type: "f",
            value: 1
        },
        cameraFar: {
            type: "f",
            value: 100
        },
        onlyAO: {
            type: "i",
            value: 0
        },
        aoClamp: {
            type: "f",
            value: .5
        },
        lumInfluence: {
            type: "f",
            value: .5
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float cameraNear;", "uniform float cameraFar;", "uniform bool onlyAO;", "uniform vec2 size;", "uniform float aoClamp;", "uniform float lumInfluence;", "uniform sampler2D tDiffuse;", "uniform sampler2D tDepth;", "varying vec2 vUv;", "#define DL 2.399963229728653", "#define EULER 2.718281828459045", "float width = size.x;", "float height = size.y;", "float cameraFarPlusNear = cameraFar + cameraNear;", "float cameraFarMinusNear = cameraFar - cameraNear;", "float cameraCoef = 2.0 * cameraNear;", "const int samples = 8;", "const float radius = 5.0;", "const bool useNoise = false;", "const float noiseAmount = 0.0003;", "const float diffArea = 0.4;", "const float gDisplace = 0.4;", "float unpackDepth( const in vec4 rgba_depth ) {", "const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );", "float depth = dot( rgba_depth, bit_shift );", "return depth;", "}", "vec2 rand( const vec2 coord ) {", "vec2 noise;", "if ( useNoise ) {", "float nx = dot ( coord, vec2( 12.9898, 78.233 ) );", "float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );", "noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );", "} else {", "float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );", "float gg = fract( coord.t * ( height / 2.0 ) );", "noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;", "}", "return ( noise * 2.0  - 1.0 ) * noiseAmount;", "}", "float readDepth( const in vec2 coord ) {", "return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );", "}", "float compareDepths( const in float depth1, const in float depth2, inout int far ) {", "float garea = 2.0;", "float diff = ( depth1 - depth2 ) * 100.0;", "if ( diff < gDisplace ) {", "garea = diffArea;", "} else {", "far = 1;", "}", "float dd = diff - gDisplace;", "float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );", "return gauss;", "}", "float calcAO( float depth, float dw, float dh ) {", "float dd = radius - depth * radius;", "vec2 vv = vec2( dw, dh );", "vec2 coord1 = vUv + dd * vv;", "vec2 coord2 = vUv - dd * vv;", "float temp1 = 0.0;", "float temp2 = 0.0;", "int far = 0;", "temp1 = compareDepths( depth, readDepth( coord1 ), far );", "if ( far > 0 ) {", "temp2 = compareDepths( readDepth( coord2 ), depth, far );", "temp1 += ( 1.0 - temp1 ) * temp2;", "}", "return temp1;", "}", "void main() {", "vec2 noise = rand( vUv );", "float depth = readDepth( vUv );", "float tt = clamp( depth, aoClamp, 1.0 );", "float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );", "float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );", "float ao = 0.0;", "float dz = 1.0 / float( samples );", "float z = 1.0 - dz / 2.0;", "float l = 0.0;", "for ( int i = 0; i <= samples; i ++ ) {", "float r = sqrt( 1.0 - z );", "float pw = cos( l ) * r;", "float ph = sin( l ) * r;", "ao += calcAO( depth, pw * w, ph * h );", "z = z - dz;", "l = l + DL;", "}", "ao /= float( samples );", "ao = 1.0 - ao;", "vec3 color = texture2D( tDiffuse, vUv ).rgb;", "vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );", "float lum = dot( color.rgb, lumcoeff );", "vec3 luminance = vec3( lum );", "vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", "if ( onlyAO ) {", "final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", "}", "gl_FragColor = vec4( final, 1.0 );", "}"].join("\n")
};
THREE.SepiaShader = {
    shaderID: "sepia",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        amount: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float amount;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 color = texture2D( tDiffuse, vUv );", "vec3 c = color.rgb;", "color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );", "color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );", "color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );", "gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );", "}"].join("\n"),
    depthTest: false
};
THREE.ToneMap2Shader = {
    shaderID: "tonemap2",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        exposureGain: {
            type: "f",
            value: 1
        },
        whitePoint: {
            type: "f",
            value: 12
        },
        toneMapStyle: {
            type: "i",
            value: 0
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "uniform float exposureGain;", "uniform float whitePoint;", "uniform int toneMapStyle;", "#define A 0.15", "#define B 0.50", "#define C 0.10", "#define D 0.20", "#define E 0.02", "#define F 0.30", "vec3 Uncharted2Tonemap( vec3 x ) {", "return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;", "}", "vec3 ToneMap( vec3 color ) {", "color *= exposureGain;", "if( toneMapStyle == 1 ) {", "return pow( clamp( color, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "} else if( toneMapStyle == 2 ) {", "color = color / ( 1.0 + color );", "return pow( clamp( color, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "} else if( toneMapStyle == 3 ) {", "vec3 x = max( vec3( 0.0 ), color - 0.004 );", "return ( x * ( 6.2 * x + 0.5 ) ) / ( x * ( 6.2 * x + 1.7 ) + 0.06 );", "} else if( toneMapStyle == 4 ) {", "vec3 curr = Uncharted2Tonemap( color );", "vec3 whiteScale = vec3( 1.0 ) / Uncharted2Tonemap( vec3( whitePoint ) );", "vec3 currAdjusted = curr * whiteScale;", "return pow( clamp( currAdjusted, vec3(0.0), vec3(1.0) ), vec3( 1.0 / 2.2 ) );", "}", "return color;", "}", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );", "}"].join("\n")
};
THREE.ToneMapShader = {
    shaderID: "tonemap",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        averageLuminance: {
            type: "f",
            value: 1
        },
        luminanceMap: {
            type: "t",
            value: null
        },
        maxLuminance: {
            type: "f",
            value: 16
        },
        middleGrey: {
            type: "f",
            value: .6
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "uniform float middleGrey;", "uniform float maxLuminance;", "#ifdef ADAPTED_LUMINANCE", "uniform sampler2D luminanceMap;", "#else", "uniform float averageLuminance;", "#endif", "const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);", "vec3 ToneMap( vec3 vColor ) {", "#ifdef ADAPTED_LUMINANCE", "float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;", "#else", "float fLumAvg = averageLuminance;", "#endif", "float fLumPixel = dot(vColor, LUM_CONVERT);", "float fLumScaled = (fLumPixel * middleGrey) / fLumAvg;", "float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);", "return fLumCompressed * vColor;", "}", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );", "gl_FragColor.xyz = sqrt( gl_FragColor.xyz );", "}"].join("\n")
};
THREE.VignetteShader = {
    shaderID: "vignette",
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        offset: {
            type: "f",
            value: 1
        },
        darkness: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float offset;", "uniform float darkness;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );", "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );", "}"].join("\n"),
    depthTest: false
};
THREE.AdaptiveToneMappingPass = function(adaptive, resolution) {
    this.resolution = resolution !== undefined ? resolution : 256;
    this.needsInit = true;
    this.adaptive = adaptive !== undefined ? !!adaptive : true;
    this.luminanceRT = null ;
    this.previousLuminanceRT = null ;
    this.currentLuminanceRT = null ;
    if (THREE.CopyShader === undefined)
        console.error("THREE.AdaptiveToneMappingPass relies on THREE.CopyShader");
    var copyShader = THREE.CopyShader;
    this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
    this.materialCopy = new THREE.ShaderMaterial({
        shaderID: copyShader.shaderID,
        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: THREE.NoBlending,
        depthTest: false
    });
    if (THREE.LuminosityShader === undefined)
        console.error("THREE.AdaptiveToneMappingPass relies on THREE.LuminosityShader");
    this.materialLuminance = new THREE.ShaderMaterial({
        uniforms: THREE.LuminosityShader.uniforms,
        vertexShader: THREE.LuminosityShader.vertexShader,
        fragmentShader: THREE.LuminosityShader.fragmentShader,
        blending: THREE.NoBlending
    });
    this.adaptLuminanceShader = {
        defines: {
            MIP_LEVEL_1X1: (Math.log(this.resolution) / Math.log(2)).toFixed(1)
        },
        uniforms: {
            lastLum: {
                type: "t",
                value: null
            },
            currentLum: {
                type: "t",
                value: null
            },
            delta: {
                type: "f",
                value: .016
            },
            tau: {
                type: "f",
                value: 1
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
        fragmentShader: ["varying vec2 vUv;", "uniform sampler2D lastLum;", "uniform sampler2D currentLum;", "uniform float delta;", "uniform float tau;", "void main() {", "vec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );", "vec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );", "float fLastLum = lastLum.r;", "float fCurrentLum = currentLum.r;", "fCurrentLum *= fCurrentLum;", "float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));", "gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );", "}"].join("\n")
    };
    this.materialAdaptiveLum = new THREE.ShaderMaterial({
        uniforms: this.adaptLuminanceShader.uniforms,
        vertexShader: this.adaptLuminanceShader.vertexShader,
        fragmentShader: this.adaptLuminanceShader.fragmentShader,
        defines: this.adaptLuminanceShader.defines,
        blending: THREE.NoBlending
    });
    if (THREE.ToneMapShader === undefined)
        console.error("THREE.AdaptiveToneMappingPass relies on THREE.ToneMapShader");
    this.materialToneMap = new THREE.ShaderMaterial({
        uniforms: THREE.ToneMapShader.uniforms,
        vertexShader: THREE.ToneMapShader.vertexShader,
        fragmentShader: THREE.ToneMapShader.fragmentShader,
        blending: THREE.NoBlending
    });
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene.add(this.quad)
}
;
THREE.AdaptiveToneMappingPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (this.needsInit) {
            this.reset(renderer);
            this.luminanceRT.type = readBuffer.type;
            this.previousLuminanceRT.type = readBuffer.type;
            this.currentLuminanceRT.type = readBuffer.type;
            this.needsInit = false
        }
        if (this.adaptive) {
            this.quad.material = this.materialLuminance;
            this.materialLuminance.uniforms.tDiffuse.value = readBuffer;
            renderer.render(this.scene, this.camera, this.currentLuminanceRT);
            this.quad.material = this.materialAdaptiveLum;
            this.materialAdaptiveLum.uniforms.delta.value = delta;
            this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT;
            this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT;
            renderer.render(this.scene, this.camera, this.luminanceRT);
            this.quad.material = this.materialCopy;
            this.copyUniforms.tDiffuse.value = this.luminanceRT;
            renderer.render(this.scene, this.camera, this.previousLuminanceRT)
        }
        this.quad.material = this.materialToneMap;
        this.materialToneMap.uniforms.tDiffuse.value = readBuffer;
        renderer.render(this.scene, this.camera, writeBuffer, this.clear)
    },
    reset: function(renderer) {
        if (this.luminanceRT) {
            this.luminanceRT.dispose()
        }
        if (this.currentLuminanceRT) {
            this.currentLuminanceRT.dispose()
        }
        if (this.previousLuminanceRT) {
            this.previousLuminanceRT.dispose()
        }
        var pars = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat
        };
        this.luminanceRT = new THREE.WebGLRenderTarget(this.resolution,this.resolution,pars,"luminanceRT");
        this.luminanceRT.generateMipmaps = false;
        this.previousLuminanceRT = new THREE.WebGLRenderTarget(this.resolution,this.resolution,pars,"previousLuminanceRT");
        this.previousLuminanceRT.generateMipmaps = false;
        pars.minFilter = THREE.LinearMipMapLinearFilter;
        this.currentLuminanceRT = new THREE.WebGLRenderTarget(this.resolution,this.resolution,pars,"currentLuminanceRT");
        if (this.adaptive) {
            this.materialToneMap.defines["ADAPTED_LUMINANCE"] = "";
            this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT
        }
        this.quad.material = new THREE.MeshBasicMaterial({
            color: 7829367
        });
        this.materialLuminance.needsUpdate = true;
        this.materialAdaptiveLum.needsUpdate = true;
        this.materialToneMap.needsUpdate = true
    },
    setAdaptive: function(adaptive) {
        if (adaptive) {
            this.adaptive = true;
            this.materialToneMap.defines["ADAPTED_LUMINANCE"] = "";
            this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT
        } else {
            this.adaptive = false;
            delete this.materialToneMap.defines["ADAPTED_LUMINANCE"];
            this.materialToneMap.uniforms.luminanceMap.value = undefined
        }
        this.materialToneMap.needsUpdate = true
    },
    setAdaptionRate: function(rate) {
        if (rate) {
            this.materialAdaptiveLum.uniforms.tau.value = Math.abs(rate)
        }
    },
    setMaxLuminance: function(maxLum) {
        if (maxLum) {
            this.materialToneMap.uniforms.maxLuminance.value = maxLum
        }
    },
    setAverageLuminance: function(avgLum) {
        if (avgLum) {
            this.materialToneMap.uniforms.averageLuminance.value = avgLum
        }
    },
    setMiddleGrey: function(middleGrey) {
        if (middleGrey) {
            this.materialToneMap.uniforms.middleGrey.value = middleGrey
        }
    },
    dispose: function() {
        if (this.luminanceRT) {
            this.luminanceRT.dispose()
        }
        if (this.previousLuminanceRT) {
            this.previousLuminanceRT.dispose()
        }
        if (this.currentLuminanceRT) {
            this.currentLuminanceRT.dispose()
        }
        if (this.materialLuminance) {
            this.materialLuminance.dispose()
        }
        if (this.materialAdaptiveLum) {
            this.materialAdaptiveLum.dispose()
        }
        if (this.materialCopy) {
            this.materialCopy.dispose()
        }
        if (this.materialToneMap) {
            this.materialToneMap.dispose()
        }
    }
};
THREE.BloomPass = function(strength, kernelSize, sigma, luminosityThreshold, smoothWidth, params) {
    strength = strength !== undefined ? strength : 1;
    kernelSize = kernelSize !== undefined ? kernelSize : 25;
    luminosityThreshold = luminosityThreshold !== undefined ? luminosityThreshold : 1;
    smoothWidth = smoothWidth !== undefined ? smoothWidth : 1;
    this.params = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    };
    if (THREE.CopyShader === undefined)
        console.error("THREE.BloomPass relies on THREE.CopyShader");
    var copyShader = THREE.CopyShader;
    this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
    this.copyUniforms["opacity"].value = strength;
    this.materialCopy = new THREE.ShaderMaterial({
        shaderID: copyShader.shaderID,
        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendEquation: THREE.AddEquation,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    if (THREE.ConvolutionShader === undefined)
        console.error("THREE.BloomPass relies on THREE.ConvolutionShader");
    var convolutionShader = THREE.ConvolutionShader;
    this.convolutionUniforms = THREE.UniformsUtils.clone(convolutionShader.uniforms);
    this.convolutionUniforms["cKernel"].value = THREE.ConvolutionShader.buildKernel(kernelSize);
    this.materialConvolution = new THREE.ShaderMaterial({
        shaderID: convolutionShader.shaderID,
        uniforms: this.convolutionUniforms,
        vertexShader: convolutionShader.vertexShader,
        fragmentShader: convolutionShader.fragmentShader,
        defines: {
            KERNEL_SIZE_FLOAT: kernelSize.toFixed(1),
            KERNEL_SIZE_INT: kernelSize.toFixed(0)
        }
    });
    if (THREE.LuminosityHighPassShader === undefined)
        console.error("THREE.BloomPass relies on THREE.LuminosityHighPassShader");
    var highPassShader = THREE.LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone(highPassShader.uniforms);
    this.highPassUniforms["luminosityThreshold"].value = luminosityThreshold;
    this.highPassUniforms["smoothWidth"].value = smoothWidth;
    this.materialHighPassFilter = new THREE.ShaderMaterial({
        shaderID: highPassShader.shaderID,
        uniforms: this.highPassUniforms,
        vertexShader: highPassShader.vertexShader,
        fragmentShader: highPassShader.fragmentShader,
        defines: {}
    });
    this.enabled = true;
    this.needsSwap = false;
    this.clear = false;
    this.oldClearColor = new THREE.Color;
    this.oldClearAlpha = 1;
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene.add(this.quad)
}
;
THREE.BloomPass.prototype = {
    dispose: function() {
        if (this.renderTargetA) {
            this.renderTargetA.dispose();
            this.renderTargetA = null
        }
        if (this.renderTargetB) {
            this.renderTargetB.dispose();
            this.renderTargetB = null
        }
    },
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        var blurResolution = new THREE.Vector2(readBuffer.width / 2,readBuffer.height / 2);
        if (!this.renderTargetA) {
            this.renderTargetA = new THREE.WebGLRenderTarget(blurResolution.x,blurResolution.y,this.params,"bloom.renderTargetA")
        }
        if (!this.renderTargetB) {
            this.renderTargetB = new THREE.WebGLRenderTarget(blurResolution.x,blurResolution.y,this.params,"bloom.renderTargetB")
        }
        this.oldClearColor.copy(renderer.getClearColor());
        this.oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color(0,0,0), 0);
        if (maskActive)
            renderer.context.disable(renderer.context.STENCIL_TEST);
        this.highPassUniforms["tDiffuse"].value = readBuffer;
        this.quad.material = this.materialHighPassFilter;
        renderer.render(this.scene, this.camera, this.renderTargetA, true);
        this.quad.material = this.materialConvolution;
        this.convolutionUniforms["tDiffuse"].value = this.renderTargetA;
        this.convolutionUniforms["uImageIncrement"].value = new THREE.Vector2(1 / blurResolution.x,0);
        renderer.render(this.scene, this.camera, this.renderTargetB, true);
        this.convolutionUniforms["tDiffuse"].value = this.renderTargetB;
        this.convolutionUniforms["uImageIncrement"].value = new THREE.Vector2(0,1 / blurResolution.y);
        renderer.render(this.scene, this.camera, this.renderTargetA, true);
        this.quad.material = this.materialCopy;
        this.copyUniforms["tDiffuse"].value = this.renderTargetA;
        if (maskActive)
            renderer.context.enable(renderer.context.STENCIL_TEST);
        renderer.render(this.scene, this.camera, readBuffer, false);
        renderer.setClearColor(this.oldClearColor, this.oldClearAlpha)
    }
};
THREE.DOFPass = function(scene, camera, params) {
    this.scene = scene;
    this.camera = camera;
    var focus = params.focus !== undefined ? params.focus : 1;
    var fStop = params.fStop !== undefined ? params.fStop : 2.8;
    var focalLength = params.focalLength !== undefined ? params.focalLength : 40;
    var filmSize = params.filmSize !== undefined ? params.filmSize : 40;
    var maxblur = params.maxblur !== undefined ? params.maxblur : 1;
    this.materialDepth = new THREE.ShaderMaterial(THREE.ShaderLib.depthRGBA);
    if (THREE.DOFShader === undefined) {
        console.error("THREE.DOFPass relies on THREE.DOFShader")
    }
    var dofShader = THREE.DOFShader;
    var dofUniforms = THREE.UniformsUtils.clone(dofShader.uniforms);
    dofUniforms["focalDepth"].value = focus;
    dofUniforms["maxblur"].value = maxblur;
    dofUniforms["zNear"].value = camera.near;
    dofUniforms["zFar"].value = camera.far;
    dofUniforms["fStop"].value = fStop;
    dofUniforms["focalLength"].value = focalLength;
    dofUniforms["filmSize"].value = filmSize;
    this.materialDOF = new THREE.ShaderMaterial({
        shaderID: dofShader.shaderID,
        defines: _.clone(dofShader.defines),
        uniforms: dofUniforms,
        vertexShader: dofShader.vertexShader,
        fragmentShader: dofShader.fragmentShader,
        blending: THREE.NoBlending,
        depthTest: false
    });
    this.uniforms = dofUniforms;
    this.enabled = true;
    this.needsSwap = true;
    this.renderToScreen = false;
    this.clear = false;
    this.camera2 = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene2 = new THREE.Scene;
    this.quad2 = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene2.add(this.quad2);
    this.oldClearColor = new THREE.Color;
    this.oldClearAlpha = 1
}
;
THREE.DOFPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        this.quad2.material = this.materialDOF;
        if (!this.renderTargetDepth) {
            throw new Error("DOFPass.renderTargetDepth is not set.")
        }
        this.uniforms["tDepth"].value = this.renderTargetDepth;
        this.uniforms["tColor"].value = readBuffer;
        this.uniforms["zNear"].value = this.camera.near;
        this.uniforms["zFar"].value = this.camera.far;
        this.uniforms["viewportResolution"].value = new THREE.Vector2(readBuffer.width,readBuffer.height);
        this.uniforms["randomSeed"].value = 0;
        if (this.renderToScreen) {
            renderer.render(this.scene2, this.camera2)
        } else {
            renderer.render(this.scene2, this.camera2, writeBuffer, this.clear)
        }
    }
};
THREE.DepthPass = function(scene, camera, params) {
    this.scene = scene;
    this.camera = camera;
    this.params = params || {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    };
    this.params.minFilter = THREE.LinearFilter;
    this.params.magFilter = THREE.LinearFilter;
    var depthShader = THREE.LinearDepthShader;
    this.depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);
    this.materialDepth = new THREE.ShaderMaterial({
        shaderID: depthShader.shaderID,
        uniforms: this.depthUniforms,
        vertexShader: depthShader.vertexShader,
        fragmentShader: depthShader.fragmentShader,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending,
        depthTest: true,
        depthWrite: true,
        defines: {}
    });
    this.enabled = true;
    this.needsSwap = false;
    this.clear = false
}
;
THREE.DepthPass.prototype = {
    dispose: function() {
        if (this.renderTargetDepth) {
            this.renderTargetDepth.dispose();
            this.renderTargetDepth = null
        }
    },
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (maskActive)
            renderer.context.disable(renderer.context.STENCIL_TEST);
        if (!this.renderTargetDepth) {
            this.renderTargetDepth = new THREE.WebGLRenderTarget(readBuffer.width,readBuffer.height,this.params,"depth.renderTargetDepth")
        }
        this.depthUniforms["zFar"].value = this.camera.far;
        this.depthUniforms["zNear"].value = this.camera.near;
        this.scene.overrideMaterial = this.materialDepth;
        var oldClearColor = (new THREE.Color).copy(renderer.getClearColor());
        var oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color(1,1,1), 1);
        renderer.render(this.scene, this.camera, this.renderTargetDepth, true);
        this.scene.overrideMaterial = null ;
        if (maskActive)
            renderer.context.enable(renderer.context.STENCIL_TEST);
        renderer.setClearColor(oldClearColor, oldClearAlpha)
    }
};
THREE.FilmPass = function(noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale) {
    if (THREE.FilmShader === undefined)
        console.error("THREE.FilmPass relies on THREE.FilmShader");
    var shader = THREE.FilmShader;
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    });
    if (grayscale !== undefined)
        this.uniforms.grayscale.value = grayscale;
    if (noiseIntensity !== undefined)
        this.uniforms.nIntensity.value = noiseIntensity;
    if (scanlinesIntensity !== undefined)
        this.uniforms.sIntensity.value = scanlinesIntensity;
    if (scanlinesCount !== undefined)
        this.uniforms.sCount.value = scanlinesCount;
    this.enabled = true;
    this.renderToScreen = false;
    this.needsSwap = true;
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),null );
    this.scene.add(this.quad)
}
;
THREE.FilmPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta) {
        this.uniforms["tDiffuse"].value = readBuffer;
        this.uniforms["time"].value += delta;
        this.quad.material = this.material;
        if (this.renderToScreen) {
            renderer.render(this.scene, this.camera)
        } else {
            renderer.render(this.scene, this.camera, writeBuffer, false)
        }
    }
};
THREE.MSAAPass = function(scene, camera, params, clearColor, clearAlpha) {
    this.scene = scene;
    this.camera = camera;
    this.sampleOffsets = [];
    this.sampleOffsets[0] = null ;
    this.sampleOffsets[1] = this.standardDirctX11_MSAA2();
    this.sampleOffsets[2] = this.standardDirctX11_MSAA4();
    this.sampleOffsets[3] = this.standardDirctX11_MSAA8();
    this.sampleOffsets[4] = this.standardDirctX11_MSAA16();
    this.sampleOffsets[5] = this.standardDirctX11_MSAA32();
    this.currentSampleLevel = 4;
    this.params = params || {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    };
    this.params.minFilter = THREE.NearestFilter;
    this.params.maxFilter = THREE.NearestFilter;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 1;
    this.oldClearColor = new THREE.Color;
    this.oldClearAlpha = 1;
    this.enabled = true;
    this.clear = false;
    this.needsSwap = true;
    var msaaShader = THREE.MSAA4Shader;
    this.uniforms = THREE.UniformsUtils.clone(msaaShader.uniforms);
    this.materialMSAA = new THREE.ShaderMaterial({
        shaderID: msaaShader.shaderID,
        uniforms: this.uniforms,
        vertexShader: msaaShader.vertexShader,
        fragmentShader: msaaShader.fragmentShader,
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendEquation: THREE.AddEquation,
        depthTest: false,
        depthWrite: false
    });
    this.camera2 = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene2 = new THREE.Scene;
    this.quad2 = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene2.add(this.quad2);
    this.devicePixelRatio = 1
}
;
THREE.MSAAPass.prototype = {
    dispose: function() {
        if (this.renderTargets) {
            for (var i = 0; i < this.renderTargets.length; i++) {
                this.renderTargets[i].dispose()
            }
            this.renderTargets = null
        }
    },
    render: function(renderer, writeBuffer, readBuffer, delta) {
        if (!this.renderTargets) {
            this.renderTargets = [];
            for (var i = 0; i < 2; i++) {
                this.renderTargets.push(new THREE.WebGLRenderTarget(readBuffer.width,readBuffer.height,this.params,"msaa.renderTarget" + i))
            }
        }
        var camera = this.camera || this.scene.camera;
        var currentSampleOffsets = this.sampleOffsets[Math.max(0, Math.min(this.currentSampleLevel, 5))];
        if (!currentSampleOffsets) {
            renderer.render(this.scene, camera, this.renderTargets[0], true);
            this.uniforms["tBackground"].value = readBuffer;
            this.uniforms["scale"].value = 1;
            for (var k = 0; k < this.renderTargets.length; k++) {
                this.uniforms["tSample" + k].value = this.renderTargets[0]
            }
            this.quad2.material = this.materialMSAA;
            renderer.render(this.scene2, this.camera2, writeBuffer, true);
            return
        }
        this.scene.overrideMaterial = null ;
        this.oldClearColor.copy(renderer.getClearColor());
        this.oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color(0,0,0), 0);
        for (var j = 0; j < currentSampleOffsets.length; j += this.renderTargets.length) {
            this.uniforms["tBackground"].value = readBuffer;
            this.uniforms["scale"].value = 1 / currentSampleOffsets.length;
            for (var k = 0; k < this.renderTargets.length; k++) {
                this.uniforms["tSample" + k].value = this.renderTargets[k]
            }
            this.quad2.material = this.materialMSAA;
            for (var k = 0; k < Math.min(currentSampleOffsets.length - j, this.renderTargets.length); k++) {
                var i = j + k;
                if (camera.setViewOffset) {
                    camera.setViewOffset(readBuffer.width, readBuffer.height, currentSampleOffsets[i].x, currentSampleOffsets[i].y, readBuffer.width, readBuffer.height)
                }
                renderer.render(this.scene, camera, this.renderTargets[k], true)
            }
            renderer.render(this.scene2, this.camera2, writeBuffer, j === 0)
        }
        camera.fullWidth = undefined;
        camera.fullHeight = undefined;
        camera.x = undefined;
        camera.y = undefined;
        camera.width = undefined;
        camera.height = undefined;
        camera.updateProjectionMatrix();
        renderer.setClearColor(this.oldClearColor, this.oldClearAlpha)
    },
    standardDirctX11_MSAA2: function() {
        var vectors = [new THREE.Vector3(4,4,0), new THREE.Vector3(-4,-4,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    },
    standardDirctX11_MSAA4: function() {
        var vectors = [new THREE.Vector3(-2,-6,0), new THREE.Vector3(6,-2,0), new THREE.Vector3(-6,2,0), new THREE.Vector3(2,6,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    },
    standardDirctX11_MSAA8: function() {
        var vectors = [new THREE.Vector3(1,-3,0), new THREE.Vector3(-1,3,0), new THREE.Vector3(5,1,0), new THREE.Vector3(-3,-5,0), new THREE.Vector3(-5,5,0), new THREE.Vector3(-7,-1,0), new THREE.Vector3(3,7,0), new THREE.Vector3(7,-7,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    },
    standardDirctX11_MSAA16: function() {
        var vectors = [new THREE.Vector3(1,1,0), new THREE.Vector3(-1,-3,0), new THREE.Vector3(-3,2,0), new THREE.Vector3(4,-1,0), new THREE.Vector3(-5,-2,0), new THREE.Vector3(2,5,0), new THREE.Vector3(5,3,0), new THREE.Vector3(3,-5,0), new THREE.Vector3(-2,6,0), new THREE.Vector3(0,-7,0), new THREE.Vector3(-4,-6,0), new THREE.Vector3(-6,4,0), new THREE.Vector3(-8,0,0), new THREE.Vector3(7,-4,0), new THREE.Vector3(6,7,0), new THREE.Vector3(-7,-8,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    },
    standardDirctX11_MSAA32: function() {
        var vectors = [new THREE.Vector3(-4,-7,0), new THREE.Vector3(-7,-5,0), new THREE.Vector3(-3,-5,0), new THREE.Vector3(-5,-4,0), new THREE.Vector3(-1,-4,0), new THREE.Vector3(-2,-2,0), new THREE.Vector3(-6,-1,0), new THREE.Vector3(-4,0,0), new THREE.Vector3(-7,1,0), new THREE.Vector3(-1,2,0), new THREE.Vector3(-6,3,0), new THREE.Vector3(-3,3,0), new THREE.Vector3(-7,6,0), new THREE.Vector3(-3,6,0), new THREE.Vector3(-5,7,0), new THREE.Vector3(-1,7,0), new THREE.Vector3(5,-7,0), new THREE.Vector3(1,-6,0), new THREE.Vector3(6,-5,0), new THREE.Vector3(4,-4,0), new THREE.Vector3(2,-3,0), new THREE.Vector3(7,-2,0), new THREE.Vector3(1,-1,0), new THREE.Vector3(4,-1,0), new THREE.Vector3(2,1,0), new THREE.Vector3(6,2,0), new THREE.Vector3(0,4,0), new THREE.Vector3(4,4,0), new THREE.Vector3(2,5,0), new THREE.Vector3(7,5,0), new THREE.Vector3(5,6,0), new THREE.Vector3(3,7,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    }
};
THREE.MaskPass = function(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false
}
;
THREE.MaskPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta) {
        var context = renderer.context;
        context.colorMask(false, false, false, false);
        context.depthMask(false);
        var writeValue, clearValue;
        if (this.inverse) {
            writeValue = 0;
            clearValue = 1
        } else {
            writeValue = 1;
            clearValue = 0
        }
        context.enable(context.STENCIL_TEST);
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.ALWAYS, writeValue, 4294967295);
        context.clearStencil(clearValue);
        renderer.render(this.scene, this.camera, readBuffer, this.clear);
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);
        context.colorMask(true, true, true, true);
        context.depthMask(true);
        context.stencilFunc(context.EQUAL, 1, 4294967295);
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP)
    }
};
THREE.ClearMaskPass = function() {
    this.enabled = true
}
;
THREE.ClearMaskPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta) {
        var context = renderer.context;
        context.disable(context.STENCIL_TEST)
    }
};
THREE.NormalPass = function(scene, camera, params) {
    this.scene = scene;
    this.camera = camera;
    this.params = params || {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    };
    this.params.minFilter = THREE.LinearFilter;
    this.params.magFilter = THREE.LinearFilter;
    var normalShader = THREE.NormalShader;
    this.normalUniforms = THREE.UniformsUtils.clone(normalShader.uniforms);
    this.materialNormal = new THREE.ShaderMaterial({
        shaderID: normalShader.shaderID,
        uniforms: this.normalUniforms,
        vertexShader: normalShader.vertexShader,
        fragmentShader: normalShader.fragmentShader,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending,
        depthTest: true,
        depthWrite: true,
        defines: {}
    });
    this.enabled = true;
    this.needsSwap = false;
    this.clear = false
}
;
THREE.NormalPass.prototype = {
    dispose: function() {
        if (this.renderTargetNormal) {
            this.renderTargetNormal.dispose();
            this.renderTargetNormal = null
        }
    },
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (maskActive)
            renderer.context.disable(renderer.context.STENCIL_TEST);
        if (!this.renderTargetNormal) {
            this.renderTargetNormal = new THREE.WebGLRenderTarget(readBuffer.width,readBuffer.height,this.params,"normal")
        }
        this.scene.overrideMaterial = this.materialNormal;
        var oldClearColor = (new THREE.Color).copy(renderer.getClearColor());
        var oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color(.5,.5,-1), 1);
        renderer.render(this.scene, this.camera, this.renderTargetNormal, true);
        this.scene.overrideMaterial = null ;
        if (maskActive)
            renderer.context.enable(renderer.context.STENCIL_TEST);
        renderer.setClearColor(oldClearColor, oldClearAlpha)
    }
};
THREE.RGBA8Pass = function() {
    this.params = {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    };
    this.materialClamp = new THREE.ShaderMaterial(THREE.ClampShader);
    this.materialClamp.depthTest = true;
    this.materialClamp.depthWrite = true;
    this.materialClamp.blending = THREE.NoBlending;
    this.enabled = true;
    this.needsSwap = false;
    this.clear = false;
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene.add(this.quad)
}
;
THREE.RGBA8Pass.prototype = {
    dispose: function() {
        if (this.renderTargetRGBA8) {
            this.renderTargetRGBA8.dispose();
            this.renderTargetRGBA8 = null
        }
    },
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (!this.renderTargetRGBA8) {
            this.renderTargetRGBA8 = new THREE.WebGLRenderTarget(readBuffer.width,readBuffer.height,this.params,"RGBA8")
        }
        if (this.materialClamp.uniforms["tDiffuse"]) {
            this.materialClamp.uniforms["tDiffuse"].value = readBuffer
        }
        this.quad.material = this.materialClamp;
        renderer.render(this.scene, this.camera, this.renderTargetRGBA8, this.clear)
    }
};
THREE.RenderPass = function(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 1;
    this.oldClearColor = new THREE.Color;
    this.oldClearAlpha = 1;
    this.enabled = true;
    this.clear = false;
    this.needsSwap = false
}
;
THREE.RenderPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta) {
        this.scene.overrideMaterial = this.overrideMaterial;
        if (this.clearColor) {
            this.oldClearColor.copy(renderer.getClearColor());
            this.oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(this.clearColor, this.clearAlpha)
        }
        var camera = this.camera || this.scene.camera;
        renderer.render(this.scene, camera, readBuffer, this.clear);
        if (this.clearColor) {
            renderer.setClearColor(this.oldClearColor, this.oldClearAlpha)
        }
        this.scene.overrideMaterial = null
    }
};
THREE.SAOPass = function(scene, camera, params) {
    this.scene = scene;
    this.camera = camera;
    var kernelSize = kernelSize !== undefined ? kernelSize : 10;
    this.params = params || {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    };
    this.msaaOffsets = this.standardDirctX11_MSAA32();
    if (THREE.SAOShader === undefined)
        console.error("THREE.SAOPass relies on THREE.SAOShader");
    var saoShader = THREE.SAOShader;
    this.saoUniforms = THREE.UniformsUtils.clone(saoShader.uniforms);
    this.materialSAO = new THREE.ShaderMaterial({
        shaderID: saoShader.shaderID,
        defines: _.clone(saoShader.defines),
        uniforms: this.saoUniforms,
        vertexShader: saoShader.vertexShader,
        fragmentShader: saoShader.fragmentShader,
        blending: THREE.NoBlending,
        depthTest: false,
        depthWrite: false
    });
    this.materialSAO.defines["NUM_SAMPLES_HQ"] = this.msaaOffsets.length;
    this.saoUniforms["msaaOffsets"].value = this.msaaOffsets;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.camera2 = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene2 = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene2.add(this.quad)
}
;
THREE.SAOPass.prototype = {
    dispose: function() {},
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (maskActive)
            renderer.context.disable(renderer.context.STENCIL_TEST);
        if (!this.renderTargetDepth) {
            throw new Error("SAOPass.renderTargetDepth is not set.")
        }
        var oldClearColor = (new THREE.Color).copy(renderer.getClearColor());
        var oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color(0,0,0), 0);
        if (this.saoUniforms["tDiffuse"]) {
            this.saoUniforms["tDiffuse"].value = readBuffer
        }
        this.saoUniforms["tDepth"].value = this.renderTargetDepth;
        this.saoUniforms["tNormal"].value = this.renderTargetNormal;
        this.camera.updateProjectionMatrix();
        this.saoUniforms["projMatrix"].value = this.camera.projectionMatrix;
        this.saoUniforms["projMatrixInv"].value = (new THREE.Matrix4).getInverse(this.camera.projectionMatrix);
        this.saoUniforms["zFar"].value = this.camera.far;
        this.saoUniforms["zNear"].value = this.camera.near;
        this.saoUniforms["randomSeed"].value = 0;
        this.saoUniforms["viewportResolution"].value = new THREE.Vector2(readBuffer.width,readBuffer.height);
        this.quad.material = this.materialSAO;
        renderer.render(this.scene2, this.camera2, writeBuffer, true);
        if (maskActive)
            renderer.context.enable(renderer.context.STENCIL_TEST);
        renderer.setClearColor(oldClearColor, oldClearAlpha)
    },
    standardDirctX11_MSAA16: function() {
        var vectors = [new THREE.Vector3(1,1,0), new THREE.Vector3(-1,-3,0), new THREE.Vector3(-3,2,0), new THREE.Vector3(4,-1,0), new THREE.Vector3(-5,-2,0), new THREE.Vector3(2,5,0), new THREE.Vector3(5,3,0), new THREE.Vector3(3,-5,0), new THREE.Vector3(-2,6,0), new THREE.Vector3(0,-7,0), new THREE.Vector3(-4,-6,0), new THREE.Vector3(-6,4,0), new THREE.Vector3(-8,0,0), new THREE.Vector3(7,-4,0), new THREE.Vector3(6,7,0), new THREE.Vector3(-7,-8,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    },
    standardDirctX11_MSAA32: function() {
        var vectors = [new THREE.Vector3(-4,-7,0), new THREE.Vector3(-7,-5,0), new THREE.Vector3(-3,-5,0), new THREE.Vector3(-5,-4,0), new THREE.Vector3(-1,-4,0), new THREE.Vector3(-2,-2,0), new THREE.Vector3(-6,-1,0), new THREE.Vector3(-4,0,0), new THREE.Vector3(-7,1,0), new THREE.Vector3(-1,2,0), new THREE.Vector3(-6,3,0), new THREE.Vector3(-3,3,0), new THREE.Vector3(-7,6,0), new THREE.Vector3(-3,6,0), new THREE.Vector3(-5,7,0), new THREE.Vector3(-1,7,0), new THREE.Vector3(5,-7,0), new THREE.Vector3(1,-6,0), new THREE.Vector3(6,-5,0), new THREE.Vector3(4,-4,0), new THREE.Vector3(2,-3,0), new THREE.Vector3(7,-2,0), new THREE.Vector3(1,-1,0), new THREE.Vector3(4,-1,0), new THREE.Vector3(2,1,0), new THREE.Vector3(6,2,0), new THREE.Vector3(0,4,0), new THREE.Vector3(4,4,0), new THREE.Vector3(2,5,0), new THREE.Vector3(7,5,0), new THREE.Vector3(5,6,0), new THREE.Vector3(3,7,0)];
        var xfrm = (new THREE.Matrix4).makeScale(1 / 16, 1 / 16, 0);
        var vectors2 = [];
        for (var i = 0; i < vectors.length; i++) {
            vectors2.push(vectors[i].clone().applyMatrix4(xfrm))
        }
        return vectors2
    }
};
THREE.ShaderPass = function(shader, textureID) {
    this.textureID = textureID !== undefined ? textureID : "tDiffuse";
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    });
    this.renderToScreen = false;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = true;
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),null );
    this.scene.add(this.quad)
}
;
THREE.ShaderPass.prototype = {
    render: function(renderer, writeBuffer, readBuffer, delta) {
        if (this.uniforms[this.textureID]) {
            this.uniforms[this.textureID].value = readBuffer
        }
        this.quad.material = this.material;
        if (this.renderToScreen) {
            renderer.render(this.scene, this.camera)
        } else {
            renderer.render(this.scene, this.camera, writeBuffer, this.clear)
        }
    }
};