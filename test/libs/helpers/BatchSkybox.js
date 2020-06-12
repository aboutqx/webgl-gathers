import { skyboxVert, skyboxFrag } from 'CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import Batch from './Batch'
// batch create skybox
export default class BatchSkybox extends Batch{

    constructor(size, skymap) {
        const shader = new Program(skyboxVert, skyboxFrag)
        const mesh = Geom.skybox(size)

        super(mesh, shader)
        this.skyMap = skymap
    }

    draw(skyMap) {
        if(skyMap) this.skyMap = skyMap
        super.draw({
            uGamma: 2.2,
            uExposure: 5.,
            tex: this.skyMap
        })
    }
}
