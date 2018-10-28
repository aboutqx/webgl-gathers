import Pipeline from '../PipeLine'
import Mesh from 'libs/Mesh'
import vs from 'shaders/material/material.vert'
import fs from 'shaders/material/material.frag'
import lampFs from 'shaders/material/lamp.frag'
import lampVs from 'shaders/material/lamp.vert'

import {
  mat4,
  vec3
}from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
}from 'libs/GlTools'

let vMatrix = mat4.identity(mat4.create())
let pMatrix = mat4.identity(mat4.create())
const lightColor = [0.33, 0.42, 0.18]
const ligthPos = [1, .1, 1.5]
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
    let CubeData = [
      -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
      0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
      0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
      0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
      -0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
      -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,

      -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
      0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
      0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
      0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
      -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
      -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,

      -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,
      -0.5, 0.5, -0.5, -1.0, 0.0, 0.0,
      -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
      -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
      -0.5, -0.5, 0.5, -1.0, 0.0, 0.0,
      -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,

      0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
      0.5, 0.5, -0.5, 1.0, 0.0, 0.0,
      0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
      0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
      0.5, -0.5, 0.5, 1.0, 0.0, 0.0,
      0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

      -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
      0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
      0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
      0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
      -0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
      -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,

      -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
      0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
      0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
      0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
      -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
      -0.5, 0.5, -0.5, 0.0, 1.0, 0.0
    ]
    let cube = new Mesh()
    cube.bufferData(CubeData, ['position', 'normal'], [3, 3])
    this.cube = cube

    this.lampVao = gl.createVertexArray()
    gl.bindVertexArray(this.lampVao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cube._buffers[0].buffer.buffer)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0) // float size is 4,设置为6，虽然后面3位texCoord没用，但不会报错
    gl.enableVertexAttribArray(0)
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)


  }
  uniform() {

    let eyeDirection = []
    let camUpDirection = []

    vec3.transformQuat(eyeDirection, [0.0, 0.0, 3.0], this.rotateQ)
    vec3.transformQuat(camUpDirection, [0.0, 1.0, 0.0], this.rotateQ)
    this.eyeDirection = eyeDirection

    mat4.lookAt(vMatrix, eyeDirection, [0, 0, 0], camUpDirection)
    mat4.perspective(pMatrix, toRadian(60), canvas.clientWidth / canvas.clientHeight, .1, 100)


    let mMatrix = mat4.identity(mat4.create())

    this.prg.use()
    this.prg.style({
      mMatrix,
      vMatrix,
      pMatrix,
      camPos: eyeDirection,
      'light.position': ligthPos,
      'material.ambient': [1, .5, .31],
      'material.diffuse': [1, .5, .31],
      'material.specular': [.5, .5, .5],
      'material.shininess': 50,
      'light.ambient': [.2 ,.2 ,.2],
      'light.diffuse': [.5, .5, .5],
      'light.specular': [1., 1., 1.]
    })
  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    this.cube.bind(this.prg, ['position', 'normal'])
    this.cube.draw()


    let mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, ligthPos)
    mat4.scale(mMatrix , mMatrix , [.2, .2, .2])

    this.lampPrg.use()
    this.lampPrg.style({
      mMatrix,
      vMatrix,
      pMatrix,
      lightColor
    })
    gl.bindVertexArray(this.lampVao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}
