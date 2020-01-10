import { vec3, vec4, mat4 } from 'gl-matrix'
export class Ray{
    origin = vec3.create()
    direction = vec3.create()
    constructor(origin, direction){
        this.origin = vec3.fromValues(...origin)
        vec3.normalize(this.direction, vec3.fromValues(...direction))

    }

}
export class AABB{
    origin = vec3.create()
    size = vec3.create()//half size
    constructor(origin, size){
        this.origin = origin
        this.size = size
    }
    fromMinMax(min, max){
        return new AABB([(min[0]+max[0])*.5,(min[1]+max[1])*.5,(min[2]+max[2])*.5],
        [(max[0]-min[0])*.5,(max[1]-min[1])*.5,(max[2]-min[2])*.5]
        )
    }
    getMin(){
        let p1, p2 
        p1 =vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.min(t, p1, p2 )
        return t
    }

    getMax(){
        let p1, p2
        p1 = vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.max(t, p1 ,p2)
        return t
    }

    get position(){
        let position = []
        let origin = this.origin
        let size =this.size
        position.push(origin[0]-size[0],origin[1]+size[1], origin[2]+size[2])
        position.push(origin[0]-size[0],origin[1]-size[1], origin[2]+size[2])
        position.push(origin[0]+size[0],origin[1]+size[1], origin[2]+size[2])
        position.push(origin[0]+size[0],origin[1]-size[1], origin[2]+size[2])
        position.push(origin[0]+size[0],origin[1]+size[1], origin[2]-size[2])
        position.push(origin[0]+size[0],origin[1]-size[1], origin[2]-size[2])
        position.push(origin[0]-size[0],origin[1]+size[1], origin[2]-size[2])
        position.push(origin[0]-size[0],origin[1]-size[1], origin[2]-size[2])
        return position
        
    }
    get index(){
        // 6 face
        return [
            0, 1, 2, 1,3,2,
            6,4,7, 7,4,5,
            1, 0,6, 1,6,7,
            3,4,2, 3,5, 4,
            0,6,4, 0,2,4,
            1,7,5,1,5,3
        ]
    }
    get texCoord(){
        return [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, // 
        1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, // front face
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  0.0, 1.0, // left face 
        1.0, 0.0, 0.0, 1.0, 1.0, 1.0,  0.0, 1.0, // right face
        0.0, 1.0, 1.0, 1.0,1.0, 0.0, 1.0, 0.0, // bottom face
        0.0, 1.0,1.0, 0.0,  1.0, 1.0,  1.0, 0.0 ] // top face 
    }
}
export class RayCast{
    rayAABB(aabb, ray){
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

    raySphere(){

    }

}  