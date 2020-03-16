import Pipeline from '../PipeLine'
import {
	GlTools
} from 'libs/GlTools'
import vs from 'shaders/pbr/pbr.vert'
import fs from 'shaders/pbr/pbr.frag'
import mapFs from 'shaders/pbr/pbr_map.frag'

import {
	mat4,
} from 'gl-matrix'
import Geom from 'libs/Geom'


const nrRows = 7
const nrColumns = 7
const spacing = 4.8

export default class Pbr extends Pipeline {
	count = 0
	constructor() {
		super()

	}
	init() {
		this.prg = this.compile(vs, fs)
		this.mapPrg = this.compile(vs, mapFs)
	}
	attrib() {

		this.sphere = Geom.sphere(2, 100)

	}
	prepare() {
		this.orbital.radius = 36

	}
	uniform() {


	}
	_setGUI() {
		this.addGUIParams({
			lambertDiffuse: true,
			orenNayarDiffuse: false,
			metallic: .5,
			roughness: .5,
			map: 'none',
		})


		let folder1 = this.gui.addFolder('diffuse model')
		folder1.add(this.params, 'lambertDiffuse').listen().onChange(() => {
			this.setChecked('lambertDiffuse')
		})
		folder1.add(this.params, 'orenNayarDiffuse').listen().onChange(() => {
			this.setChecked('orenNayarDiffuse')
		})
		folder1.add(this.params, 'metallic', 0, 1).step(.1)
		folder1.add(this.params, 'roughness', 0, 1).step(.1)
		folder1.open()

		let folder2 = this.gui.addFolder('material map')
		folder2.add(this.params, 'map', ['none', 'plastic', 'wall', 'gold', 'grass', 'rusted_iron', 'wood']).listen().onChange(() => {
			this.setTexture()
		})
		folder2.open()

	}

	setChecked(prop) {
		this.params.lambertDiffuse = false
		this.params.orenNayarDiffuse = false
		this.params[prop] = true
	}

	setTexture() {
		let map = this.params.map
		if (map === 'none') return

		this.texture0 = getAssets[map + 'Albedo']
		this.texture1 = getAssets[map + 'Roughness']
		this.texture2 = getAssets[map + 'Metallic']
		this.texture3 = getAssets[map + 'Ao']
		this.texture4 = getAssets[map + 'Normal']
	}

	render() {

		GlTools.clear()

		let mMatrix = mat4.create()
		let baseUniforms = {

			lightPositions: [ // use flatten array for gl.uniform3fv
				-10., 10., 10.,
				10., 10., 10.,
				-10., -10., 10.,
				10., -10., 10.,
			],
			lightColors: new Array(12).fill(300.),
			lambertDiffuse: this.params.lambertDiffuse,
		}
		if (this.params.map === 'none') {
			this.prg.use()
			mat4.scale(mMatrix, mMatrix, [3, 3, 3])
			this.prg.style({
				...baseUniforms,
				albedo: [.1, .3, .3],
				ao: .1,
				metallic: this.params.metallic,
				roughness: this.params.roughness,
				mMatrix
			})
			GlTools.draw(this.sphere)

		} else {
			this.mapPrg.use()
			mat4.scale(mMatrix, mMatrix, [3, 3, 3])
			this.mapPrg.style({
				...baseUniforms,
				mMatrix,
				albedoMap: this.texture0,
				roughnessMap: this.texture1,
				metallicMap: this.texture2,
				aoMap: this.texture3,
				normalMap: this.texture4
			})
			GlTools.draw(this.sphere)
		}
	}
}

function clamp(value, min, max) {
	if (min > max) {
		return clamp(value, max, min);
	}

	if (value < min) return min;
	else if (value > max) return max;
	else return value;
}
