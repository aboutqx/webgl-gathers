export default class AABB{
    origin = []
    size = []//half size
    constructor(origin, size){
        this.origin = origin
        this.size = size
    }
    fromMinMax(min, max){
        return new AABB([(min[0]+max[0])*.5,(min[1]+max[1])*.5,(min[2]+max[2])*.5],
        [(max[0]-min[0])*.5,(max[1]-min[1])*.5,(max[2]-min[2])*.5]
        )
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
        return [0.0, 0.0, // bottom-left
         1.0, 1.0, // top-right
        1.0, 0.0, // bottom-right
         1.0, 1.0, // top-right
         0.0, 0.0, // bottom-left
         0.0, 1.0, // top-left
        // front face
         0.0, 0.0, // bottom-left
         1.0, 0.0, // bottom-right
        1.0, 1.0, // top-right
        1.0, 1.0, // top-right
         0.0, 1.0, // top-left
        - 0.0, 0.0, // bottom-left
        // left face
         1.0, 0.0, // top-right
        1.0, 1.0, // top-left
         0.0, 1.0, // bottom-left
         0.0, 1.0, // bottom-left
         0.0, 0.0, // bottom-right
         1.0, 0.0, // top-right
        // right face
        1.0, 0.0, // top-left
         0.0, 1.0, // bottom-right
        1.0, 1.0, // top-right
         0.0, 1.0, // bottom-right
        1.0, 0.0, // top-left
        0.0, 0.0, // bottom-left
        // bottom face
        0.0, 1.0, // top-right
        1.0, 1.0, // top-left
        1.0, 0.0, // bottom-left
        1.0, 0.0, // bottom-left
        0.0, 0.0, // bottom-right
        0.0, 1.0, // top-right
        // top face
         0.0, 1.0, // top-left
        1.0, 0.0, // bottom-right
         1.0, 1.0, // top-right
         1.0, 0.0, // bottom-right
         0.0, 1.0, // top-left
        0.0, 0.0 // bottom-left
        ]
    }
}