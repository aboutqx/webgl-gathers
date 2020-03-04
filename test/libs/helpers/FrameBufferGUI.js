import Geom from '../Geom'
import { mat4 } from 'gl-matrix'
import Program from 'libs/GLShader'
import {
    gl,
    GlTools
  } from 'libs/GlTools'
import basec2dVert from '../glsl/basic2d.vert'

export default class FrameBufferGUI {
    _position = [0, 0]
    _tanslate = [[.85 , -.85, 0], [.55 , -.85, 0]]
    _size = [.3, .3]
    _texturelist = []

    constructor () {
        this.texturePrg = new Program(basec2dVert)
        this.quad = Geom.plane(1, 1, 1) // size(.5, .5)
    }

    set textureList (value){
        // { texture, position, size }
        this._texturelist = value
    }

    draw (){
        if(this._texturelist.length == 0) return

        gl.disable(gl.DEPTH_TEST)
        this._texturelist.forEach((v, i) => {
            this.texturePrg.use()

            v.size = v.size || this._size
            v.position = v.position || this._position
            let mMatrix = mat4.identity(mat4.create())
            mat4.translate(mMatrix, mMatrix, this._translate[i])
            mat4.scale(mMatrix, mMatrix, [v.size[0], v.size[1], 1])

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, v.texture)
            this.texturePrg.uniform('texture0', 'uniform1i', 0)
            this.texturePrg.style({
                mMatrix,
                //texture0: v.texture
            })
            GlTools.draw(this.quad)
        })
        gl.enable(gl.DEPTH_TEST)

    }

}