import colorString from 'color-string'
import Texture from 'libs/glTexture'
import * as dat from 'dat.gui'
import {
  ArrayBuffer
} from 'libs/glBuffer'

const gui = new dat.GUI({
  width: 300
})

dat.GUI.prototype.removeFolders = function () {
  var t = Object.keys(this.__folders)
  for (var i = 0; i < t.length; i++) {
    var folder = this.__folders[t[i]]
    if (!folder) {
      return
    }
    folder.close()
    this.__ul.removeChild(folder.domElement.parentNode)
    delete this.__folders[t[i]]
  }
  this.onResize()
}
// deal with color
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
  _params = {}
  _layers = [{
    fshader: require('../shaders/frag_identity.frag'),
    // big triangle vetex
    attributes: {
      name: 'position',
      data: [-1, -1, -1, -1, 4, -1,
        4, -1, -1
      ],
      size: 3
    },
    textures: [{
      name: 'pants'
    }],
    uniforms: {
      texture: 0,
      flipY: 1
    }
  }]
  gl = null
  vBuffers = []
  textures = []

  constructor(filterWrapper) {
    this._wrapper = filterWrapper
    this.gl = this._wrapper.gl
    gui.removeFolders()
    this._setGUI()
    this._setLayers()

    this._layers.map((layer, i) => {
      this._initTextures(layer.textures)
    })
    this._wrapper.textures = this.textures

    filterWrapper._resize(this.textures[0].width, this.textures[0].height)
  }

  _setLayers() {}

  render() {
    this.vBuffers = this._wrapper.vBuffers = []
    this._layers.map((layer, i) => {
      this._prepare(layer)
      this._draw(i)
    })
  }

  _prepare(layer) {
    this.prg = this._wrapper._compilePrg(layer.fshader)
    this.prg.use()
    this._bufferAndAttrib(layer.attributes)
  }
  // child class will do set uniforms and call gl.draw
  _draw() {
    this.prg.style(this._layers[0].uniforms)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }

  _bufferAndAttrib({
    data,
    name,
    size
  }) {

    data = new Float32Array(data)

    let vBuffer = new ArrayBuffer(this.gl, data)
    vBuffer.attrib(name, size, this.gl.FLOAT)
    this.vBuffers.push(vBuffer)

    this.vBuffers.map((vBuffer) => {
      vBuffer.attribPointer(this.prg)
    })
  }

  _initTextures(textures) {
    textures.map((texture) => {
      let i = window.getAssets[texture.name]
      let t = new Texture(this.gl, this.gl.RGBA)
      this.textures.push(t)
      t.fromImage(i)
      t.setFilter(false)
      t.clamp()
    })
  }

  _setGUI() {}

  addGUIParams(o) {
    return Object.assign(this._params, o)
  }
  get params() {
    return this._params
  }
  set params(param) {
    throw Error("Params has no setter,please use addGUIParams")
  }
}
class grayFocus extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._layers[0].fshader = require('../shaders/grayFocus.frag')
    this._layers[0].textures = [{
      name: 'p7'
    }]
  }
  _draw(i) {
    let gl = this.gl

    this.prg.style({ ...this._layers[0].uniforms,
      lt: this.params.lt,
      gt: this.params.gt,
      clamp: this.params.clamp ? 1 : 0
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  _setGUI() {
    this.addGUIParams({
      lt: 0.2,
      gt: 0.98,
      clamp: false
    })
    let folder = gui.addFolder('grayFocus')
    folder.add(this.params, 'lt', 0, 1).step(0.01)
    folder.add(this.params, 'gt', 0, 1).step(0.01)
    folder.add(this.params, 'clamp')
    folder.open()
  }
}
class cartoon extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._layers[0].fshader = require('../shaders/cartoon.frag')
  }

  _draw(wrapper) {
    this.textures[0].bind(0)

    this.prg.style({
      HueLevels: [0.0, 80.0, 160.0, 240.0, 320.0, 360.0],
      SatLevels: [0.0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0],
      ValLevels: [0.0, 0.3, 0.6, 1.0],
      textureSize: [this._wrapper._width, this._wrapper._height],
      ...this._layers[0].uniforms,
    })

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}

class notebookDrawing extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._time = 0
    this._layers[0].fshader = require('../shaders/notebookDrawing.frag')
    this._layers[0].texture = [{name: 'p1' },{ name: 'noise256' }]
  }
  _draw(wrapper) {
    let program = this.prg
    let gl = this.gl
    // this._time += 1 / 16;

    gl.uniform1i(program.iChannel0(), 0)
    gl.uniform1i(program.iChannel1(), 1)

    this.textures[0].bind(0)
    this.textures[1].bind(1)

    this.prg.style({
      iResolution: [this._wrapper._width, this._wrapper._height],
      Res1: [this._wrapper._width, this._wrapper._height],
      iGlobalTime: this._time,
      ...this._layers[0].uniforms,
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

class bond extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }

  _setLayers() {
    this._layers[0].fshader = require('../shaders/bondFilter.frag')
    this._layers[0].textures.push({
      name: 'p4'
    })
  }

  _draw(i) {
    let gl = this.gl
    let t = glsl `${this.params.filterColor}`.split(',')

    gl.uniform1i(this.prg.texture(), 1)
    gl.uniform1i(this.prg.targetBg(), 0)

    this.textures[0].bind(0)
    this.textures[1].bind(1)

    this.prg.style({
      ...this._layers[0].uniforms,
      filterRange: this.params.filterRange,
      filterBg: t,
      iResolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      targetBg: 1
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  _setGUI() {
    this.addGUIParams({
      filterColor: '#0DA226',
      filterRange: 0.05
    })
    let folder = gui.addFolder('bondFilter')
    folder.addColor(this.params, 'filterColor')
    folder.add(this.params, 'filterRange', 0, 0.1).step(0.001)
    folder.open()
  }
}
class bloom extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._time = 0
    this._layers[0].fshader = require('../shaders/bloom.frag')
  }
  _draw(i) {
    let gl = this.gl
    this._time += 1 / 16 / 2
    this.prg.style({ ...this._layers[0].uniforms,
      iGlobalTime: this._time,
    })
    this.textures[i].bind(0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

class Cloth extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._layers.push({
      fshader: require('../shaders/cloth2.frag'),
      attributes: {
        name: 'position',
        data: [-1, -1, 1, -1, 4, 1,
          4, -1, 1
        ],
        size: 3
      },
      textures: [{
        name: 'shirt'
      }],
      uniforms: {
        texture: 0,
        flipY: 1,
      }
    })
    this._layers[0].fshader = require('../shaders/cloth.frag')

  }
  _draw(i) {
    let gl = this.gl
    // this._time += 1 / 16;
    if (i === 0)
      this.prg.style({ ...this._layers[0].uniforms,
        c1X: this.params.c1X,
        c1Y: this.params.c1Y
      })
    if (i === 1)
      this.prg.style({ ...this._layers[1].uniforms,
        c2X: this.params.c2X,
        c2Y: this.params.c2Y
      })
    this.textures[i].bind(0)

    //  gl.enable(gl.BLEND);
    //  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA	);
    gl.disable(gl.DEPTH_TEST)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.enable(gl.DEPTH_TEST)

  }
  _setGUI() {
    this.addGUIParams({
      c1X: 100,
      c1Y: 100,
      c2X: -150,
      c2Y: 100
    })
    let folder1 = gui.addFolder('cloth1')
    folder1.add(this.params, 'c1X', -this._wrapper._width, this._wrapper._width).step(1)
    folder1.add(this.params, 'c1Y', -this._wrapper._height, this._wrapper._height).step(1)
    folder1.open()

    let folder2 = gui.addFolder('cloth2')
    folder2.add(this.params, 'c2X', -this._wrapper._width, this._wrapper._width).step(1)
    folder2.add(this.params, 'c2Y', -this._wrapper._height, this._wrapper._height).step(1)
    folder2.open()
  }
}
class edge extends Filter {
  constructor(filterWrapper) {
    super(filterWrapper)
  }
  _setLayers() {
    this._layers[0].textures = [{
      name: 'TajMahal'
    }]
    this._layers[0].fshader = require('../shaders/edge.frag')
  }
  _draw() {
    this.textures[0].bind(0)
    this.prg.style({ ...this._layers[0].uniforms,
      px: [1 / this._wrapper._width, 1 / this._wrapper._height],
      mx: [
        -1, 0, 1,
         -2, 0, 2,
         -1, 0, 1
        ],
      my: [
        -1, -2, -1,
        0, 0, 0,
        1, 2, 1
      ]
    })
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}
export default {
  Filter,
  grayFocus,
  notebookDrawing,
  cartoon,
  bond,
  bloom,
  Cloth,
  edge
}
