import TweenMax from 'gsap';
import dat from 'dat-gui';
import Program from '../libs/glProgram';
import { ArrayBuffer } from '../libs/glBuffer';
import filter from './FilterExtend';

dat.GUI.prototype.removeFolders = function() {
    var t = Object.keys(this.__folders);
    for (var i = 0; i < t.length; i++) {
        var folder = this.__folders[t[i]];
        if (!folder) {
            return;
        }
        folder.close();
        this.__ul.removeChild(folder.domElement.parentNode);
        delete this.__folders[t[i]];
    }
    this.onResize();
}
window.gui = new dat.GUI({ width: 300 });

const DRAW = { INTERMEDIATE: 1 };

const SHADER = {};
SHADER.VERTEX_IDENTITY = [
    'precision highp float;',
    'attribute vec2 pos;',
    'attribute vec2 uv;',
    'varying vec2 vUv;',
    'uniform float flipY;',

    'void main(void) {',
    'vUv = uv;',
    'gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);',
    '}'
].join('\n');

SHADER.FRAGMENT_IDENTITY = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',

    'void main(void) {',
    'gl_FragColor = texture2D(texture, vUv);',
    '}',
].join('\n');


let vBuffer;
const _canvas = document.querySelector('canvas');


class WebGLImageFilter  {
	constructor(){
	    this._drawCount = 0,
	    this._sourceTexture = null,
	    this._lastInChain = false,
	    this._curFrameBufferIndex = -1,
	    this._tempFramebuffers = [null, null],
	    this._filterChain = [],
	    this._width = -1,
	    this._height = -1,
	    this.prg=null
	    
	    this.gl = _canvas.getContext("webgl") || _canvas.getContext("experimental-webgl");
	    if (!this.gl) {
	        throw "Couldn't get WebGL context";
	    }
	    this._filter = filter;
	}
    addFilter(name) {
        var args = Array.prototype.slice.call(arguments, 1);
        var filter = this._filter[name];

        this._filterChain.push({ func: filter, args: args });
    }

    reset() {
        this._filterChain = [];
    };

    prepare() {
        gui.removeFolders();

        for (var i = 0; i < this._filterChain.length; i++) {
            var f = this._filterChain[i];
            f.func.prepare && f.func.prepare.call(this);
        }
    };

    render (data) {
        if (data.nodeName.toLowerCase() == 'video') {
            data.width = data.videoWidth
            data.height = data.videoHeight
        }
        this._resize(data.width, data.height);
        let gl=this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this._drawCount = 0;

        // Create the texture for the input image
        this._sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._sourceTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);

        // no filters? just draw
        if (this._filterChain.length == 0) {
            this._compileShader(SHADER.FRAGMENT_IDENTITY);
            this._lastInChain = true;
            this._draw();
            
        }else{
            for (var i = 0; i < this._filterChain.length; i++) {
                this._lastInChain = (i == this._filterChain.length - 1);
                var f = this._filterChain[i];
                f.func.apply(this, f.args || []);
            }
        }

        return _canvas;
    };

    _resize (width, height) {
        let gl=this.gl;

        if (width == this._width && height == this._height) {
            return; }

        _canvas.width = this._width = width;
        _canvas.height = this._height = height;

        // Create the vertex buffer for the two triangles [x, y, u, v] * 6
        var vertices = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]);
        vBuffer = new ArrayBuffer(gl);
        vBuffer.attrib("pos", 2, gl.FLOAT),
            vBuffer.attrib("uv", 2, gl.FLOAT)
        vBuffer.data(vertices)

        // Note sure if this is a good idea; at least it makes texture loading
        // in Ejecta instant.
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.viewport(0, 0, this._width, this._height);

        // Delete old temp framebuffers
        this._tempFramebuffers = [null, null];
    };

    _getTempFramebuffer (index) {
        this._tempFramebuffers[index] =
            this._tempFramebuffers[index] ||
            this._createFramebufferTexture(this._width, this._height);

        return this._tempFramebuffers[index];
    };

    _createFramebufferTexture (width, height) {
    	let gl=this.gl;
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
        //attach texture things rendered to
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return { fbo: fbo, texture: texture };
    };

    _draw (flags) {
        var source = null,
            target = null;
            this.flipY = false;
        let gl=this.gl;
        if (this._drawCount == 0) {
            // First draw call - use the source texture
            source = this._sourceTexture;
        } else {
            // All following draw calls use the temp buffer last drawn to
            source = this._getTempFramebuffer(this._curFrameBufferIndex).texture;
        }
        this._drawCount++;

        // Set up the target
        if (this._lastInChain && !(flags & DRAW.INTERMEDIATE)) {
            // Last filter in our chain - draw directly to the WebGL Canvas. We may
            // also have to flip the image vertically now
            target = null;
            this.flipY = this._drawCount % 2 == 0;
        } else {
            // Intermediate draw call - get a temp buffer to draw to
            this._curFrameBufferIndex = (this._curFrameBufferIndex + 1) % 2;
            target = this._getTempFramebuffer(this._curFrameBufferIndex).fbo;
        }
        // Bind the source and target and draw the two triangles

        gl.bindTexture(gl.TEXTURE_2D, source);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.uniform1f(this.prg.flipY(), (this.flipY ? -1 : 1));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    _compileShader (fshader,vshader) {
        // Compile shaders
        let gl=this.gl;
        this.prg = new Program(gl);
        this.prg.compile(vshader||SHADER.VERTEX_IDENTITY,fshader)
        return this.prg
    };
}
window.WebGLImageFilter = WebGLImageFilter;

module.exports=WebGLImageFilter;
