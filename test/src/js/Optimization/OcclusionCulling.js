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
        this.prg = this.basicVert(fs, { pointSize: 1., varyings: {float: 'index'} })
    }
    attrib() {

        this.mesh = Geom.bezier([
            [-130,  90, 0],
            [ -55, -90, 0],
            [  75, -60, 0],
            [ 100,  80, 0]
        ], .005)
        const index = []
        this.mesh.vertices.map((v, i) => {
            index.push(i)
        })
        this.mesh.bufferFlattenData(index, 'index', 1)

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
        const frames = 100
        const verticesPerFrame = pos.length / frames // toal 200frame

        const curIndex = []
        const lastPos = []
        const frameIndex = this._frame % frames
        const startVertIndex = verticesPerFrame * frameIndex
        const endVertIndex = (frameIndex+1) * verticesPerFrame

        for(let j = startVertIndex; j < endVertIndex; j++){
            curIndex.push(j)

        }
        console.log(curIndex)
        this.prg.use()
        this.prg.uniform('flowIndex', 'float', curIndex)

        this._frame++
    }

    render() {
        GlTools.clear()

        const mMatrix = mat4.create()
        this.prg.use()
        this.prg.style({
            mMatrix,
            color: [.5, .5 , 0.1],
            flowColor: [1., 1. ,0.1]
        })

        GlTools.draw(this.mesh)

    }
}
