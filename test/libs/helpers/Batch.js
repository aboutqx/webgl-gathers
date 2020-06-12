import { GlTools } from 'libs/GlTools'
// batch create skybox
export default class Batch {

    constructor(mesh, shader) {
        this._mesh = mesh
        this._shader = shader
    }

    draw(style) {
        this._shader.bind()
        this._shader.style(style)
        GlTools.draw(this._mesh)
    }


    //	GETTER AND SETTER

    get mesh() { return this._mesh; }

    get shader() { return this._shader; }

}
