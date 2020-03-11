import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/instance/instance.vert'
import fs from 'shaders/instance/instance.frag'

import {
  mat4,
}from 'gl-matrix'
import {
  gl,
  GlTools
}from 'libs/GlTools'

export default class Instance extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
 
    this.cube = Geom.cube(.01)

    const num = 1000
    let instanceMatrix = []
    let x, y, z
    for(let i = 0; i < num; i++) {
      const scale = Math.random() * 200

      let mMatrix = mat4.create()
      let displacement =  (Math.random() * 2 - 1 ) * 50
      x = displacement
      displacement =  (Math.random() * 2 - 1 ) * 50
      y = displacement
      displacement =  (Math.random() * 2 - 1 ) * 50
      z = displacement
      mat4.translate(mMatrix, mMatrix, [x, y, z])
      mat4.scale(mMatrix, mMatrix, [scale, scale, scale])
      instanceMatrix.push(mMatrix)
    }
    this.cube.bufferInstance(instanceMatrix, 'instanceMatrix')
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)

    this.camera.radius = 100
  }
  uniform() {


    this.prg.use()
    this.prg.style({
      objectColor: [0.1, .1, .1]
    })
  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    GlTools.draw(this.cube)


  }
}
