import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/grass/grass.vert'
import fs from 'shaders/grass/grass.frag'
import floorVs from 'shaders/grass/floor.vert'
import floorFs from 'shaders/grass/floor.frag'
import Mesh from 'libs/Mesh'
import FrameBuffer from 'libs/FrameBuffer'
import {
    vec3,
    mat4,
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'
import BatchNoise from 'helpers/BatchNoise'
import EaseNumber from 'utils/EaseNumber'

const random = function (min, max) { return min + Math.random() * (max - min); }
const colours = [
	[64 / 255, 109 / 255, 26 / 255],
	[97 / 255, 148 / 255, 41 / 255],
	[113 / 255, 162 / 255, 55 / 255],
	[98 / 255, 154 / 255, 39 / 255],
	[128 / 255, 171 / 255, 71 / 255]
];

const getColor = function() {
	return colours[Math.floor(Math.random() * colours.length)];
}

const distance = function(a, b) {
	let dx = a[0] - b[0];
	let dz = a[2] - b[2];
	return Math.sqrt( dx * dx + dz * dz);
}

export default class Grass extends Pipeline {
	_traveled = 0
	_lightIntensity = new EaseNumber(1, 0.01)
	_speed = new EaseNumber(0.01, 0.005)

    constructor() {
        super()

    }
    init() {
        this.prg = this.compile(vs, fs)
		this.floorPrg = this.compile(floorVs, floorFs)

        window.params = {
            gamma:5.2,
            exposure:5,
            terrainSize:55,
            maxHeight:1,
            grassRange:20,
            pushStrength:0,
            speed:-0.01,
            time:0,
            noiseScale:2.5,
            isOne:false,
            numGrass:700,
            grassColor:[98, 152, 83]
        };

        this.position = [0, 2.5, -8.5];

		const { terrainSize } = params;

		let u = this.position[0] / terrainSize * .5 + .5;
		let v = 1.0 - (this.position[2] / terrainSize * .5 + .5);
        this.uvOffset = [u, v];
    }
    attrib() {

        if(this.mesh) {
			this.mesh = null;
		}

		const positions = [];
		const coords = [];
		const indices = [];
		const normals = [];
		const NUM_GRASS = params.numGrass;
		const RANGE = params.terrainSize/2 * .8;

		this.range = RANGE;

		let index = 0;

		const W = 1.5;
		const H = W;
		const m = mat4.create();

		function rotate(v, a) {
			let vv = vec3.clone(v);
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);
			vec3.transformMat4(vv, vv, m);

			return vv;
		}

		function addPlane(angle) {
			const yOffset = -1.5;
			positions.push(rotate([-W, 0+yOffset, 0], angle));
			positions.push(rotate([ W, 0+yOffset, 0], angle));
			positions.push(rotate([ W, H+yOffset, 0], angle));
			positions.push(rotate([-W, H+yOffset, 0], angle));

			coords.push([0, 0]);
			coords.push([1, 0]);
			coords.push([1, 1]);
			coords.push([0, 1]);

			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));

			indices.push(index*4 + 0);
			indices.push(index*4 + 1);
			indices.push(index*4 + 2);
			indices.push(index*4 + 0);
			indices.push(index*4 + 2);
			indices.push(index*4 + 3);
			
			index ++;
		}

		const RAD = Math.PI / 180;
		addPlane(0);
		addPlane(120 * RAD);
		addPlane(240 * RAD);

		const terrainSize = params.terrainSize

		function getMesh(numInstances) {
			const mesh = new Mesh(undefined, 'grass');
			mesh.bufferVertex(positions);
			mesh.bufferNormal(normals);
			mesh.bufferTexCoord(coords);
			mesh.bufferIndex(indices);

			const positionOffsets = [];
			const colors = [];
			const extras = [];
			let cnt = 0;

			function checkDist(pos) {
				if(positionOffsets.length == 0) {
					return false;
				}

				const MIN_DIST = 1.14;
				let p, d;
				for(let i=0; i<positionOffsets.length; i++) {
					p = positionOffsets[i];
					d = distance(p, pos);

					if( d < MIN_DIST) {
						return true;
					}
				}

				return false;
			}

			for(let i = 0; i < numInstances; i++) {
				let pos;
				let pos2D;
				cnt = 0;
				do {
					pos = [random(-RANGE, RANGE), random(1.65, 1.5), random(-RANGE, RANGE)];	
					cnt ++;
				} while(checkDist(pos) && cnt < 100);

				positionOffsets.push(pos);
				colors.push(getColor());
				extras.push([Math.random() > .5 ? 0 : .5, Math.random() * Math.PI * 2 ]);
			}

			mesh.bufferInstance(positionOffsets, 'aPosOffset');
			mesh.bufferInstance(colors, 'aColor');
			mesh.bufferInstance(extras, 'aExtra');
			return mesh;
		}

		this.mesh = getMesh(NUM_GRASS);

		this._textureGrass = getAssets.grass

		this.floor = Geom.plane(terrainSize, terrainSize, 125, 'xz');
		this.floorColor = [64.0/255.0, 122.0/255.0, 42.0/255.0];
    }


    prepare() {

		this.orbital.radius = 17
		this.orbital.rx.value = Math.PI - 0.1;
		this.orbital.ry.value = .15;
		this.orbital.ry.limit(.2, .26);
        //this.orbital.offset = [60, 60, 0]

		const noiseSize = 64;
        this._fboNoise = new FrameBuffer(noiseSize, noiseSize, { }, 3)
		this._vNoise = new BatchNoise()
		GlTools.srcBlend()
	}
	
	_renderFloor(textureHeight, textureNormal) {
		const { maxHeight } = params;
		const color = [params.grassColor[0]/255, params.grassColor[1]/255, params.grassColor[2]/255];

		this.floorPrg.use();
		// this.floorPrg.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.floorPrg.style({
			texture0: textureHeight,
			textureNormal,
			uMaxHeight: maxHeight,
			uBaseColor: color,
			uUVWolf: this.uvOffset,
			uLightIntensity: this._lightIntensity.value
		})

		GlTools.draw(this.floor);
	}

    _renderGrass(textureHeight, textureNormal, textureNoise) {
        const { maxHeight, terrainSize, speed, noiseScale, isOne } = params;
		const totalDist = terrainSize / noiseScale;
		this._traveled += speed;
		const distForward = this._traveled * totalDist;

        this.prg.use()
        this.prg.style({
            texture0: this._textureGrass,
            textureHeight,
            textureNormal,
            textureNoise,
            uMaxHeight: maxHeight,
            uTerrainSize: this.range,
            uDistForward: distForward,
            uUVWolf: this.uvOffset,
            uLightIntensity: this._lightIntensity.value
		})

		GlTools.draw(this.mesh)
    }

    render() {
		params.speed = - this._speed.value;
		params.time += params.speed;

        GlTools.clear()
        this._fboNoise.bind();
        GlTools.clear(0, 0, 0, 0);
        this._vNoise.draw();
        this._fboNoise.unbind();
        
        const textureHeight = this._fboNoise.getTexture(0);
        const textureNormal = this._fboNoise.getTexture(1);
        const textureNoise = this._fboNoise.getTexture(2);

        gl.disable(gl.CULL_FACE);
        this._renderGrass(textureHeight, textureNormal, textureNoise)
		gl.enable(gl.CULL_FACE);
		this._renderFloor(textureHeight, textureNormal)

		this.frameBufferGUI.textureList = [{ texture: textureHeight}]
		
    }
}
