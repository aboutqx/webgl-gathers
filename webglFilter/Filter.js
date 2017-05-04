import colorString from 'color-string';
import Texture from '../libs/glTexture';

function glsl(strings, ...variables) {
    variables = variables.map(v => {
        var rgb = colorString.get(v).value
            .map(x => x / 255)
            .slice(0, 3)
            .join(', ')
        return `${rgb}`
    })
    var str = []
    strings.forEach((x, i) => {
        str.push(x)
        str.push(variables[i] || '')
    })
    return str.join('')
}

class Filter {
    constructor(filterWrapper) {
        this._wrapper = filterWrapper;
        this._prepare()
    }
    render() {
        this._useProgram()
        this._draw(this._wrapper)
    }
    _prepare() {
        this.prg = this._wrapper._compilePrg(this._wrapper.fShader);
        this._initTextures(this._wrapper.gl);
        gui.removeFolders();
        this._setGUI()
    }
    _useProgram() {
        this.prg.use();
        this._wrapper.vBuffer.attribPointer(this.prg)

    }
    _initTextures() {

    }
    _setGUI() {

    }
}
class grayFocus extends Filter {
    constructor(filterWrapper) {
        filterWrapper.fShader = require('./shaders/grayFocus.frag')
        super(filterWrapper)
    }
    _draw(wrapper) {
        let gl = wrapper.gl;

        this.prg.style({
            lt: params.lt,
            gt: params.gt,
            clamp: params.clamp ? 1 : 0
        })

        wrapper._draw();
    }
    _setGUI() {
        window.params = {
            lt: .2,
            gt: .98,
            clamp: false
        }
        var folder = gui.addFolder('grayFocus')
        folder.add(params, 'lt', 0, 1).step(0.01);
        folder.add(params, 'gt', 0, 1).step(0.01);
        folder.add(params, 'clamp')
        folder.open()
    }
}
class cartoon extends Filter {
    constructor(filterWrapper) {
        filterWrapper.fShader = require('./shaders/cartoon.frag')
        super(filterWrapper)
    }
    _draw(wrapper) {
        let gl = wrapper.gl;

        this.prg.style({
            HueLevels: [0.0, 80.0, 160.0, 240.0, 320.0, 360.0],
            SatLevels: [0.0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0],
            ValLevels: [0.0, 0.3, 0.6, 1.0],
            textureSize: [gl.drawingBufferWidth, gl.drawingBufferHeight]
        })

        wrapper._draw();
    }
}

class notebookDrawing extends Filter {
    constructor(filterWrapper) {
        filterWrapper.fShader = require('./shaders/notebookDrawing.frag')
        super(filterWrapper)
        this._time = 0;
    }

    _initTextures(gl) {
        let i = getAsset('noise256');
        this.texture2 = new Texture(gl, gl.RGBA);
        this.texture2.fromImage(i);
        this.texture2.setFilter(false);
        this.texture2.clamp();
    }

    _draw(wrapper) {
        let gl = wrapper.gl,
            program = this.prg;
        this._time += 1 / 16;

        gl.uniform1i(program.iChannel0(), 0);
        gl.uniform1i(program.iChannel1(), 1);

        wrapper.texture.bind(0)
        this.texture2.bind(1)

        this.prg.style({
            iResolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
            Res1: [gl.drawingBufferWidth, gl.drawingBufferHeight],
            iGlobalTime: this._time,
            flipY: true
        })

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

class bondFilter extends Filter {
    constructor(filterWrapper) {
        filterWrapper.fShader = require('./shaders/bondFilter.frag')
        super(filterWrapper)

    }

    _initTextures(gl) {
        let i = getAsset('source3');
        this.texture2 = new Texture(gl, gl.RGBA);
        this.texture2.fromImage(i);
        this.texture2.setFilter(false);
        this.texture2.clamp();

    }

    _draw(wrapper) {
        let gl = wrapper.gl;
        let t = glsl `${params.filterColor}`.split(',');

        gl.uniform1i(this.prg.texture(), 0);
        gl.uniform1i(this.prg.targetBg(), 1);

        wrapper.texture.bind(0)
        this.texture2.bind(1)

        this.prg.style({
            filterRange: params.filterRange,
            filterBg: t,
            iResolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
            flipY: 1
        });

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    _setGUI() {
        window.params = {
            filterColor: "#0DA226",
            filterRange: .05
        }
        var folder = gui.addFolder('bondFilter')
        folder.addColor(params, 'filterColor');
        folder.add(params, 'filterRange', 0, .1).step(.001);
        folder.open()
    }

}
class bloom extends Filter {
    constructor(filterWrapper) {
        filterWrapper.fShader = require('./shaders/bloom.frag')
        super(filterWrapper)
        this._time = 0;
    }
    _draw(wrapper) {
        let gl = wrapper.gl;
        this._time += 1 / 16/2;

        this.prg.style({
            iGlobalTime: this._time,
        })
        wrapper._draw();
    }
}
export default { grayFocus: grayFocus, notebookDrawing: notebookDrawing, cartoon: cartoon, bondFilter: bondFilter, bloom: bloom };
