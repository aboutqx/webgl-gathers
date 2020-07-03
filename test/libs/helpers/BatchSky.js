// BatchSky.js

import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from './Batch';

import vs from '../glsl/sky/sky.vert'
import fs from '../glsl/sky/sky.frag'


class BatchSky extends Batch {

	constructor(size = 50, mFs = fs, seg = 24) {
		const mesh = Geom.sphere(size, seg, true);
		const shader = new GLShader(vs, mFs);

		super(mesh, shader);
	}

	draw(style) {
		this.shader.bind();
		this.shader.style(style)
		super.draw();
	}
}

export default BatchSky;