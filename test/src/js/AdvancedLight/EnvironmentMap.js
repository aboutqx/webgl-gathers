/*
 https://developer.download.nvidia.cn/CgTutorial/cg_tutorial_chapter07.html
*/
import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/skybox/skybox.vert'
import fs from 'shaders/skybox/skybox.frag'
import sVs from 'shaders/env_map/env_specular.vert'
import sFs from 'shaders/env_map/env_specular.frag'
import rVs from 'shaders/env_map/env_refract.vert'
import rFs from 'shaders/env_map/env_refract.frag'
import fVs from 'shaders/env_map/fresnell_chromatic.vert'
import fFs from 'shaders/env_map/fresnell_chromatic.frag'
import GLCubeTexture from 'libs/GLCubeTexture'
import HDRParser from 'libs/loaders/HDRParser'
import OBJLoader from 'libs/loaders/OBJLoader'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

export default class EnvMap extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
    this.specularPrg = this.compile(sVs, sFs)
    this.refractPrg = this.compile(rVs, rFs)
    this.frenellPrg = this.compile(fVs, fFs)
  }
  attrib() {
    this.skybox = Geom.skybox(40)

  }
  prepare() {
    let sky_posx = HDRParser(getAssets.skyboxPosX);
    let sky_negx = HDRParser(getAssets.skyboxNegX);
    let sky_posy = HDRParser(getAssets.skyboxPosY);
    let sky_negy = HDRParser(getAssets.skyboxNegY);
    let sky_posz = HDRParser(getAssets.skyboxPosZ);
    let sky_negz = HDRParser(getAssets.skyboxNegZ);


    this.skyMap = new GLCubeTexture([sky_posx, sky_negx, sky_posy, sky_negy, sky_posz, sky_negz])
    this.venus = new OBJLoader().parseObj(getAssets.statue)

    this.camera.radius = 6

  }
  uniform() {

    mat4.perspective(this.pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)

    mat4.multiply(this.tmpMatrix, this.pMatrix, this.vMatrix)

    let mMatrix = mat4.identity(mat4.create())
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skyMap.texture)

    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      uGamma: 2.2,
      uExposure: 1.,
      tex: 0
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.prg.use()
    this.skybox.bind(this.prg, ['position'])
    this.skybox.draw()

    let mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [-3,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.specularPrg.use()
    this.specularPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.cameraPos
    })
    for(let i =0;i<this.venus.length;i++){
      this.venus[i].bind(this.specularPrg, ['position', 'normal'])
      this.venus[i].draw()
    }

    mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [3,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.refractPrg.use()
    this.refractPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.cameraPos
    })
    for(let i =0;i<this.venus.length;i++){
      this.venus[i].bind(this.refractPrg, ['position', 'normal'])
      this.venus[i].draw()
    }
    
    mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [0,0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.refractPrg.use()
    this.refractPrg.style({
      mMatrix: mMatrix,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      skybox: 0,
      cameraPos: this.camera.cameraPos,
      etaRatio: [.65, .67,.69],
      fresnelPower: .8,
      fresnelBias: .1,
      fresnelScale: .9
    })
    for(let i =0;i<this.venus.length;i++){
      this.venus[i].bind(this.refractPrg, ['position', 'normal'])
      this.venus[i].draw()
    }
    
  }
}

