import { bigTriangleVert } from 'CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import Batch from './Batch'
// batch create bigTriangle
export default class BatchBigTriangle extends Batch {

    constructor(fs) {
        const shader = new Program(bigTriangleVert, fs)
        const mesh = Geom.bigTriangle()

        super(mesh, shader)

    }

    draw(uniformObject) {
        this.shader.use()
        this.shader.style(uniformObject)
        super.draw()
    }
}
