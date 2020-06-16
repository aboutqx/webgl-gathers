import Pipeline from '../PipeLine'
import vs from 'libs/glsl/particle/save.vert'
import fs from 'libs/glsl/particle/save.frag'
import renderVs from 'libs/glsl/particle/render.vert'
import renderFs from 'libs/glsl/particle/render.frag'
import simFs from 'libs/glsl/particle/sim.frag'
import Mesh from 'libs/Mesh'
import FrameBuffer from 'libs/FrameBuffer'
import {
    gl, canvas, GlTools
} from 'libs/GlTools'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import CameraOrtho from 'libs/cameras/CameraOrtho'
import MouseMove from 'libs/utils/MouseMove'

const random = function (min, max) { return min + Math.random() * (max - min); }


export default class Particle extends Pipeline {
    _count = 0
    constructor() {
		super()
    }
    init() {
        this.saveprg = this.compile(vs, fs)
		this.renderPrg = this.compile(renderVs, renderFs)

        window.params = {
            gamma:2.2,
            exposure:5,
            numParticles:20,
            skipCount: 3
        };


		this._vSim = new BatchBigTriangle(simFs)

		GlTools.applyHdrExtension()
        const numParticles = params.numParticles;
		const o = {
			minFilter:gl.NEAREST,
			magFilter:gl.NEAREST,
			hdr: true
		}
		this._fboCurrent = new FrameBuffer(numParticles*2, numParticles*2, o);
		this._fboTarget  = new FrameBuffer(numParticles*2, numParticles*2, o);

		this.cameraOrtho = new CameraOrtho()
		this.orbital.radius = 10
		this.orbital.updateMatrix()
		this.orbital.destroy()
	}
	
	_setGUI() {
        // this.addRadio('grass3', grasses, 'grass type', this.attrib.bind(this))
    }

    attrib() {
        this._initRender()
		this._initSave()
		this.mousePos = {x:0, y:0}
        MouseMove.addEvents(null, (e) => MouseMove.getPos(e, this.mousePos))
    }

    prepare() {
		this.time = Math.random() * 0xFF;

		GlTools.srcBlend()

        GlTools.setCamera(this.cameraOrtho);

		this._fboCurrent.bind();
		GlTools.clear(0, 0, 0, 0);
		this._renderSave()

		this._fboCurrent.unbind();
        gl.viewport(0, 0, canvas.width, canvas.height);
        GlTools.setCamera(this.camera);
        

    }
    
    _initRender() {
        const positions    = [];
		const indices      = []; 
		let count        = 0;
		const numParticles = params.numParticles;
		let ux, uy;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				ux = i/numParticles;
				uy = j/numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new Mesh(gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
    }

    _initSave() {
        const positions = [];
		const coords = [];
		const indices = []; 
		let count = 0;

		const numParticles = params.numParticles;
		const totalParticles = numParticles * numParticles;
		let ux, uy;
		const range = 1.5;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				positions.push([random(-range, range), random(-range, range), random(-range, range)]);

				ux = i/numParticles-1.0 + .5/numParticles;
				uy = j/numParticles-1.0 + .5/numParticles;
				coords.push([ux, uy]);
				indices.push(count);
				count ++;


				positions.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy+1.0]);
				indices.push(count);
				count ++;

			}
		}

		this.saveMesh = new Mesh(gl.POINTS);
		this.saveMesh.bufferVertex(positions);
		this.saveMesh.bufferTexCoord(coords);
		this.saveMesh.bufferIndex(indices);
    }

	_render(texture, textureNext, percent) {
		this.renderPrg.bind();
		this.renderPrg.style({
            texture0: texture,
            textureNext,
            percent
        });

		GlTools.draw(this.mesh);
	}

	_renderSave() {
        this.saveprg.use()
        GlTools.draw(this.saveMesh)
	}

    _renderSim(texture) {
		this.time += .01;
        this._vSim.draw({
            texture0 :texture,
            time: this.time,
			skipCount: params.skipCount,
			mousePos: [this.mousePos.x/canvas.width, this.mousePos.y/canvas.height]
        })
    }

    updateFbo() {
        GlTools.setCamera(this.cameraOrtho);

		this._fboTarget.bind();
		GlTools.clear(0, 0, 0, 0);
		this._renderSim(this._fboCurrent.getTexture());
		this._fboTarget.unbind();
		gl.viewport(0, 0, canvas.width, canvas.height);
		GlTools.setCamera(this.camera);

		//	PING PONG
		var tmp = this._fboTarget;
		this._fboTarget = this._fboCurrent;
		this._fboCurrent = tmp;

    }
    
    render() {

        GlTools.clear()    
        
        let p = 0;

		if(this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
        this._count ++;
        
        GlTools.setCamera(this.camera);

		this._render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p);

    }
}
