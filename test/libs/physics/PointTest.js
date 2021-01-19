import { Ray, AABB, Point, Plane, Frustum, Sphere } from './Geometry3D'
import { vec3, vec4, mat4 } from 'gl-matrix'

export default class PointTest {
    point

    static pointSphere(point, sphere){
        const radius = sphere.radius
        const dist = vec3.dist(point, sphere.origin)
        return dist < radius
    }
    static closestPointSphere(point, sphere){
        let dir = vec3.create()
        vec3.subtract(dir, point, sphere.origin)
        vec3.normalize(dir, dir)
        let originToPoint = vec3.create()
        vec3.multiply(originToPoint, dir, sphere.radius)
        let out = vec3.create()
        return vec3.add(out, originToPoint, sphere.origin)
    }

    //aabb以min和max定义了一个垂直axis的盒子
    static pointAABB(point, aabb){
        if(point.x < aabb.min.x || point.y < aabb.min.y || point.z < aabb.min.z){
            return false
        }
        if(point.x > aabb.max.x || point.y > aabb.max.y || point.z > aabb.max.z){
            return false
        }
        return true
    }

    //clamp using min and max component wise
    static closestPointAABB(point, aabb){
        const min = aabb.min
        const max = aabb.max
        let result = aabb
        result.x = (result.x<min.x) ? min.x : result.x;
        result.y = (result.y<min.x) ? min.y : result.y;
        result.z = (result.z<min.x) ? min.z : result.z;
        result.x = (result.x>max.x) ? max.x : result.x;
        result.y = (result.y>max.x) ? max.y : result.y;
        result.z = (result.z>max.x) ? max.z : result.z;
        return result
    }

    static pointOBB(){

    }
    static closestPointOBB(){
        
    }

    static pointPlane(point, plane){
        const dot = vec3.dot(point, plane.normal)
        return dot - plane.distance == 0
    }

    static closestPointPlane(){
        const dot = vec3.dot(point, plane.normal)
        const dist = dot - plane.distance
        let result = vec3.create()
        vec3.multiply(result, dist, normal)
        return vec3.subtract(result, point, result)
    }

    static pointLine(){

    }
    static closestPointLine(){
        
    }

    static pointRay(){

    }
    static closestPointRay(){
        
    }
}