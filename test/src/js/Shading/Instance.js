import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import BatchInstance from 'helpers/BatchInstance'
import fs from 'shaders/instance/instance.frag'
import FrameInterval from 'utils/FrameInterval'
import {
    mat4,
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'
import { basicVert } from 'libs/shaders/CustomShaders'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class Instance extends Pipeline {
    constructor() {
        super()

    }
    init() {

    }
    attrib() {

        const line = Geom.singleLine([0, 0, 0], [1, 1, 1])
        const bezier = Geom.bezier([
            [-130,  90, 0],
            [ -55, -90, 0],
            [  75, -60, 0],
            [ 100,  80, 0]
        ], .01)

        this.lineInstance = new BatchInstance(basicVert, fs, { pointSize: 3 }, line, this._caculateMatrix())
        this.bezierInstance = new BatchInstance(basicVert, fs, { pointSize: 3 }, bezier, this._caculateMatrix())
    }

    _caculateMatrix() {
        const num = 1000
        const instanceMatrix = []
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
    }

    _setGUI() {
        this.addRadio('bezier', ['singleLine', 'bezier'], 'mesh type')
    }

    uniform() {


        this.style = {
            objectColor: [0.1, 0.1, .8]
        }
    }
    render() {
        GlTools.clear(0, 0, 0)
        
        if(this.params.singleLine) {
            this.instance = this.lineInstance
        } else {
            this.instance = this.bezierInstance
        }
        
        FrameInterval(100, () => {
            const matrix = this._caculateMatrix()
            // this.instance.instanceMatrix = matrix
        })

        this.instance.draw(this.style)
    }
}
