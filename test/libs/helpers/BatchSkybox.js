import CustomShaders from 'libs/shaders/CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import {
    mat4
} from 'gl-matrix'
import { GlTools } from 'libs/GlTools'
// batch create skybox
export default class batchSkybox {
    constructor(size, skymap) {
        this.skyboxPrg = new Program(CustomShaders.skyboxVert, CustomShaders.skyboxFrag)
        this.skybox = Geom.skybox(size)
        this.skyMap = skymap
    }

    render() {
        let  mMatrix = mat4.identity(mat4.create())
        this.skyboxPrg.use()
        this.skyboxPrg.style({
            mMatrix,
            uGamma: 2.2,
            uExposure: 5.,
            tex: this.skyMap
          })
        GlTools.draw(this.skybox)
    }
}