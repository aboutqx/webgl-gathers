import Batch from './Batch'
import Geom from '../Geom'
import { mat4 } from 'gl-matrix'

//rotate the billboard image with camera, so that the image perpendicular to view direction
export default class BatchBillboard extends Batch {
    constructor(size = 10) {
      const mesh = Geom.plane(size, size)
    }

    _rotate(mMatrix) {
        let theta
        // const meshPos = 
        return theta
    }

    draw(texture) {
        const mMatrix = mat4.create()
        const theta = this._rotate()
        mat4.rotate(mMatrix, mMatrix, theta, [0,1,0])

        super.draw({
            mMatrix,
            texture0: texture
        })
    }
}