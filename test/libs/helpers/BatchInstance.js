// BatchSky.js

import { gl } from '../GlTools';
import GLShader from '../GLShader';
import Batch from './Batch';
import ModifyShader from '../shaders/ModifyShader'



class BatchInstance extends Batch {

	constructor(vs, fs, mesh, instanceMatrix, settings) {
        vs = ModifyShader.addInstanceMatrix(vs)
		const shader = new GLShader(vs, fs, settings);
        mesh.bufferInstance(instanceMatrix, 'instanceMatrix', gl.DYNAMIC_DRAW)

		super(mesh, shader);
	}

    set instanceMatrix(matrix) {
        this.mesh.bufferSubData('instanceMatrix', matrix)
    }
    
	draw(style) {
		super.draw(style);
	}
}

export default BatchInstance;