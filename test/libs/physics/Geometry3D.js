import { vec3, vec4, mat4, mat3 } from 'gl-matrix'
import Mesh from 'libs/Mesh'
import { gl } from 'libs/GlTools'

export class Point {
    constructor(x, y ,z) {
        return new vec3(x, y, z)
    }
}

export class Ray {
    origin = vec3.create()
    direction = vec3.create()
    constructor(origin, direction) {
        this.origin = vec3.fromValues(...origin)
        vec3.normalize(this.direction, vec3.fromValues(...direction))

    }

}
export class AABB {
    origin
    size //half size
    constructor(origin, size) {
        this.origin = origin || vec3.create()
        this.size = size || vec3.create()
    }

    static fromVertices(vertices) {
        let min = vec3.create()
        let max = vec3.create()
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i][0] > max[0] || !max[0]) max[0] = vertices[i][0]
            if (vertices[i][0] < min[0] || !min[0]) min[0] = vertices[i][0]
            if (vertices[i][1] > max[1] || !max[1]) max[1] = vertices[i][1]
            if (vertices[i][1] < min[1] || !min[1]) min[1] = vertices[i][1]
            if (vertices[i][2] > max[2] || !max[2]) max[2] = vertices[i][2]
            if (vertices[i][2] < min[2] || !min[2]) min[2] = vertices[i][2]
        }
        return this.fromMinMax(min, max)
    }

    static fromMinMax(min, max) {
        return new AABB([(min[0] + max[0]) * .5, (min[1] + max[1]) * .5, (min[2] + max[2]) * .5],
            [(max[0] - min[0]) * .5, (max[1] - min[1]) * .5, (max[2] - min[2]) * .5]
        )
    }

    getMin() {
        let p1, p2
        p1 = vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.min(t, p1, p2)
        return t
    }

    getMax() {
        let p1, p2
        p1 = vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.max(t, p1, p2)
        return t
    }

    getFrame() {
        const wireFrame = new Mesh(gl.LINE_STRIP, 'aabb-wireframe')
        wireFrame.bufferFlattenData(this.position, 'position', 3)
        wireFrame.bufferFlattenData(this.texCoord, 'texCoord', 2)
        wireFrame.bufferIndex(this.index)
        return wireFrame
    }

    get position() {
        let position = []
        let origin = this.origin
        let size = this.size
        position.push(origin[0] - size[0], origin[1] + size[1], origin[2] + size[2])
        position.push(origin[0] - size[0], origin[1] - size[1], origin[2] + size[2])
        position.push(origin[0] + size[0], origin[1] + size[1], origin[2] + size[2])
        position.push(origin[0] + size[0], origin[1] - size[1], origin[2] + size[2])
        position.push(origin[0] + size[0], origin[1] + size[1], origin[2] - size[2])
        position.push(origin[0] + size[0], origin[1] - size[1], origin[2] - size[2])
        position.push(origin[0] - size[0], origin[1] + size[1], origin[2] - size[2])
        position.push(origin[0] - size[0], origin[1] - size[1], origin[2] - size[2])
        return position

    }
    get index() {
        // 6 face
        return [
            0, 1, 2, 1, 3, 2,
            6, 4, 7, 7, 4, 5,
            1, 0, 6, 1, 6, 7,
            3, 4, 2, 3, 5, 4,
            0, 6, 4, 0, 2, 4,
            1, 7, 5, 1, 5, 3
        ]
    }
    get texCoord() {
        return [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, //
            1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, // front face
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, // left face
            1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, // right face
            0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, // bottom face
            0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0] // top face
    }
}

export class OBB{
    position
    size //half size
    orientation
    constructor(position, size, orientation){
        this.position = position || vec3.create()
        this.size = size || vec3.create()
        this.orientation = orientation || mat3.create()
    }
}


export class Plane {
    normal
    distance

    constructor(normal, distance) {

        this.normal = normal || vec3.create()
        this.distance = distance || 0.
    }

    planeEquation(point) {
        // ==0 point is on plane
        return vec3.dot(point, this.normal) - this.distance
    }
}

export class Frustum {
    
    left= new Plane()
    right= new Plane()
    top= new Plane()
    bottom= new Plane()
    near= new Plane()
    far= new Plane()
    planes = [this.left, this.right, this.top, this.bottom, this.near, this.far]

    constructor() {

    }

    // the Hartmann/Gribbs method of extracting the Frustum planes
    fromMatrix(vMatrix, pMatrix) {
        const vpMatrix = mat4.create()
        mat4.multiply(vpMatrix, pMatrix, vMatrix)
        const col1 = vec3.fromValues(vpMatrix[0], vpMatrix[1], vpMatrix[2])
        const col2 = vec3.fromValues(vpMatrix[4], vpMatrix[5], vpMatrix[6])
        const col3 = vec3.fromValues(vpMatrix[8], vpMatrix[9], vpMatrix[10])
        const col4 = vec3.fromValues(vpMatrix[12], vpMatrix[13], vpMatrix[14])
        vec3.add(this.left.normal, col4, col1)
        vec3.subtract(this.right.normal, col4, col1)
        vec3.add(this.bottom.normal, col4, col12)
        vec3.subtract(this.top.normal, col4, col2)
        vec3.add(this.near.normal, col4, col3)
        vec3.subtract(this.far.normal, col4, col3)

        this.left.distance = vpMatrix[15] + vpMatrix[3]
        this.right.distance = vpMatrix[15] - vpMatrix[3]
        this.bottom.distance = vpMatrix[15] + vpMatrix[7]
        this.top.distance = vpMatrix[15] + vpMatrix[7]
        this.near.distance = vpMatrix[15] + vpMatrix[11]
        this.far.distance = vpMatrix[15] + vpMatrix[11]

        for(let i = 0; i < 6; ++i) {
            let magnitude = 1 / vec3.length(this.planes[i].normal)
            vec3.mul(this.planes[i].normal, magnitude)
            this.planes[i].distance *= magnitude
        }
        
    }

    //use Cramer's Rule get planeEquation answer
    intersectPlanes() {

    }

    getCorners() {
        let corners = []

    }
}
