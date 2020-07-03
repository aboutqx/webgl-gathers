import Pipeline from '../PipeLine'
import terrainFs from 'shaders/mountain/terrain.frag'
import noiseFs from 'shaders/mountain/noise.frag'
import skyFs from 'shaders/mountain/sky.frag'
import FrameBuffer from 'libs/FrameBuffer'
import {
    gl, random, canvas,
    GlTools
} from 'libs/GlTools'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import EaseNumber from 'utils/EaseNumber'
import BatchSky from 'helpers/BatchSky'
import { mat4 } from 'gl-matrix'
import * as Space from './Space'
import FboPingPong from "libs/FboPingPong"
import nebulaFs from "shaders/mountain/nebula.frag";

export default class Mountain extends Pipeline {
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
		this._vNebula = new BatchBigTriangle(nebulaFs)
	}
	
	_setGUI() {
		this.addPbrParams({
			gamma:2.2,
            exposure:2.5,

			metallic: 0,
			roughness: .95,
			specular: .5,
			color: [77, 76, 73],
			
		})
		this.addGUIParams({
			fogColor: [ 4.0, 2.0, 6.0 ]
		})
		this.gui.addColor(this.params, 'fogColor')
    }

    attrib() {

		const terrainSize = params.terrainSize

		this.terrain = getAssets.terrain//.plane(terrainSize, terrainSize, 125, 'xz');
		this.textureAo = getAssets.aoTerrain

		const d = 4096
		this.addLabel('seed', () => {
			
			this.starTetxure = Space.starTexture(d, d/2, 0.01, .26)
			this._prepareNebula()
		})

		this.pingpongFbo = new FboPingPong(d, d/2)
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
		

		this.sky = new BatchSky(params.terrainSize * 3., skyFs)

		GlTools.clear()
        this._fboNoise.bind();
        GlTools.clear(0, 0, 0, 0);
        this._renderNoise()
        this._fboNoise.unbind();
        
		
		this._fboNoise.getTexture().wrapS = this._fboNoise.getTexture().wrapT = gl.MIRRORED_REPEAT
		const d = 4096
		this.starTetxure = Space.starTexture(d, d/2, 0.01, .26)

		this._prepareNebula()
	}

	_prepareNebula() {

		const nebulaCount = 2
		for(let i = 0; i < nebulaCount; i++) {
			this.pingpongFbo.write.bind()
			GlTools.clear(0, 0, 0, 0);
			this._vNebula.draw({
				source: i == 0 ? this.starTetxure : this.pingpongFbo.read.textures[0],
				...Space.nebulaParams()
			})
			this.pingpongFbo.write.unbind()

			this.pingpongFbo.swap()
		}
		
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


		GlTools.clear(0, 0, 0)
		const textureNoise = this._fboNoise.getTexture();
		this._renderTerrain(textureNoise)

		
		this.sky.draw({
			texture0: this.pingpongFbo.read.textures[0],
			uFogColor: this.params.fogColor.map(v => v/255)
		})
		// this.frameBufferGUI.textureList = [{ texture: textureNoise }]
    }
}
