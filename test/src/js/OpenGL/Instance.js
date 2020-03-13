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

const random = function(min, max) { return min + Math.random() * (max - min);	}

export default class Instance extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
 
    this.cube = Geom.sphere(.01, 100)


    this.cube.bufferInstance(this._caculateMatrix(), 'instanceMatrix', gl.DYNAMIC_DRAW)
  }

  _caculateMatrix() {
    const num = 1000
    let instanceMatrix = []
    let x, y, z
    for(let i = 0; i < num; i++) {
      const scale = random(.1, 10)

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
    return instanceMatrix
  }

  prepare() {

    this.orbital.radius = 100
    this.curTime = 0 
    this.lastTime = 0
  }
  uniform() {


    this.prg.use()
    this.prg.style({
      objectColor: [0.1, .1, .1]
    })
  }
  render() {
    GlTools.clear(0, 0, 0)

    this.curTime = performance.now()
    const interval = 100
    if(this.curTime - this.lastTime > interval) {
      const matrix = this._caculateMatrix()
      this.cube.bufferSubData('instanceMatrix', matrix)
      this.lastTime = performance.now()
    }
    

    GlTools.draw(this.cube)


  }
}
