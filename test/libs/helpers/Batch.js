import { GlTools } from 'libs/GlTools'
// batch create skybox
export default class  Batch{
    
    constructor(mesh, shader) {
        this._mesh = mesh
        this._shader = shader
    }

    draw() {
        this._shader.bind()
        GlTools.draw(this._mesh)
    }

    
	//	GETTER AND SETTER

	get mesh() {	return this._mesh;	}

    get shader() {	return this._shader;	}
    
}