import { vec3, vec4, mat4, mat3 } from 'gl-matrix'
import Mesh from 'libs/Mesh'
import { gl } from 'libs/GlTools'


function transformVertices(vertices, mMatrix) {
    let t1
    const result = []
    let t = vec4.create()
    for (let i = 0; i < vertices.length; i++) {
        t1 = vec4.fromPoint(vertices[i])
        vec4.transformMat4(t, t1, mMatrix)
        result.push([t[0], t[1], t[2]])
    }
    return result
}

export class Point {
    constructor(x, y ,z) {
        return vec3.fromValues(x, y, z)
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

class BoundingVolume {
    constructor() {

    }

    static getMinMax(vertices) {
        const min = vec3.create()
        const max = vec3.create()
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i][0] > max[0] || !max[0]) max[0] = vertices[i][0]
            if (vertices[i][0] < min[0] || !min[0]) min[0] = vertices[i][0]
            if (vertices[i][1] > max[1] || !max[1]) max[1] = vertices[i][1]
            if (vertices[i][1] < min[1] || !min[1]) min[1] = vertices[i][1]
            if (vertices[i][2] > max[2] || !max[2]) max[2] = vertices[i][2]
            if (vertices[i][2] < min[2] || !min[2]) min[2] = vertices[i][2]
        }
        return { min, max }
    }

    getFrame() {
        const wireFrame = new Mesh(gl.LINE_STRIP, `${this.name}-wireframe`)
        wireFrame.bufferFlattenData(this.position, 'position', 3)
        wireFrame.bufferFlattenData(this.texCoord, 'texCoord', 2)
        wireFrame.bufferIndex(this.index)
        return wireFrame
    }
}

export class AABB extends BoundingVolume{
    origin
    size //half size
    constructor(origin, size) {
        super()
        this.origin = origin || vec3.create()
        this.size = size || vec3.create()
        this.name = 'aabb'
    }

    static fromVertices(vertices, mMatrix) {
        if(mMatrix) vertices = transformVertices(vertices, mMatrix)
        const { min, max } = this.getMinMax(vertices)
        return this.fromMinMax(min, max)
    }

    static fromMinMax(min, max) {
        return new AABB([(min[0] + max[0]) * .5, (min[1] + max[1]) * .5, (min[2] + max[2]) * .5],
            [(max[0] - min[0]) * .5, (max[1] - min[1]) * .5, (max[2] - min[2]) * .5]
        )
    }

    get min() {
        let p1, p2
        p1 = vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.min(t, p1, p2)
        return t
    }

    get max() {
        let p1, p2
        p1 = vec3.create()
        p2 = vec3.create()
        p1 = vec3.add(p1, this.origin, this.size)
        p2 = vec3.subtract(p2, this.origin, this.size)
        let t = vec3.create()
        vec3.max(t, p1, p2)
        return t
    }

    get position() {
        const position = []
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

export class OBB extends BoundingVolume{
    position
    size //half size
    orientation
    constructor(position, size, orientation){
        super()
        this.position = position || vec3.create()
        this.size = size || vec3.create()
        this.orientation = orientation || mat3.create()
    }
}

export class Sphere extends BoundingVolume{
    origin
    radius
    constructor(origin, radius) {
        super()
        this.origin = origin || vec3.create()
        this.radius = radius || 1.
    }

    static fromVertices(vertices, mMatrix) {
        if(mMatrix) vertices = transformVertices(vertices, mMatrix)
        const { min, max } = this.getMinMax(vertices)
        return this.fromMinMax(min, max)
    }

    static fromMinMax(min, max) {
        const center = [min[0] + (max[0] - min[0]) / 2, min[1] + (max[1] - min[1]) / 2, min[2] + (max[2] - min[2]) / 2]
        const radius = Math.max((max[0] - min[0]) / 2, (max[1] - min[1]) / 2, (max[2] - min[2]) / 2)
        return new Sphere(center, radius)
    }
}

export class Plane {
    normal
    distance // distance from origin to plane

    constructor(normal, distance) {

        this.normal = normal || vec3.create()
        this.distance = distance || 0.
    }

    planeEquation(point) {
        // == 0 point is on plane
        const side = vec3.dot(point, this.normal) - this.distance
        return side
    }
}

export class Frustum {
    
    left= new Plane()
    right= new Plane()
    top= new Plane()
    bottom= new Plane()
    near= new Plane()
    far= new Plane()
    planes = [this.left, this.right, this.bottom, this.top, this.near, this.far]

    constructor() {

    }

    // the Hartmann/Gribbs method of extracting the Frustum planes
    // http://www.cs.otago.ac.nz/postgrads/alexis/planeExtraction.pdf
    fromMatrix(vMatrix, pMatrix) {
        const vpMatrix = mat4.create()
        mat4.multiply(vpMatrix, pMatrix, vMatrix)
        const row1 = vec3.fromValues(vpMatrix[0], vpMatrix[4], vpMatrix[8]) //12
        const row2 = vec3.fromValues(vpMatrix[1], vpMatrix[5], vpMatrix[9]) //13
        const row3 = vec3.fromValues(vpMatrix[2], vpMatrix[6], vpMatrix[10]) //14
        const row4 = vec3.fromValues(vpMatrix[3], vpMatrix[7], vpMatrix[11]) //15
        vec3.add(this.left.normal, row4, row1)
        vec3.subtract(this.right.normal, row4, row1)
        vec3.add(this.bottom.normal, row4, row2)
        vec3.subtract(this.top.normal, row4, row2)
        vec3.add(this.near.normal, row4, row3)
        vec3.subtract(this.far.normal, row4, row3)

        this.left.distance = vpMatrix[15] + vpMatrix[12]
        this.right.distance = vpMatrix[15] - vpMatrix[12]
        this.bottom.distance = vpMatrix[15] + vpMatrix[13]
        this.top.distance = vpMatrix[15] - vpMatrix[13]
        this.near.distance = vpMatrix[15] + vpMatrix[14]
        this.far.distance = vpMatrix[15] - vpMatrix[14]

        for(let i = 0; i < 6; ++i) {
            let magnitude = 1 / vec3.length(this.planes[i].normal)
            vec3.scale(this.planes[i].normal, this.planes[i].normal, magnitude)
            this.planes[i].distance *= magnitude
        }
        return this
    }

    //use Cramer's Rule get planeEquation answer
    intersectPlanes() {

    }

    getCorners() {
        let corners = []

    }
}
