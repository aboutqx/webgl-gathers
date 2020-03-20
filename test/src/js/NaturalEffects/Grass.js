import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/grass/grass.vert'
import fs from 'shaders/grass/grass.frag'

import {
    mat4,
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'
import GLTexture from '../../../libs/GLTexture'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class Grass extends Pipeline {
    count = 0
    constructor() {
        super()

    }
    init() {
        this.prg = this.compile(vs, fs)
        GlTools.srcBlend()
    }
    attrib() {

        this.grass = Geom.plane(4, 4, 12)
        this.ground = Geom.plane(100, 100, 10, 'xz')
        this.grass.bufferInstance(this._caculateMatrix(), 'instanceMatrix', gl.DYNAMIC_DRAW)
    }

    _caculateMatrix() {
        const num = 10
        let instanceMatrix = []
        let x, y, z
        for (let i = 0; i < num; i++) {
            const scale = random(.1, 10)

            let mMatrix = mat4.create()
            let displacement = (Math.random() * 2 - 1) * 50
            x = displacement
            displacement = (Math.random() * 2 - 1) * 50
            y = displacement
            displacement = (Math.random() * 2 - 1) * 50
            z = displacement
            mat4.translate(mMatrix, mMatrix, [x, y, z])
            mat4.scale(mMatrix, mMatrix, [scale, scale, scale])
            instanceMatrix.push(mMatrix)
        }
        return instanceMatrix
    }

    prepare() {

        this.orbital.radius = 60
        //this.orbital.offset = [60, 60, 0]
        this.curTime = 0
        this.lastTime = 0
        gl.disable(gl.CULL_FACE)
    }
    uniform() {


        this.prg.use()
        this.prg.style({
            texture0: getAssets.grass
        })
    }
    render() {
        GlTools.clear()

        this.curTime = performance.now()
        const interval = 100
        if (this.curTime - this.lastTime > interval) {
            const matrix = this._caculateMatrix()
            //this.grass.bufferSubData('instanceMatrix', matrix)
            this.lastTime = performance.now()
        }


        GlTools.draw(this.grass)


        this.prg.style({
            texture0: getAssets.ground
        })
        GlTools.draw(this.ground)

    }
}
