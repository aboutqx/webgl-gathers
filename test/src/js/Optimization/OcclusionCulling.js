import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import fs from 'shaders/flowLight.frag'
import {
    mat4, vec3
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class Noise extends Pipeline {
    constructor() {
        super()

    }
    init() {
        this.prg = this.basicVert(fs, { pointSize: 2. })
    }
    attrib() {

        this.mesh = Geom.bezier([
            [-130,  90, 0],
            [ -55, -90, 0],
            [  75, -60, 0],
            [ 100,  80, 0]
        ], .001)
    }

    prepare() {

        this.orbital.radius = 270
        this._frame = 0
    }
    uniform() {
        this._nextFrame()
    }

    _nextFrame() {
        const pos = this.mesh.vertices
        const verticesPerFrame = pos.length / 100  // toal 100frame
        const curPos = []
        const lastPos = []
        const frameIndex = this._frame % 100
        const startVertIndex = verticesPerFrame * frameIndex + 1
        const endVertIndex = (frameIndex+1) * verticesPerFrame

        const lastStartIndex = frameIndex == 0 ? 0 :verticesPerFrame * (frameIndex-1)  + 1
        const lastEndIndex = frameIndex == 0 ? verticesPerFrame :(frameIndex+1 - 1) * verticesPerFrame
        for(let i = 0; i < 3; i++) {
            curPos[i] = 0
            lastPos[i] = 0
            for(let j = startVertIndex; j < endVertIndex; j++){
                curPos[i] += pos[j][i]
            }

            for(let k = lastStartIndex; k <= lastEndIndex; k++){
                lastPos[i] += pos[k][i]
            }

            curPos[i] /= verticesPerFrame
            lastPos[i] /= verticesPerFrame
        }

        
        this.prg.use()
        this.prg.style({
            flowPos: curPos,
            flowDirection: vec3.sub([], curPos, lastPos),
            flowLength: .2
        })
        this._frame++
    }

    render() {
        GlTools.clear()

        const mMatrix = mat4.create()
        this.prg.use()
        this.prg.style({
            mMatrix,
            color: [0., .5 , 0.6],
            flowColor: [1., 1. ,0]
        })

        GlTools.draw(this.mesh)

    }
}
