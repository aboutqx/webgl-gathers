/*
 https://developer.download.nvidia.cn/CgTutorial/cg_tutorial_chapter07.html
*/
import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/skybox/skybox.vert'
import fs from 'shaders/skybox/skybox.frag'
import GLTFLoader from 'libs/loaders/GLTFLoader'
import GLCubeTexture from 'libs/GLCubeTexture'
import HDRParser from 'libs/loaders/HDRParser'

import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

export default class GLTF extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)

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
    const url = 'assets/gltf/FlightHelmet.gltf';
    GLTFLoader.load(url)
    .then((gltfInfo)=> {
        this.gltf = gltfInfo;
        const { meshes } = gltfInfo.output;
        this.scenes = gltfInfo.output.scenes;
console.log(this.scenes)
        meshes.forEach( mesh => {
            mesh.material.uniforms.uBRDFMap = this.textureBrdf;
            mesh.material.uniforms.uIrradianceMap = this.textureIrr;
            mesh.material.uniforms.uRadianceMap = this.textureRad;
        });

    })
    .catch(e => {
        console.log('Error loading gltf:', e);
    });

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
      uExposure: 5.,
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


    
  }
}

