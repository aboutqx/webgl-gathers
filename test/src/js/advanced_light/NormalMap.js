import Pipeline from '../PipeLine'
import Mesh from 'libs/Mesh'
import vs from 'shaders/material/material.vert'
import fs from 'shaders/material/material.frag'

import {
  mat4,
  vec3
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

let vMatrix = mat4.identity(mat4.create())
let pMatrix = mat4.identity(mat4.create())

// Gramm-Schmid 正交可将从fragment里被光栅化，不再正交与normal的tangent重新正交化
// https://zh.wikipedia.org/wiki/%E6%A0%BC%E6%8B%89%E5%A7%86-%E6%96%BD%E5%AF%86%E7%89%B9%E6%AD%A3%E4%BA%A4%E5%8C%96
// 和cemra的lookat一样，将基坐标乘以切线空间的normal得到贴图方向的normal，乘法基于scalar project得到三个方向的向量
export default class NormalMap extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
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
      'light.ambient': [.2, .2, .2],
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
    mat4.scale(mMatrix, mMatrix, [.2, .2, .2])

  }
}
