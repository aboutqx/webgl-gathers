import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import fs from 'shaders/light_caster/directionalLight.frag'
import pointFs from 'shaders/light_caster/pointLight.frag'
import spotFs from 'shaders/light_caster/spotLight.frag'

import {
	mat4, vec3
} from 'gl-matrix'
import {
	toRadian,
	GlTools
} from 'libs/GlTools'

const lightColor = [1.6, 1.6, 1.6]
const cubePosition = [
	[0.0, 0.0, 0.0],
	[2.0, 5.0, -15.0],
	[-2.5, -2.2, -2.5],
	[-1.8, -2.0, -12.3],
	[2.4, -0.4, -3.5],
	[-1.7, 3.0, -7.5],
	[1.3, -2.0, -2.5],
	[1.5, 2.0, -2.5],
	[2.5, 0.2, -1.5],
	[-0.9, 1.0, -1.5]
]
export default class LightCaster extends Pipeline {
	count = 0
	lightPos
	constructor() {
		super()

	}
	init() {
		this.prg = this.basicVert(fs)
		this.pointPrg = this.basicVert(pointFs)
		this.spotPrg = this.basicVert(spotFs)
		this.lampPrg = this.basicColor()
	}
	attrib() {

		this.cube = Geom.cube(1)

		this.lamp = Geom.sphere(.1, 20)
	}
	prepare() {

		this.diffuseTexture = getAssets.cubeSpecular
		this.specularTexture = getAssets.cubeSpecular
		this.emissionTexture = getAssets.cubeEmission

		this.orbital.radius = 6
	}
	
	_setGUI() {
		this.setRadio('pointLight', ['directionalLight', 'pointLight', 'spotLight'], 'light type')
	}

	uniform() {

	}

	_renderLight() {
		
		let mMatrix = mat4.create()
		mat4.scale(mMatrix, mMatrix, [.5, .5, .5])
		mat4.translate(mMatrix, mMatrix, this.lightPos)
		this.lampPrg.use()
		this.lampPrg.style({
			mMatrix,
			color: lightColor
		})
		GlTools.draw(this.lamp)
	}

	_renderCube(prg){
		cubePosition.map((position, i) => {
			let cubemMatrix = mat4.create()
			mat4.rotate(cubemMatrix, cubemMatrix, toRadian(20 * i), this.lightPos)
			mat4.translate(cubemMatrix, cubemMatrix, position)
			mat4.rotate(cubemMatrix, cubemMatrix, toRadian(performance.now()/10), position)
			prg.style({
				mMatrix: cubemMatrix
			})
			GlTools.draw(this.cube)
		})
	}

	render() {
		GlTools.clear(0, 0 , 0)

		const customUniforms = {
			'material.shininess': 30,
			'material.diffuse': this.diffuseTexture,
			'material.specular': this.specularTexture,
			'material.emission': this.emissionTexture,
			'light.ambient': [.1, .1, .1],
			'light.diffuse': lightColor,
			'light.specular': [.3, .3, .3]
		}
		if (this.params.directionalLight) {
			this.lightPos = [0, 0, 1].map(v => v * 20)
			let lightDir = vec3.create()
			vec3.negate(lightDir, this.lightPos)
			this.prg.use()
			this.prg.style({
				...customUniforms,
				'light.direction': lightDir //光源方向为从光源出发，因此是坐标向量取负
			})
			this._renderCube(this.prg)

		} else if (this.params.pointLight) {
			this.pointPrg.use()

			this.lightPos = [0, 0, -1.5]
			this.pointPrg.style({
				...customUniforms,
				'light.position': this.lightPos,
				//衰减系数
				'light.constant': 1,
				'light.linear': .09,
				'light.quadratic': .032
			})
			this._renderCube(this.pointPrg)

		} else if (this.params.spotLight) {
			this.lightPos = [0, 0, 1].map(v => v * 6)
			let lightDir = vec3.create()
			vec3.negate(lightDir, this.lightPos)
			this.spotPrg.use()
			
			this.spotPrg.style({
				...customUniforms,
				'light.position': this.lightPos,
				'light.direction': lightDir,
				'light.cutOff': Math.cos(toRadian(12.5)),
				'light.outerCutOff': Math.cos(toRadian(15.5)),

				//衰减系数
				'light.constant': 1,
				'light.linear': .09,
				'light.quadratic': .032
			})
			this._renderCube(this.spotPrg)
		}

		this._renderLight()
	}
}
