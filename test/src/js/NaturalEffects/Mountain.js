import Pipeline from '../PipeLine'
import terrainFs from 'shaders/mountain/terrain.frag'
import noiseFs from 'shaders/mountain/noise.frag'
import skyFs from 'shaders/mountain/sky.frag'
import FrameBuffer from 'libs/FrameBuffer'
import {
    gl, random,
    GlTools
} from 'libs/GlTools'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import EaseNumber from 'utils/EaseNumber'
import BatchSky from 'helpers/BatchSky'
import { mat4 } from 'gl-matrix'


export default class Mountain extends Pipeline {
	_traveled = 0
	_lightIntensity = new EaseNumber(1., 0.01)
	_speed = new EaseNumber(0.01, 0.005)

    constructor() {
        super()

    }
    init() {
		this.terrainPrg = this.basicVert(terrainFs)

        window.params = {
			terrainSize:20,

			fogColor: [ 254.0/255.0, 242.0/255.0, 226.0/255.0 ]
        };


		this._vNoise = new BatchBigTriangle(noiseFs)

	}
	
	_setGUI() {
		this.addPbrParams({
			gamma:2.2,
            exposure:2.5,

			metallic: 0,
			roughness: .95,
			specular: .5,
			color: [77, 76, 73]
		})

    }

    attrib() {

		const terrainSize = params.terrainSize

		this.terrain = getAssets.terrain//.plane(terrainSize, terrainSize, 125, 'xz');
		this.textureAo = getAssets.aoTerrain
    }


    prepare() {

		this.orbital.radius = 22
		this.orbital.rx.value = .3;
		this.orbital.ry.value = -.3;
		this.orbital.ry.limit(-0.3, -0.2);
        this.orbital.offset = [0, 4, 0]
		// this.orbital.target = [0, 5, 0]

		const noiseSize = 32 * 16; // scale for smooth
        this._fboNoise = new FrameBuffer(noiseSize, noiseSize)

		GlTools.srcBlend()

		this.textureIrr = getAssets[`irr`];
		this.textureRad = getAssets[`radiance`];
		

		this.sky = new BatchSky(params.terrainSize * 3.2, skyFs)

		GlTools.clear()
        this._fboNoise.bind();
        GlTools.clear(0, 0, 0, 0);
        this._renderNoise()
        this._fboNoise.unbind();
        
		
		this._fboNoise.getTexture().wrapS = this._fboNoise.getTexture().wrapT = gl.MIRRORED_REPEAT

	}
	

	_renderNoise() {


		this._vNoise.draw({

		});
		// this.noisePrg.uniform("uTime", "float", this.test.value);

	}

	_renderTerrain(textureNoise) {
		const { metallic, specular, roughness, color, gamma, exposure } = this.params;
		const mMatrix = mat4.create()
		mat4.translate(mMatrix, mMatrix, [0, -3, 0])
		mat4.scale(mMatrix, mMatrix, [.3, .3 * .1, .3])
		this.terrainPrg.use();
		this.terrainPrg.style({
			mMatrix,
			uMetallic: metallic,
			uRoughness: roughness,
			uSpecular: specular,

			uNoiseMap: textureNoise,
			uBaseColor: color.map( v => v/255),
			uRadianceMap: this.textureRad,
			uIrradianceMap: this.textureIrr,
			uAoMap: this.textureAo,
			uGamma: gamma,
			uExposure: exposure,

			uFogDensity: .04,
			uFogOffset: -0.01,
			uFogColor: params.fogColor
		})

		GlTools.draw(this.terrain);
	}



    render() {


		GlTools.clear()
		const textureNoise = this._fboNoise.getTexture();
		this._renderTerrain(textureNoise)

		
		this.sky.draw(getAssets.nightSky, params.fogColor)
		// this.frameBufferGUI.textureList = [{ texture: textureNoise }]
    }
}
