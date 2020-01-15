import { Ray, AABB, RayCast }  from './Geometry3D'
import {
    canvas
  } from 'libs/GlTools'
import { vec3, vec4, mat4 } from 'gl-matrix'

export default class Intersect {
    ray
    aabb
    constructor(){
        this.rayCast = new RayCast()
    }
    setRay(mouseX, mouseY, pMatrix, vMatrix, cameraPos){
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


    castRay(vertices, type = 'AABB'){
        let result = false
        if(type == 'AABB'){
            this.boundingVolume(vertices)
            result = this.rayCast.rayAABB(this.aabb, this.ray)
        }
        return result
    }


    boundingVolume(vertices, type = 'AABB'){
        let minX,maxX,minY,maxY,minZ,maxZ
        let sphereCenter,sphereRadius,boundMin,boundMax
        for(let i =0; i < vertices.length; i++){
            if (vertices[i][0] > maxX || !maxX) maxX = vertices[i][0]
            if(vertices[i][0]  < minX || !minX) minX = vertices[i][0]
            if (vertices[i][1] > maxY || !maxY) maxY = vertices[i][1]
            if(vertices[i][1]  < minY || !minY) minY = vertices[i][1]
            if (vertices[i][2] > maxZ || !maxZ) maxZ = vertices[i][2]
            if(vertices[i][2]  < minZ || !minZ) minZ = vertices[i][2]
        }
        sphereCenter = [minX + (maxX-minX)/2, minY + (maxY-minY)/2, minZ + (maxZ-minZ)/2]
        sphereRadius = Math.max((maxX-minX)/2,(maxY-minY)/2,(maxZ-minZ)/2)
        boundMin = vec3.fromValues(minX, minY, minZ)
        boundMax = vec3.fromValues(maxX, maxY, maxZ)

        if(type == 'sphere'){

        } else if(type == 'AABB'){
            let box = new AABB().fromMinMax(boundMin, boundMax)
            this.aabb = box
            return{
                position: box.position,
                index: box.index,
                texCoord: box.texCoord
            }
        }
    }


}