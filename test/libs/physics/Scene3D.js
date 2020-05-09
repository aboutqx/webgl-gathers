import OctreeNode from './Octree' 

export class Scene3D {
    meshList = []
    octree = new OctreeNode()
    constructor() {

    }

    addMesh(mMesh) {
        if(this.meshList.includes(mMesh)) return
        this.meshList.push(mMesh)
    }

    removeMesh(mMesh) {
        this.meshList = this.meshList.filter((v) => v !== mMesh)
    }

    constructBVH(type = 'octree') {
        if(type == 'octree') {

        }
    }

    get drawList() {

    }
}