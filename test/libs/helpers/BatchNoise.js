import { bigTriangleVert } from 'CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import Batch from './Batch'
import fs from 'shaders/noise.frag';
import EaseNumber from 'utils/EaseNumber'
// batch create noise
export default class BatchNoise extends Batch {

    constructor() {
        const shader = new Program(bigTriangleVert, fs)
        const mesh = Geom.bigTriangle()

        super(mesh, shader)

        this.time = Math.random() * 0xFF;
		this.seed = Math.random() * 0xFF;
        this.test = new EaseNumber(0);
        
    }

    draw(texture) {
        const { speed, noiseScale, isOne } = params;
		this.time += speed;

		this.test.value = isOne ? 1 : 0;
		this.shader.bind();
		this.shader.uniform("mTime", "float", this.time);
		// this.shader.uniform("uTime", "float", this.test.value);
		this.shader.uniform("uSeed", "float", this.seed);
		this.shader.uniform("uNoiseScale", "float", noiseScale);
        super.draw()
    }
}
