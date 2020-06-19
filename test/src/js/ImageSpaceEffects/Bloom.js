import Pipeline from '../PipeLine'
import fs from 'libs/glsl/bloom/bloom.frag'
import blurFs from 'libs/glsl/bloom/blur.frag'
import finalFs from 'libs/glsl/bloom/bloom_final.frag'
import {
    mat4
} from 'gl-matrix'
import {
    gl,
    GlTools,
    canvas
} from 'libs/GlTools'
import Geom from 'libs/Geom'
import BatchBigTriangle from 'helpers/BatchBigTriangle'
import FrameBuffer from 'libs/FrameBuffer'
import FboPingPong from 'libs/FboPingPong'

export default class Bloom extends Pipeline {
    constructor() {
        super()
    }
    init() {
        GlTools.applyHdrExtension()
        this.prg = this.basicVert(fs)
        this._vBlur = new BatchBigTriangle(blurFs)
        this._vFinal = new BatchBigTriangle(finalFs)
    }
    attrib() {
        this.statue = Geom.cube(1)
        this.quad = Geom.bigTriangle()
    }
    prepare() {
        GlTools.srcBlend()

        this.orbital.radius = 3.5
        this.fbo = new FrameBuffer(canvas.width, canvas.height, { hdr: true }, 2)
        this.textures = this.fbo.textures

        this.pingpongFbo = new FboPingPong(128, 128, { hdr: true })

    }
    _setGUI() {
        this.addGUIParams({
            texOffsetScale: .1,
            blurPassCount: 5,
            lightScale: 1,
            uAlpha: .5
        })
        this.gui.add(this.params, 'texOffsetScale', 0, 5).step(.01)
        this.gui.add(this.params, 'blurPassCount', 1, 20).step(1)
        this.gui.add(this.params, 'lightScale', .1, 10).step(.1)
        this.gui.add(this.params, 'uAlpha', 0, 1.0).step(.1)
    }
    uniform() {

    }

    _renderScene() {
        const mMatrix = mat4.create()
        mat4.rotateY(mMatrix, mMatrix, .3)
        let a = [10, 20, 10]
        let b = a.map(x => x * this.params.lightScale)
        this.prg.use()
        this.prg.style({
            mMatrix,
            'lights[0].Position': [1.5, 0, 0],
            'lights[0].Color': b,
            'lights[1].Position': [-1.5, 0, 0],
            'lights[1].Color': b,
            'lights[2].Position': [0, 1.5, -2],
            'lights[2].Color': b,
            'lights[3].Position': [0, 0, 2.],
            'lights[3].Color': [10, 20, 10],
            'lights[4].Position': [0, -1.5, 0.],
            'lights[4].Color': [10, 20, 10],
            baseColor: [0., 0.3, 0.3],
            uAlpha: this.params.uAlpha
        })
        this.statue.rotationY = 12
        GlTools.draw(this.statue)
    }

    render() {

        this.fbo.bind()
        GlTools.clear(0, 0, 0)
        gl.cullFace(gl.FRONT)
        this._renderScene()
        gl.cullFace(gl.BACK)
        this._renderScene()

        this.fbo.unbind()


        let horizontal = true

        for (let i = 0; i < this.params.blurPassCount; i++) {
            this.pingpongFbo.write.bind()
            this._vBlur.draw({
                image: i == 0 ? this.textures[1] : this.pingpongFbo.read.textures[0],
                horizontal,
                texOffsetScale: this.params.texOffsetScale
            })

            horizontal = !horizontal;
            this.pingpongFbo.write.unbind()

            this.pingpongFbo.swap()
        }
        

        GlTools.clear(0, 0, 0)

        this._vFinal.draw({
            scene: this.textures[0],
            bloomBlur: this.pingpongFbo.read.textures[0],
            bloom: true,
            exposure: .1
        })


    }
}


