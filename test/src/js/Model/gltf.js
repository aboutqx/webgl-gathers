import Pipeline from '../PipeLine'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import GLTFLoader from 'libs/loaders/GLTFLoader'
import { GlTools } from 'libs/GlTools'

function ObjectPropertyMax(objectes, property) {
	let max = objectes[0][property]
	objectes.forEach(v => {
		if (v[property] > max) max = v[property]
	})
	return max
}
export default class GLTF extends Pipeline {
	count = 0
	constructor() {
		super()

	}
	init() {

		GlTools.srcBlend()
	}
	attrib() {

		this.orbital.radius = 7
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

		const gltfList = ['hebe', 'trees_and_foliage', 'chinatown_lion', 'BoomBox', 'FlightHelmet', 'horse_statuette', 'swan_sculpture', 'triton_on_a_frieze']
		const index = 1
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
				this.meshes = meshes

				console.log(ObjectPropertyMax(meshes, 'maxLength'), meshes)
				const scale = skySize / ObjectPropertyMax(meshes, 'maxLength') 
				this.scenes.forEach(scene => {
					if (scene.scaleX === 1 && scene.children[0].scaleX === 1)
						scene.scaleX = scene.scaleY = scene.scaleZ = scale
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
			this.scenes.forEach(scene => {
				GlTools.draw(scene)
			});
		}

	}
}

