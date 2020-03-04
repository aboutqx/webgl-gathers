import Pipeline from '../PipeLine'
import terrainVs from 'shaders/water/terrain.vert'
import terrainFs from 'shaders/water/terrain.frag'
import waterVs from 'shaders/water/water.vert'
import waterFs from 'shaders/water/water.frag'

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

export default class Color extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.terrainPrg = this.compile(terrainVs, terrainFs)
    this.waterPrg = this.compile(waterVs, waterFs)
  }
  attrib() {
    const size = 150
    this.terrainPlane = Geom.plane(size ,size, 100 , 'xz')
    this.waterPlane = Geom.plane(size ,size, 100 , 'xz')
  }
  prepare() {

    this.terrainTexture = getAssets.terrain
    this.terrainTexture.bind()
    this.terrainTexture.repeat()

    this.camera.radius = 50
    this.camera.offset = [0, 12, 18]
  }
  uniform() {
    let mMatrix = mat4.identity(mat4.create())
    
    this.terrainPrg.use()
    this.terrainPrg.style({
      mMatrix,
      texture0: this.terrainTexture
    })

    mMatrix = mat4.identity(mat4.create())
    
    this.waterPrg.use()
    this.waterPrg.style({
      mMatrix,
      texture0: this.terrainTexture
    })
    
  }
  render() {
    GlTools.clear()
    this.terrainPrg.use()
    GlTools.draw(this.terrainPlane)

    this.waterPrg.use()
    GlTools.draw(this.waterPlane)
  }
}
