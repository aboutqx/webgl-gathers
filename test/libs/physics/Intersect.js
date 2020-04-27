import { Ray, AABB, RayCast } from './Geometry3D'
import {
    canvas
} from 'libs/GlTools'
import { vec3, vec4, mat4 } from 'gl-matrix'

export default class Intersect {
    ray
    aabb
    constructor() {
        this.rayCast = new RayCast()
    }
    setRay(mouseX, mouseY, pMatrix, vMatrix, cameraPos) {
        mouseX = mouseX - canvas.getBoundingClientRect().left
        mouseY = mouseY - canvas.getBoundingClientRect().top

        let x = (2.0 * mouseX) / canvas.clientWidth - 1.0;
        let y = 1.0 - (2.0 * mouseY) / canvas.clientHeight;
        let z = 1.0;
        let rayNds = vec3.fromValues(x, y, z)
        let rayClip = vec4.fromValues(x, y, -1., 1.)
        let rayEye = vec4.create()
        mat4.invert(pMatrix, pMatrix)
        mat4.multiply(rayEye, pMatrix, rayClip)
        rayEye = vec4.fromValues(rayEye[0], rayEye[1], -1., 0.)
        let _rayWorld = vec4.create()
        mat4.invert(vMatrix, vMatrix)
        mat4.multiply(_rayWorld, vMatrix, rayEye)
        let rayWorld = vec3.fromValues(_rayWorld[0], _rayWorld[1], _rayWorld[2])
        this.ray = new Ray(cameraPos, vec3.normalize(rayWorld, rayWorld))
    }


    castRay(vertices, type = 'AABB') {
        let result = false
        if (type == 'AABB') {
            this.boundingVolume(vertices)
            result = this.rayCast.rayAABB(this.aabb, this.ray)
        }
        return result
    }


    boundingVolume(vertices, type = 'AABB') {

        let box = AABB.fromVertices(vertices)
        const min = box.getMin()
        const max = box.getMax()
        const sphereCenter = [min[0] + (max[0] - min[0]) / 2, min[1] + (max[1] - min[1]) / 2, min[2] + (max[2] - min[2]) / 2]
        const sphereRadius = Math.max((max[0] - min[0]) / 2, (max[1] - min[1]) / 2, (max[2] - min[2]) / 2)


        if (type == 'sphere') {

        } else if (type == 'AABB') {
            
            this.aabb = box
            return {
                position: box.position,
                index: box.index,
                texCoord: box.texCoord
            }
        }
    }


}
