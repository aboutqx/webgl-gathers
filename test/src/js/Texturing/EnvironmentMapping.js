/*
 https://developer.download.nvidia.cn/CgTutorial/cg_tutorial_chapter07.html
*/
import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import CustomShaders from 'libs/shaders/CustomShaders'
import sVs from 'shaders/env_map/env_specular.vert'
import sFs from 'shaders/env_map/env_specular.frag'
import rVs from 'shaders/env_map/env_refract.vert'
import rFs from 'shaders/env_map/env_refract.frag'
import fVs from 'shaders/env_map/fresnell_chromatic.vert'
import fFs from 'shaders/env_map/fresnell_chromatic.frag'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian,
  GlTools
} from 'libs/GlTools'

export default class EnvMap extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(CustomShaders.skyboxVert, CustomShaders.skyboxFrag)
    this.specularPrg = this.compile(sVs, sFs)
    this.refractPrg = this.compile(rVs, rFs)
    this.frenellPrg = this.compile(fVs, fFs)
  }
  attrib() {
    this.skybox = Geom.skybox(40)

  }
  prepare() {

    this.skyMap = getAssets.outputskybox
    this.venus = getAssets.statue

    this.camera.radius = 6

  }
  uniform() {

    mat4.perspective(this.pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)

    mat4.multiply(this.tmpMatrix, this.pMatrix, this.vMatrix)

    let mMatrix = mat4.create()
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skyMap.texture)

    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      uGamma: 2.2,
      uExposure: 5.,
      tex: 0
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.prg.use()
    GlTools.draw(this.skybox)

    let mMatrix = mat4.create()
    mat4.translate(mMatrix, mMatrix, [-3,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.specularPrg.use()
    this.specularPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.position
    })
    for(let i =0;i<this.venus.length;i++){
      GlTools.draw(this.venus[i], true)
    }

    mMatrix = mat4.create()
    mat4.translate(mMatrix, mMatrix, [3,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.refractPrg.use()
    this.refractPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.position
    })
    for(let i =0;i<this.venus.length;i++){
      GlTools.draw(this.venus[i], true)
    }
    
    mMatrix = mat4.create()
    mat4.translate(mMatrix, mMatrix, [0,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.refractPrg.use()
    this.refractPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.position,
      etaRatio: [.65, .67,.69],
      fresnelPower: .8,
      fresnelBias: .1,
      fresnelScale: .9
    })
    for(let i =0;i<this.venus.length;i++){
      GlTools.draw(this.venus[i], true)
    }
    
  }
}

