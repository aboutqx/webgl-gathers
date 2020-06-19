import greyscaleFs from '../glsl/post/greyscale.frag'
import BatchBigtriangle from '../helpers/BatchBigTriangle'
import { canvas } from '../GlTools'

export default class PassGreyScale {
    constructor() {
        this._bGreyscale= new BatchBigtriangle(greyscaleFs)
    }

    apply(texture) {
        this._bGreyscale.draw({
            texture0: texture
        })
    }
}