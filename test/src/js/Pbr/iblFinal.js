import Pipeline from '../PipeLine'
import {
	gl,
	canvas,
	toRadian
} from 'libs/GlTools'
import vs from 'shaders/ibl_final/pbr_ibl.vert'
import fs from 'shaders/ibl_final/pbr_ibl.frag'
import mapFs from 'shaders/ibl_final/pbr_map.frag'
import cubeVs from 'shaders/ibl_final/cubemap.vert'
import cubeFs from 'shaders/ibl_final/equirectangular_to_cubemap.frag'
import skyboxVs from 'shaders/ibl_final/skybox.vert'
import skyboxFs from 'shaders/ibl_final/skybox.frag'
import prefilterFs from 'shaders/ibl_final/prefilter.frag'
import simple2dVs from 'shaders/ibl_final/simple2d.vert'
import brdfFs from 'shaders/ibl_final/brdf.frag'
import irradianceFs from 'shaders/ibl_final/irradiance_convolution.frag'

import Geom from 'libs/Geom'
import {
	mat4,
	vec3
} from 'gl-matrix'
import { GlTools } from '../../../libs/GlTools'

export default class IblFinal extends Pipeline {
	count = 0
	constructor() {
		super()

	}
	init() {
		// use webgl2
		GlTools.applyHdrExtension()
		this.prg = this.compile(vs, fs)
		// this.mapPrg = this.compile(vs, mapFs)
		this.cubePrg = this.compile(cubeVs, cubeFs)
		this.skyboxPrg = this.compile(skyboxVs, skyboxFs)
		this.prefilterPrg = this.compile(cubeVs, prefilterFs)
		this.brdfPrg = this.compile(simple2dVs, brdfFs)
		this.irradiancePrg = this.compile(cubeVs, irradianceFs)
	}
	attrib() {
		this.sphere = Geom.sphere(2, 100)

		this.cube = Geom.cube(2)

		this.plane = Geom.plane(4, 4, 10)

		this.quad = Geom.bigTriangle
	}
	prepare() {

		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LEQUAL)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

		let pMatrix = mat4.create()
		let mMatrix = mat4.create()
		let vMatrix = mat4.create()
		let vpMatrix = mat4.create()

