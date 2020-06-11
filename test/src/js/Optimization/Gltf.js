import Pipeline from '../PipeLine'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import GLTFLoader from 'libs/loaders/GLTFLoader'
import { GlTools } from 'libs/GlTools'

function objectesMaxProp(objectes, property) {
	let max = objectes[0][property]
	objectes.forEach(v => {
		if (v[property] > max) max = v[property]
	})
	return max
}
export default class GLTF extends Pipeline {
	constructor() {
		super()

	}
	init() {

		GlTools.srcBlend()
	}
	attrib() {

		this.orbital.radius = 15
		this.orbital.offset = [0, 2, 0]
		this.orbital.target = [0, 2, 0]

	}
	prepare() {

		this.env = 'studio9'
		this.textureIrr = getAssets[`${this.env}_irradiance`];
		this.textureRad = getAssets[`${this.env}_radiance`];
		this.textureBrdf = getAssets['brdfLUT']

		const skySize = 40
		this.skybox = new BatchSkyBox(skySize, this.textureRad)

		const gltfList = ['one_ring', 'hebe', 'trees_and_foliage', 'chinatown_lion', 'BoomBox', 'FlightHelmet', 'horse_statuette', 'swan_sculpture', 'triton_on_a_frieze']
		const index = 0
		const url = `assets/gltf/${gltfList[index]}/scene.gltf`
		GLTFLoader.load(url)
			.then((gltfInfo) => {
				this.gltf = gltfInfo;
				const { meshes } = gltfInfo.output;
				this.scenes = gltfInfo.output.scenes;

				meshes.forEach(mesh => {
					mesh.material.uniforms.uBRDFMap = this.textureBrdf;
					mesh.material.uniforms.uIrradianceMap = this.textureIrr;
					mesh.material.uniforms.uRadianceMap = this.textureRad;
				});

				this.gltfPrg = meshes[0].material.shader

				const scale = skySize / objectesMaxProp(meshes, 'maxLength') *.2
				console.log('maxLength:',objectesMaxProp(meshes, 'maxLength'), meshes, 'scale',scale)
				
				this.scenes.forEach(scene => {
					console.log(scene.scaleX, scene.children[0].scaleX )
					if (scene.scaleX === 1 && scene.children[0].scaleX === 1)
						scene.scale = scale
				})
			})
			.catch(e => {
				console.log('Error loading gltf:', e);
			})

	}
	uniform() {

	}
	render() {

		GlTools.clear()

		this.skybox.draw()

		if (this.scenes) {
			this.gltfPrg.use()
			GlTools.draw(this.scenes)

		}

	}
}

