import Pipeline from '../PipeLine'
import vs from 'shaders/material/material.vert'
import fs from 'shaders/material/material.frag'
import lampFs from 'shaders/material/lamp.frag'
import lampVs from 'shaders/material/lamp.vert'
import Geom from 'libs/Geom'
import {
  mat4,
  vec3
}from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian,
  GlTools
}from 'libs/GlTools'

const lightColor = [0.83, 0.82, 0.88]
const ligthPos = [1, 1.5, 1.5]
export default class Color extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
    this.lampPrg = this.compile(lampVs, lampFs)
  }
  attrib() {

    this.cube = Geom.cube(1)

    this.lamp = Geom.sphere(.1, 60)
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)


  }
  uniform() {


    let mMatrix = mat4.create()

    this.prg.use()
    this.prg.style({
      mMatrix,
      camPos: this.camera.position,
      'light.position': ligthPos,
      'material.ambient': [1, .5, .31],
      'material.diffuse': [.0, .0, .0],
      'material.specular': [1., 1., 1.],
      'material.shininess': 50,
      'light.ambient': [.1 ,.1 ,.1],
      'light.diffuse': [1., 1., 1.],
      'light.specular': [1., 1., 1.]
    })
  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    GlTools.draw(this.cube)


    let mMatrix = mat4.create()
    mat4.translate(mMatrix, mMatrix, ligthPos)
    mat4.scale(mMatrix , mMatrix , [.2, .2, .2])

    this.lampPrg.use()
    this.lampPrg.style({
      mMatrix,
      lightColor
    })
    GlTools.draw(this.lamp)
  }
}
