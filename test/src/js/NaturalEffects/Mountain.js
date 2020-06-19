import Pipeline from '../PipeLine'

import terrainVs from 'shaders/mountain/terrain.vert'
import terrainFs from 'shaders/mountain/terrain.frag'
import noiseFs from 'shaders/noise.frag'
import Mesh from 'libs/Mesh'
import FrameBuffer from 'libs/FrameBuffer'
import {
    gl, random,
    GlTools
} from 'libs/GlTools'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import EaseNumber from 'utils/EaseNumber'
import BatchSkyBox from 'helpers/BatchSkyBox'


export default class Mountain extends Pipeline {
	_traveled = 0
	_lightIntensity = new EaseNumber(1., 0.01)
	_speed = new EaseNumber(0.01, 0.005)

    constructor() {
        super()

    }
    init() {
		this.terrainPrg = this.compile(terrainVs, terrainFs)

        window.params = {
			terrainSize:20,

            speed:-0.01,
            time:0,
            noiseScale:2.5,

			fogColor: [253, 232, 153].map(v => v/255 * 1.)
        };


		this._vNoise = new BatchBigTriangle(noiseFs)


        this.time = Math.random() * 0xFF;
		this.seed = Math.random() * 0xFF;
        this.test = new EaseNumber(0);
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

    }


    prepare() {

		this.orbital.radius = 35
		this.orbital.rx.value = .3;
		this.orbital.ry.value = .05;
		this.orbital.ry.limit(0.05, Math.PI * 0.1);
        this.orbital.offset = [0, 1, 0]
		// this.orbital.target = [0, 5, 0]

		const noiseSize = 64;
        this._fboNoise = new FrameBuffer(noiseSize, noiseSize, { }, 3)

		GlTools.srcBlend()


		this.textureIrr = getAssets[`irr`];
		this.textureRad = getAssets[`radiance`];
		this.textureAo = getAssets.aoTerrain

		this.sky = new BatchSkyBox(params.terrainSize * 2)

	}
	

	_renderNoise() {
		const { speed, noiseScale, isOne } = params;
		this.time += speed;

		this.test.value = isOne ? 1 : 0;

		this._vNoise.draw({
			mTime: this.time,
			uSeed: this.seed,
			uNoiseScale: noiseScale
		});
		// this.noisePrg.uniform("uTime", "float", this.test.value);

	}

	_renderTerrain(textureNoise) {
		const { metallic, specular, roughness, color, gamma, exposure } = this.params;

		this.terrainPrg.use();
		this.terrainPrg.style({
			uPosition: [0, -0.325, 0],
			uScale: [.3 ,.3 *.1, .3],
			uMetalness: metallic,
			uRoughness: roughness,
			uSpecular: specular,

			uNoiseMap: textureNoise,
			uBaseColor: color.map( v => v/255),
			uRadianceMap: this.textureRad,
			uIrradianceMap: this.textureIrr,
			uAoMap: this.textureAo,
			uGamma: gamma,
			uExposure: exposure
		})

		GlTools.draw(this.terrain);
	}



    render() {
		params.speed = - this._speed.value;
		params.time += params.speed;

        GlTools.clear()
        this._fboNoise.bind();
        GlTools.clear(0, 0, 0, 0);
        this._renderNoise()
        this._fboNoise.unbind();
        
        const textureHeight = this._fboNoise.getTexture(0);
        const textureNormal = this._fboNoise.getTexture(1);
        const textureNoise = this._fboNoise.getTexture(2);


		this._renderTerrain(textureNormal)


		this.sky.draw(this.textureRad, params.fogColor)
    }
}
