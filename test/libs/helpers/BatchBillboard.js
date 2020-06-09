import Batch from './Batch'
import Geom from '../Geom'
import { mat4 } from 'gl-matrix'

//rotate the billboard image with camera, so that the image perpendicular to view direction
export default class BatchBillboard extends Batch {
    constructor(size = 10) {
      const mesh = Geom.plane(size, size)
    }

    _rotate() {

    }

    draw() {
        this.shader.bind()
        const mMatrix = mat4.create()
        this.shader.style({
            mMatrix
        })
        super.draw()
    }
}