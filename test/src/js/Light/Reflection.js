import Pipeline from '../PipeLine'
import vs from 'shaders/reflection.vert'
import fs from 'shaders/reflection.frag'
import OBJLoader from 'libs/loaders/OBJLoader'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

export default class Reflection extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
    this.statue = new OBJLoader().parseObj(getAssets.statue)

  }
  prepare(){
    this.camera.radius = 3.5
  }
  _setGUI() {
    this.addGUIParams({
      color: [0,0,0]
    })

    this.gui.addColor(this.params, 'color')

  }
  uniform() {

    mat4.perspective(this.pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)

    mat4.multiply(this.tmpMatrix, this.pMatrix, this.vMatrix)

    let mMatrix = mat4.identity(mat4.create())
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)

    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      invMatrix,
      color: [this.params.color[0] / 255, this.params.color[1] / 255, this.params.color[2] / 255],
      lightDirection: [-0.5, 0.5, 0.5],
      eyeDirection: this.camera.cameraPos,
      ambientColor: [0.1, 0.1, 0.1, 1.0]
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)

    this.prg.use()
    for(let i =0;i<this.statue.length;i++){
      this.statue[i].bind(this.prg, ['position', 'normal'])
      this.statue[i].draw()
    }

  }
}

