import simVelFs from 'shaders/petal/simVel.frag'
import Pipeline from '../PipeLine'
import vs from 'shaders/petal/save.vert'
import fs from 'shaders/petal/save.frag'
import petalVs from 'shaders/petal/petal.vert'
import Mesh from 'libs/Mesh'
import FrameBuffer from 'libs/FrameBuffer'
import {
	gl, canvas, GlTools
} from 'libs/GlTools'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import CameraOrtho from 'libs/cameras/CameraOrtho'
import Geom from 'libs/Geom'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class Petal extends Pipeline {
	_count = 0
	constructor() {
		super()
	}
	init() {
		this.saveprg = this.compile(vs, fs)
		this.renderPrg = this.basicColor(petalVs)

		window.params = {
			gamma: 2.2,
			exposure: 5,
			numParticles: 10,
			skipCount: 2,
			maxRadius: 12.5
		};


		this._vSim = new BatchBigTriangle(simVelFs)

		GlTools.applyHdrExtension()
		const numParticles = params.numParticles;
		const o = {
			minFilter: gl.NEAREST,
			magFilter: gl.NEAREST,
			hdr: true
		}
		this._fboCurrent = new FrameBuffer(numParticles * 2, numParticles * 2, o, 3);
		this._fboTarget = new FrameBuffer(numParticles * 2, numParticles * 2, o, 3);

		this.cameraOrtho = new CameraOrtho()
		this.orbital.radius = 5

	}

	_setGUI() {
		// this.addRadio('grass3', grasses, 'grass type', this.attrib.bind(this))
	}

	attrib() {
		this._initRender()
		this._initSave()
		this.mousePos = { x: 0, y: 0 }

	}

	prepare() {
		this.time = Math.random() * 0xFF;

		GlTools.srcBlend()

		GlTools.setCamera(this.cameraOrtho);

		this._fboCurrent.bind();
		this._renderSave()
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		this._renderSave()
		this._fboTarget.unbind();

		GlTools.setCamera(this.camera);

	}

	_initRender() {

		this.mesh = getAssets.petal
		const uvs = [];
		const numParticles = params.numParticles;
		let ux, uy;

		for (let j = 0; j < numParticles; j++) {
			for (let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uvs.push([ux, uy]);

			}
		}

		this.mesh.bufferInstance(uvs, 'aUV');

	}

	_initSave() {
		const positions = [];
		const coords = [];
		const indices = [];
		const extras = []
		let count = 0;

		const numParticles = params.numParticles;
		const totalParticles = numParticles * numParticles;
		let ux, uy;
		const range = 3;

		for (let j = 0; j < numParticles; j++) {
			for (let i = 0; i < numParticles; i++) {
				positions.push([random(-range, range), random(-range, range), random(-range, range)]);

				ux = i / numParticles - 1.0 + .5 / numParticles;
				uy = j / numParticles - 1.0 + .5 / numParticles;
				coords.push([ux, uy]);
				indices.push(count);
				extras.push([Math.random(), Math.random(), Math.random()])

				count++;

			}
		}

		this.meshSave = new Mesh(gl.POINTS);
		this.meshSave.bufferData(extras, 'aExtra', 3);
		this.meshSave.bufferVertex(positions);
		this.meshSave.bufferTexCoord(coords);
		this.meshSave.bufferIndex(indices);
	}

	_renderPetal(textureCurr, textureNext, percent, textureExtra) {
		this.time += 0.05
		this.renderPrg.bind();
		this.renderPrg.style({
			textureCurr,
			textureNext,
			textureExtra,
			percent,
			time: this.time,
			color: [1., 1., 1.]
		});

		GlTools.draw(this.mesh);
	}

	_renderSave() {
		this.saveprg.use()
		GlTools.draw(this.meshSave)
	}

	_renderSim(textureVel, textureExtra, texturePos) {
		this.time += .01;
		this._vSim.draw({
			textureVel,
			textureExtra,
			texturePos,
			time: this.time,
			maxRadius: params.maxRadius
		})
	}

	updateFbo() {
		GlTools.setCamera(this.cameraOrtho);

		this._fboTarget.bind();
		this._renderSim(this._fboCurrent.getTexture(2), this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0));
		this._fboTarget.unbind();

		GlTools.setCamera(this.camera);

		//	PING PONG
		const tmp = this._fboTarget;
		this._fboTarget = this._fboCurrent;
		this._fboCurrent = tmp;

	}

	render() {

		GlTools.clear()

		let p = 0;

		if (this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
		this._count++;

		GlTools.setCamera(this.camera);

		this._renderPetal(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, this._fboCurrent.getTexture(1));
		this.frameBufferGUI.textureList = [{ texture: this._fboCurrent.getTexture(0) }]
		//this._renderSim(this._fboCurrent.getTexture(2), this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0));

	}
}
