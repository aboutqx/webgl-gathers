import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/noise/noise.vert'
import {
    mat4,
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
        this.prg = this.basicColor(vs)
    }
    attrib() {

        this.plane = Geom.plane(8, 8, 125, 'xz', gl.LINES)
        this.points = Geom.points([0,0,0], [1,1,1], [2,2,2], [-1,-1,-1])
    }

    prepare() {

        this.orbital.radius = 5
        this.orbital.offset = [ 0, 2, 3]
    }

    _setGUI() {
        this.addRadio('plane', ['point', 'plane'], 'mesh type')
    }

    uniform() {
        
    }
    render() {
        GlTools.clear()
        if(this.params.point) {
            this.mesh = this.points
        } else {
            this.mesh = this.plane
        }
        const mMatrix = mat4.create()
        this.prg.use()
        this.prg.style({
            mMatrix,
            color: [0. , .5 ,0.6],
            terrainHeight: .6
        })

        GlTools.draw(this.mesh)

    }
}
