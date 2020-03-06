import Pipeline from '../PipeLine'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import GLTFLoader from 'libs/loaders/GLTFLoader'
import { GlTools } from 'libs/GlTools'
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
    this.skybox = new BatchSkyBox(40, getAssets.outputskybox)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
  }
  attrib() {

  }
  prepare() {

    this.env = 'studio9'
    this.textureIrr = getAssets[`${this.env}_irradiance`];
    this.textureRad = getAssets[`${this.env}_radiance`];
    this.textureBrdf = getAssets['brdfLUT']

    const gltfList = ['hebe','chinatown_lion', 'BoomBox', 'FlightHelmet', 'horse_statuette', 'swan_sculpture', 'triton_on_a_frieze']
    const index = 0
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

  }
  render() {

    GlTools.clear()

    this.skybox.render()

    if(this.gltfPrg){
      this.gltfPrg.use()
    }

    if(this.scenes) {
			this.scenes.forEach( scene => {
        scene.scaleX = .01
        scene.scaleY = .01
        scene.scaleZ = .01
				GlTools.draw(scene)
			});	
		}
    
  }
}

