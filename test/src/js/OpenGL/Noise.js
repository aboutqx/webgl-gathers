import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/noise/noise.vert'
import { basicColorFrag } from 'libs/shaders/CustomShaders'
import {
    mat4,
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class Noise extends Pipeline {
    count = 0
    constructor() {
        super()

    }
    init() {
        this.prg = this.compile(vs, basicColorFrag)
    }
    attrib() {

        this.plane = Geom.plane(8, 8, 12, 'xz', gl.LINES)

    }

    prepare() {

        this.orbital.radius = 10

        gl.disable(gl.CULL_FACE)
    }
    uniform() {
        
    }
    render() {
        GlTools.clear()

        let mMatrix = mat4.create()
        this.prg.use()
        this.prg.style({
            mMatrix,
            color: [0. , .5 ,0.6],
            terrainHeight: 0.3
        })
        GlTools.draw(this.plane)

    }
}