		mat4.perspective(pMatrix, toRadian(90), 1., .1, 100)
		const CAMERA_SETTINGS = [
			[vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0)],
			[vec3.fromValues(0, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0)],
			[vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)],
			[vec3.fromValues(0, 0, 0), vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1)],
			[vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0)],
			[vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0)]
		]


		this.hdrTexture = getAssets.equirectangular

		// cubemap
		let cubemapTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture)
		for (var i = 0; i < 6; i++) {
			//r,l,u,d,b,f 为6个面指定空数据
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 512, 512, 0, gl.RGBA, gl.FLOAT, null)
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.cubemapTexture = cubemapTexture


		this.cubePrg.use()
		this.hdrTexture.bind(0)

		gl.viewport(0, 0, 512, 512)
		let captureFrameBuffer = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)

		for (let i = 0; i < 6; i++) {
			mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
			mat4.multiply(vpMatrix, pMatrix, vMatrix)
			this.cubePrg.style({
				equirectangularMap: 0,
				vpMatrix,
				mMatrix: mMatrix
			})
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemapTexture, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

			GlTools.draw(this.cube)
		}
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP) // has to be placed here，to generate each face data

		const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
		if (status != gl.FRAMEBUFFER_COMPLETE) {
			console.log(`gl.checkFramebufferStatus() returned ${status.toString(16)}`);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		// irradiance map
		let irradianceMap = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap)
		for (var i = 0; i < 6; i++) {
			//r,l,u,d,b,f 为6个面指定空数据
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 32, 32, 0, gl.RGBA, gl.FLOAT, null)
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.irradianceMap = irradianceMap

		gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
		gl.viewport(0, 0, 32, 32);
		this.irradiancePrg.use()
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture); // 放在这，防止new cubeframebuffer时绑定了tetxure0到null

		for (let i = 0; i < 6; i++) {
			mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
			mat4.multiply(vpMatrix, pMatrix, vMatrix)
			this.irradiancePrg.style({
				environmentMap: 0,
				vpMatrix,
				mMatrix: mMatrix
			})
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.irradianceMap, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

			GlTools.draw(this.cube)
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		// prefilter map
		this.prefilterMap = gl.createTexture();
		let prefilterSize = 128
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap);

		for (var i = 0; i < 6; i++) {
			//r,l,u,d,b,f 为6个面指定空数据
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, prefilterSize, prefilterSize, 0, gl.RGBA, gl.FLOAT, null)
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP)

		this.prefilterPrg.use()
		let maxMipLevels = 5
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture); // 放在这，防止new cubeframebuffer时绑定了tetxure0到null

		gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
		for (let mip = 0; mip < maxMipLevels; mip++) {
			let mipWidth = 128 * Math.pow(.5, mip)
			let mipHeight = mipWidth
			gl.viewport(0, 0, mipWidth, mipHeight)
			let roughness = mip / (maxMipLevels - 1)
			for (let i = 0; i < 6; i++) {

				mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
				mat4.multiply(vpMatrix, pMatrix, vMatrix)
				this.prefilterPrg.style({
					environmentMap: 0,
					vpMatrix,
					mMatrix: mMatrix,
					roughness
				})
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
					gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.prefilterMap, mip);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

				GlTools.draw(this.cube)
			}
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		//brdf lookup texture
		this.brdfLUTTexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, 512, 512, 0, gl.RG, gl.FLOAT, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

		gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.brdfLUTTexture, 0);
		gl.viewport(0, 0, 512, 512)
		this.brdfPrg.use()
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		GlTools.draw(this.quad)

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	}
	uniform() {


	}
	_setGUI() {
		this.addGUIParams({
			roughness: 0.2,
			metallic: 6 / 7,
			lambertDiffuse: true,
			orenNayarDiffuse: false,
			map: 'none',
		})

		let folder = this.gui.addFolder('material param')
		folder.add(this.params, 'roughness', 0.05, 1).step(0.01)
		folder.add(this.params, 'metallic', 0, 6 / 7).step(0.01)
		folder.open()

		let folder1 = this.gui.addFolder('diffuse model')
		folder1.add(this.params, 'lambertDiffuse').listen().onChange(() => {
			this.setChecked('lambertDiffuse')
		})
		folder1.add(this.params, 'orenNayarDiffuse').listen().onChange(() => {
			this.setChecked('orenNayarDiffuse')
		})
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
		gl.viewport(0, 0, canvas.width, canvas.height)
		GlTools.clear()

		let mMatrix = mat4.create()
		let baseUniforms = {
			mMatrix,
			lightPositions: [ // use flatten array for gl.uniform3fv
				-10., 10., 10.,
				10., 10., 10.,
				-10., -10., 10.,
				10., -10., 10.,
			],
			lightColors: new Array(12).fill(300.),
			camPos: this.eyeDirection,
			lambertDiffuse: this.params.lambertDiffuse,
			irradianceMap: 0
		}

		if (this.params.map === 'none') {
			this.prg.use()
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap)
			gl.activeTexture(gl.TEXTURE1)
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap)
			gl.activeTexture(gl.TEXTURE2)
			gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture);
			this.prg.style({
				...baseUniforms,
				albedo: [.5, .0, .0],
				roughness: this.params.roughness,
				metallic: this.params.metallic,
				ao: 1.,
				irradianceMap: 0,
				prefilterMap: 1,
				brdfLUT: 2
			})
			this.sphere.bind(this.prg, ['position', 'normal'])
		} else {
			this.mapPrg.use()


			this.mapPrg.style({
				...baseUniforms,
				albedoMap: this.texture0,
				roughnessMap: this.texture1,
				metallicMap: this.texture2,
				aoMap: this.texture3,
				normalMap: this.texture4
			})

		}
		GlTools.draw(this.sphere)

		// this.cubePrg.use()
		// this.hdrTexture.bind(0)
		// this.cubePrg.style({
		//   equirectangularMap: 0,
		//   vpMatrix: this.tmpMatrix,
		//   mMatrix: mMatrix
		// })
		// this.cube.bind(this.cubePrg, ['position', 'texCoord'])
		// this.cube.draw()

		// this.planeVao.bind()
		// this.planeBuffer.drawTriangles()
		// this.planeVao.unbind()

		this.skyboxPrg.use()
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap)

		this.skyboxPrg.style({
			environmentMap: 0,
			mMatrix,
		})
		this.cube.bind(this.skyboxPrg, ['position'])
		this.cube.draw()

		// brdf out为vec2，设置为vec4时显示正常
		// this.brdfPrg.use()
		// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// this.quad.bind(this.brdfPrg)
		// this.quad.draw(gl.TRIANGLE_STRIP)
	}
}
