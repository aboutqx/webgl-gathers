import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import CustomShaders from 'libs/shaders/CustomShaders'
import GLTFLoader from 'libs/loaders/GLTFLoader'
import { GlTools } from 'libs/GlTools'

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
    this.skyboxPrg = this.compile(CustomShaders.skyboxVert, CustomShaders.skyboxFrag)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
  }
  attrib() {
    this.skybox = Geom.skybox(40)

  }
  prepare() {

    this.skyMap = getAssets.outputskybox

    this.env = 'studio3'
    this.textureIrr = getAssets[`${this.env}_irradiance`];
    this.textureRad = getAssets[`${this.env}_radiance`];
    this.textureBrdf = getAssets['brdfLUT']

    const gltfList = ['chinatown_lion', 'BoomBox', 'FlightHelmet', 'horse_statuette', 'swan_sculpture', 'triton_on_a_frieze']
    const index = 1
    const url = `assets/gltf/${gltfList[index]}/scene.gltf`
    GLTFLoader.load(url)
    .then((gltfInfo)=> {
        this.gltf = gltfInfo;
        const { meshes } = gltfInfo.output;
        this.scenes = gltfInfo.output.scenes;

        meshes.forEach( mesh => {
            mesh.material.uniforms.uBRDFMap = this.textureBrdf;
            mesh.material.uniforms.uIrradianceMap = this.textureIrr;
            mesh.material.uniforms.uRadianceMap = this.textureRad;
        });

        this.gltfPrg = meshes[0].material.shader
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

    this.skyboxPrg.use()
    this.skyboxPrg.style({
      mvpMatrix: this.mvpMatrix,
      uGamma: 2.2,
      uExposure: 5.,
      tex: this.skyMap
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    this.skyboxPrg.use()
    this.skybox.bind()
    GlTools.draw(this.skybox)

    if(this.gltfPrg){
      this.gltfPrg.use()
    }

    if(this.scenes) {
			this.scenes.forEach( scene => {
        scene.scaleX = 100
        scene.scaleY = 100
        scene.scaleZ = 100
				GlTools.draw(scene)
			});	
		}
    
  }
}

