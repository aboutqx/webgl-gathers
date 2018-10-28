import { mat4 } from 'gl-matrix'
// cameraFront = -(cameraPos - camraTarget)
class Camrea {
  cameraPos
  up
  cameraFront = [0, 0, -1]
  constructor (position = [0,0,0], up = (0, 1, 0)) {
    this.cameraPos = position
    this.up = up
  }

  get viewMatrix (){
    return mat4.lookAt(mat4.create(), this.cameraPos, this.cameraPos + this.cameraFront, this.up)
  }

  _updateMatrix (){

  }
}
