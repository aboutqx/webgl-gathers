import Geom from '../Geom'
import { mat4 } from 'gl-matrix'
import Program from 'libs/GLShader'
import {
    gl,
    GlTools
} from 'libs/GlTools'
import basic2dVert from '../glsl/basic2d.vert'
import GLTexture from 'libs/GLTexture'

export default class FrameBufferGUI {
    _position = [0, 0]
    _translate = [[.85, .85, 0], [.55, .85, 0]]
    _size = [.3, .3]
    _texturelist = []

    constructor() {
        this.texturePrg = new Program(basic2dVert)
        this.quad = Geom.plane(1, 1, 1) // size(.5, .5)
    }

    set textureList(value) {
        // { texture, position, size }
        this._texturelist = value
    }

    draw() {
        if (this._texturelist.length == 0) return

        gl.disable(gl.DEPTH_TEST)
        this._texturelist.forEach((v, i) => {
            this.texturePrg.use()

            v.size = v.size || this._size
            v.position = v.position || this._position
            let mMatrix = mat4.create()
            mat4.translate(mMatrix, mMatrix, this._translate[i])
            mat4.scale(mMatrix, mMatrix, [v.size[0], v.size[1] * GlTools.aspectRatio, 1])

            const flipY = v.flipY || false
            if (!(v.texture instanceof GLTexture)) {
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, v.texture)
                this.texturePrg.uniform('texture0', 'uniform1i', 0)
            } else this.texturePrg.style({
                texture0: v.texture
            })

            this.texturePrg.style({
                mMatrix,
                flipY
            })
            GlTools.draw(this.quad)
        })
        gl.enable(gl.DEPTH_TEST)

    }

}
