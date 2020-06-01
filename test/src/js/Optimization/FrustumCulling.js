import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'

import {
    mat4, mat3
} from 'gl-matrix'
import {
    gl,
    GlTools
} from 'libs/GlTools'
import Mesh from 'libs/Mesh'
import { Sphere, Frustum } from 'physics/Geometry3D'
import Intersect from 'physics/Intersect'

const random = function (min, max) { return min + Math.random() * (max - min); }

export default class FrustumCulling extends Pipeline {
    constructor() {
        super()

    }
    init() {
        this.prg = this.basicColor()
        this.orbital.radius = 1000
    }
    attrib() {

        this.mesh = Geom.sphere(1.5, 30)
        this._caculateMatrix()
    }

    _caculateMatrix() {
        const num = 10
        const instanceMatrix = []
        const inFrustum = []
        let x, y, z
        for (let i = 0; i < num; i++) {
            const scale = random(.1, 10)

            const mMatrix = mat4.create()
            let displacement = (Math.random() * 2 - 1) * 50
            x = displacement
            displacement = (Math.random() * 2 - 1) * 50
            y = displacement
            displacement = (Math.random() * 2 - 1) * 50
            z = displacement
            mat4.translate(mMatrix, mMatrix, [x, y, z])
            mat4.scale(mMatrix, mMatrix, [scale, scale, scale])
            instanceMatrix.push(mMatrix)

        }
        this.instanceMatrix = {
            instanceMatrix,
            inFrustum
        }
        this.num = num
    }

    _inFrustum() {
        this.orbital.updateMatrix()
        const frustum = new Frustum().fromMatrix(this.camera.viewMatrix, this.camera.projectionMatrix)
        this.count = 0
        this.instanceMatrix.instanceMatrix.forEach((v,i) => {
            const e = Intersect.frustumSphere(frustum, Sphere.fromVertices(this.mesh.vertices, v))
            this.instanceMatrix.inFrustum[i] = e

            if(e) this.count++
        })
        console.log(`actual num: ${this.num}, draw num: ${this.count}`)
    }

    prepare() {

        
        //this.orbital.offset = [60, 60, 0]
        
    }
    uniform() {


        this.prg.use()
        this.prg.style({
            color: [0.1, 0.1, .8]
        })
    }
    render() {
        GlTools.clear(0, 0, 0)
        
        this._inFrustum()
        this.instanceMatrix.instanceMatrix.forEach((v,i) => {
            if(!this.instanceMatrix.inFrustum[i]) return
            this.prg.style({
                mMatrix: v
            })
            GlTools.draw(this.mesh)

        })

    }
}
