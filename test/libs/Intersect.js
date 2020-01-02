import AABB  from 'libs/Geometry3D'
export default class Intersect {
    _ray
    constructor(mouseX, mouseY){
        this._createRay()
    }
    _createRay(){

    }

    _intersect(object){

    }


    boundingVolume(position, type = 'AABB'){
        let minX,maxX,minY,maxY,minZ,maxZ
        minX=maxX=minY=maxY=minZ=maxZ=0
        let sphereCenter,sphereRadius,boundMin,boundMax
        if(!(position.length%3 == 0)) console.error('position 不是3个一组')
        for(let i =0; i <= position.length/3; i++){
            if (position[i*3] > maxX) maxX = position[i*3]
            if(position[i*3]  < minX) minX = position[i*3]
            if (position[i*3+1] > maxY) maxY = position[i*3+1]
            if(position[i*3+1]  < minY) minY = position[i*3+1]
            if (position[i*3+2] > maxZ) maxZ = position[i*3+2]
            if(position[i*3+2]  < minZ) minZ = position[i*3+2]
        }
        sphereCenter = [minX + (maxX-minX)/2, minY + (maxY-minY)/2, minZ + (maxZ-minZ)/2]
        sphereRadius = Math.max((maxX-minX)/2,(maxY-minY)/2,(maxZ-minZ)/2)
        boundMin = [minX, minY, minZ]
        boundMax = [maxX, maxY, maxZ]
        if(type == 'sphere'){

        } else if(type == 'AABB'){
            let box = new AABB().fromMinMax(boundMin, boundMax)
            console.log(boundMin,boundMax,box.origin,box.size)
            return{
                position: box.position,
                index: box.index,
                texCoord: box.texCoord
            }
        }
    }

    get ray() {
        return this._ray
    }

    set ray(value){
        this._ray = value
    }

}