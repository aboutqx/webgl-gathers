import Pipeline from '../PipeLine'
import vs from 'shaders/reflection.vert'
import fs from 'shaders/reflection.frag'
import {
    mat4
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'

export default class Reflection extends Pipeline {
    constructor() {
        super()

    }
    init() {
        this.prg = this.compile(vs, fs)
    }
    attrib() {
        this.statue = getAssets.statue

    }
    prepare() {
        this.orbital.radius = 3.5
        this.orbital.target = [0, 0, 0]
    }
    _setGUI() {
        this.addGUIParams({
            color: [110, 122, 110],
            useAo: true
        })

        this.gui.addColor(this.params, 'color')
        this.gui.add(this.params, 'useAo')
    }
    uniform() {

        const mMatrix = mat4.create()
        // mat4.translate(mMatrix, mMatrix, [-2, 0, 0])

        const invMatrix = mat4.create()
        mat4.invert(invMatrix, mMatrix)

        this.prg.use()
        this.prg.style({
            mMatrix,
            invMatrix,
            diffuseColor: [this.params.color[0] / 255, this.params.color[1] / 255, this.params.color[2] / 255],
            lightDirection: [-0.5, 0.5, 0.5],
            ambientColor: [0.1, 0.1, 0.1],
            aoMap: getAssets.statueAo,
            useAo: this.params.useAo
        })
    }
    render() {

        GlTools.clear()

        this.prg.use()

        GlTools.draw(this.statue)


    }
}

