var WebGLProgram = function( gl, vertexSource, fragmentSource ) {

    var _collect = function( source, prefix, collection ) {
        var r = new RegExp('\\b' + prefix + ' \\w+ (\\w+)', 'ig');
        source.replace(r, function(match, name) {
            collection[name] = 0;
            return match;
        });
    };

    var _compile = function( gl, source, type ) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };


    this.uniform = {};
    this.attribute = {};

    var _vsh = _compile(gl, vertexSource, gl.VERTEX_SHADER);
    var _fsh = _compile(gl, fragmentSource, gl.FRAGMENT_SHADER);

    this.id = gl.createProgram();
    gl.attachShader(this.id, _vsh);
    gl.attachShader(this.id, _fsh);
    gl.linkProgram(this.id);

    if( !gl.getProgramParameter(this.id, gl.LINK_STATUS) ) {
        console.log(gl.getProgramInfoLog(this.id));
    }

    gl.useProgram(this.id);

    // Collect attributes
    _collect(vertexSource, 'attribute', this.attribute);
    for( var a in this.attribute ) {
        this.attribute[a] = gl.getAttribLocation(this.id, a);
    }

    // Collect uniforms
    _collect(vertexSource, 'uniform', this.uniform);
    _collect(fragmentSource, 'uniform', this.uniform);
    for( var u in this.uniform ) {
        this.uniform[u] = gl.getUniformLocation(this.id, u);
    }
}
function createFramebufferTexture( width, height ) {
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {fbo: fbo, texture: texture};
};