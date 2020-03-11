import { skyboxVert, skyboxFrag } from 'libs/shaders/CustomShaders'
import Program from 'libs/GLShader'
import Geom from 'libs/Geom'
import {
    mat4
} from 'gl-matrix'
import Batch from './Batch'
// batch create skybox
export default class BatchSkybox extends Batch{
    
    constructor(size, skymap) {
        const shader = new Program(skyboxVert, skyboxFrag)
        const mesh = Geom.skybox(size)
        
        super(mesh, shader)
        this.skyMap = skymap
    }

    draw() {
        let  mMatrix = mat4.create()
        this.shader.use()
        this.shader.style({
            mMatrix,
            uGamma: 2.2,
            uExposure: 5.,
            tex: this.skyMap
          })
        super.draw()
    }
}