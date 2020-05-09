class OctreeNode {
    aabb
    isLeaf // leaf only contains one mesh or is empty
    constructor() {

    }
}

export default class Octree {
    meshList = []
    constructor() {
        
    }

    splitTree(node, depth) {
        if(depth-- <= 0) return

    }
}