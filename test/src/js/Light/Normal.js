import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/normal/colors.vert'
import fs from 'shaders/normal/colors.frag'

import {
  mat4,
}from 'gl-matrix'
import {
  gl,
  GlTools
}from 'libs/GlTools'

const lightColor = [0.83, 0.82, 0.88]
export default class Normal extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
 
    this.cube = Geom.cube(.5)
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)

    this.camera.radius = 3
  }
  uniform() {

    let mMatrix = mat4.identity(mat4.create())

    this.prg.use()
    this.prg.style({
      mMatrix,
      vMatrix: this.camera.viewMatrix,
      pMatrix: this.camera.projMatrix,
      objectColor: [0.1, .1, .1]
    })
  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    GlTools.draw(this.cube)

    let mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [1, .1, 1])
    mat4.scale(mMatrix , mMatrix , [.2, .2, .2])

  }
}
