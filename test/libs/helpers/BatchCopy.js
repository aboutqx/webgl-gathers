import { bigTriangleVert, copyFrag } from 'CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import Batch from './Batch'
// batch create skybox
export default class BatchCopy extends Batch {

    constructor() {
        const shader = new Program(bigTriangleVert, copyFrag)
        const mesh = Geom.bigTriangle()

        super(mesh, shader)

    }

    draw(texture) {
        super.draw({ texture0: texture})
    }
}
