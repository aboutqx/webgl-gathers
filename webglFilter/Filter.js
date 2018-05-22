import colorString from 'color-string'
import Texture from '../libs/glTexture'
import * as dat from 'dat.gui'
const gui = new dat.GUI({ width: 300 })

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
function glsl (strings, ...variables) {
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
  params = {
    canvasWidth: 400,
    canvasHeight: 400
  }

  constructor (filterWrapper) {
    this._wrapper = filterWrapper
    this._prepare()
  }
  render () {
    this._useProgram()
    this._draw(this._wrapper)
    // canvas.width = this.params.canvasWidth
    // canvas.height = this.params.canvasHeight
  }
  _prepare () {
    this.prg = this._wrapper._compilePrg(this._wrapper.fShader)
    this.texture = this._wrapper.texture
    this._initTextures(this._wrapper.gl)
    gui.removeFolders()
    this._setDefaultGUI()
    this._setGUI()

  }
  _useProgram () {
    this._wrapper.prg.use()
    this._wrapper.vBuffer.attribPointer(this._wrapper.prg)
  }
  _initTextures (gl) {
    if (!this._wrapper.texture2Name) return
    let i = window.getAssets[this._wrapper.texture2Name]
    this.texture2 = new Texture(gl, gl.RGBA)
    let t = this.texture2
    t.fromImage(i)
    t.setFilter(false)
    t.clamp()
  }


  _setDefaultGUI () {
    let folder = gui.addFolder('canvas')
    folder.add(this.params, 'canvasWidth', 0, 500).step(1)
    folder.add(this.params, 'canvasHeight', 0, 500).step(1)
  }
  _setGUI() {

  }
  addGUIParams (o) {
    let params = {}
    for (let key in this.params) {
      params[key] = this.params[key]
    }
    return Object.assign(o, params)
  }
}
class grayFocus extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/grayFocus.frag')
    super(filterWrapper)
  }
  _draw (wrapper) {
    let gl = wrapper.gl

    this.prg.style({
      lt: this.params.lt,
      gt: this.params.gt,
      clamp: this.params.clamp ? 1 : 0
    })

    wrapper._draw()
  }
  _setGUI () {
    this.params = {
      lt: 0.2,
      gt: 0.98,
      clamp: false
    }
    var folder = gui.addFolder('grayFocus')
    folder.add(this.params, 'lt', 0, 1).step(0.01)
    folder.add(this.params, 'gt', 0, 1).step(0.01)
    folder.add(this.params, 'clamp')
    folder.open()
  }
}
class cartoon extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/cartoon.frag')
    super(filterWrapper)
  }
  _draw (wrapper) {
    let gl = wrapper.gl

    this.prg.style({
      HueLevels: [0.0, 80.0, 160.0, 240.0, 320.0, 360.0],
      SatLevels: [0.0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0],
      ValLevels: [0.0, 0.3, 0.6, 1.0],
      textureSize: [gl.drawingBufferWidth, gl.drawingBufferHeight]
    })

    wrapper._draw()
  }
}

class notebookDrawing extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/notebookDrawing.frag')
    filterWrapper.texture2Name = 'noise256'
    super(filterWrapper)
    this._time = 0
  }

  _draw (wrapper) {
    let gl = wrapper.gl
    let program = this.prg
    // this._time += 1 / 16;

    gl.uniform1i(program.iChannel0(), 0)
    gl.uniform1i(program.iChannel1(), 1)

    wrapper.texture.bind(0)
    wrapper.texture2.bind(1)

    this.prg.style({
      iResolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      Res1: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      iGlobalTime: this._time,
      flipY: 1
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

class Bond extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/bondFilter.frag')
    filterWrapper.texture2Name = 'p4'
    super(filterWrapper)
  }

  _draw (wrapper) {
    let gl = wrapper.gl
    let t = glsl`${this.params.filterColor}`.split(',')

    gl.uniform1i(this.prg.texture(), 1)
    gl.uniform1i(this.prg.targetBg(), 0)

    wrapper.texture.bind(0)
    wrapper.texture2.bind(1)

    this.prg.style({
      filterRange: this.params.filterRange,
      filterBg: t,
      iResolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      flipY: -1
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  _setGUI () {
    this.params = {
      filterColor: '#0DA226',
      filterRange: 0.05
    }
    var folder = gui.addFolder('bondFilter')
    folder.addColor(this.params, 'filterColor')
    folder.add(this.params, 'filterRange', 0, 0.1).step(0.001)
    folder.open()
  }
}
class bloom extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/bloom.frag')
    super(filterWrapper)
    this._time = 0
  }
  _draw (wrapper) {
    let gl = wrapper.gl
    this._time += 1 / 16 / 2

    this.prg.style({
      iGlobalTime: this._time
    })
    wrapper._draw()
  }
}
class Cloth extends Filter {
  constructor (filterWrapper) {
    filterWrapper.fShader = require('./shaders/cloth.frag')
    filterWrapper.texture2Name = 'pants'
    super(filterWrapper)
  }
  _draw (wrapper) {
    let gl = wrapper.gl
    // this._time += 1 / 16;

    this.prg.style(
      this.addGUIParams({
        texture: 0,
        targetBg: 1,
        flipY: 1
      })
    )

    this.texture.bind(0)
    this.texture2.bind(1)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  _setGUI () {
    this.params = {
      c1X: 100,
      c1Y: 100,
      c2X: 100,
      c2Y: 100
    }
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
export default { grayFocus, notebookDrawing, cartoon, Bond, bloom, Cloth }
