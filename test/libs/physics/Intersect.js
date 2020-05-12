import { Ray, AABB, Point, Frustum, Sphere } from './Geometry3D'
import {
    canvas
} from 'libs/GlTools'
import { vec3, vec4, mat4 } from 'gl-matrix'

export default class Intersect {
    ray
    aabb
    constructor() {

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
            this.aabb = AABB.fromVertices(vertices)
            result = this.rayAABB(this.aabb, this.ray)
        }
        return result
    }


    static rayAABB(aabb, ray) {
        let min = aabb.getMin()
        let max = aabb.getMax()

        let t1 = (min[0] - ray.origin[0]) / (ray.direction[0] == 0 ? 0.00001 : ray.direction[0])
        let t2 = (max[0] - ray.origin[0]) / (ray.direction[0] == 0 ? 0.00001 : ray.direction[0])
        let t3 = (min[1] - ray.origin[1]) / (ray.direction[1] == 0 ? 0.00001 : ray.direction[1])
        let t4 = (max[1] - ray.origin[1]) / (ray.direction[1] == 0 ? 0.00001 : ray.direction[1])
        let t5 = (min[2] - ray.origin[2]) / (ray.direction[2] == 0 ? 0.00001 : ray.direction[2])
        let t6 = (max[2] - ray.origin[2]) / (ray.direction[2] == 0 ? 0.00001 : ray.direction[2])

        let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6))
        let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6))

        // if tmax < 0, ray is intersecting AABB
        // but entire AABB is behing it's origin
        if (tmax < 0) {
            return false
        }

        // if tmin > tmax, ray doesn't intersect AABB
        if (tmin > tmax) {
            return false
        }

        let rayT = tmin

        // If tmin is < 0, tmax is closer
        if (tmin < 0.0) {
            rayT = tmax
        }
        return true
    }

    static rayOBB(obb, ray) {

    }

    static raySphere() {

    }

    static frustumPoint(frustum, point) {
        //plane normal 朝里的，为此negate point
        let pointNegate = vec3.create()
        vec3.negate(pointNegate, point)
        for(let i = 0; i < 6; i++) {
            let side = frustum.planes[i].planeEquation(pointNegate)
            if(side > 0.) {
                return false
            }
        }
        return true
    }

    static frustumSphere(frustum, sphere) {
        let pointNegate = vec3.create()
        vec3.negate(pointNegate, sphere.origin)
        for(let i = 0; i < 6; i++) {
            let side = frustum.planes[i].planeEquation(pointNegate)
            if(side - sphere.radius > 0.) {
                return false
            }
        }
        return true
    }

    static frustumAABB(frustum, aabb) {

    }

    static frustumOBB(frustum, obb) {
        for(let i = 0; i < 6; i++) {
            if(side - sphere.radius > 0.) {
                return false
            }
        }
        return true
    }

    static boxPlane(box, plane) {
        if(box instanceof OBB) {

        }

    }
}
