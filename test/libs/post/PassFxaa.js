import fxaaFs from '../glsl/post/fxaa.frag'
import BatchBigtriangle from '../helpers/BatchBigTriangle'
import { canvas } from '../GlTools'

export default class PassFxaa {
    constructor() {
        this._bFxaa= new BatchBigtriangle(fxaaFs)
    }

    apply(texture, uResolution = [1/canvas.width, 1/canvas.height]) {
        this._bFxaa.draw({
            texture0: texture,
            uResolution
        })
    }
}