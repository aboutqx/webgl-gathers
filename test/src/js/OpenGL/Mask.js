import Pipeline from '../PipeLine'
import {
  gl,
  GlTools
} from 'libs/GlTools'
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'
import outlineFs from 'shaders/maskOutline.frag'
import { mat4, vec4 } from 'gl-matrix'
import { Torus } from '../Torus'
import Intersect from 'physics/Intersect'
import Geom from 'libs/Geom'

function transformPosition(vertices, mMatrix){
  let t1
  let result = []
  for(let i=0; i < vertices.length; i++){
    t1 = vec4.fromValues(vertices[i][0], vertices[i][1], vertices[i][2], 1)
    let t = vec4.create()
    vec4.transformMat4(t, t1, mMatrix)
    let tmp = Array(...t).splice(0,3,1)
    result.push(tmp)
  }
  return result
}
export default class Mask extends Pipeline {
  constructor() {
    super()
  }
  init(){
    this.outlinePrg = this.compile(vs, outlineFs)
    this.prg = this.compile(vs, fs)
    
    gl.cullFace(gl.BACK)

    this._drawCube = this._drawCube.bind(this)
    this._drawTorus = this._drawTorus.bind(this)
    this.intersect = new Intersect()
  }
  attrib() {
 
    this.cube = Geom.cube(1)
    this.torus = Torus(64, 64, .1, .4)
/* bounding mesh
    let torusAABB = this.intersect.boundingVolume(pos)
    this.torusFrame = new Mesh()
    this.torusFrame.bufferVertex(torusAABB.position)
    this.torusFrame.bufferTexCoord(torusAABB.texCoord)
    this.torusFrame.bufferIndex(torusAABB.index)

    let cubeAABB = this.intersect.boundingVolume(spliceCube(CubeData))
    this.cubeFrame = new Mesh()
    this.cubeFrame.bufferVertex(cubeAABB.position)
    this.cubeFrame.bufferTexCoord(cubeAABB.texCoord)
    this.cubeFrame.bufferIndex(cubeAABB.index)
*/
    this.texture = getAssets.splash
    this.texture.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  _setGUI() {
    this.addGUIParams({
      lod: 1.,
      LINEAR_MIPMAP_LINEAR: false,
      NEAREST_MIPMAP_NEAREST: true
    })

    let folder = this.gui.addFolder('tetxureLod lod param')
    folder.add(this.params, 'lod', 1., Math.log2(512)).step(1.)
    folder.open()

    let folder1 = this.gui.addFolder('TEXTURE_MIN_FILTER')
    folder1.add(this.params, 'LINEAR_MIPMAP_LINEAR').listen().onChange(() => {
      this.setChecked('LINEAR_MIPMAP_LINEAR')
    })
    folder1.add(this.params, 'NEAREST_MIPMAP_NEAREST').listen().onChange(() => {
      this.setChecked('NEAREST_MIPMAP_NEAREST')
    })
    folder1.open()
  }
  setChecked(val){
    
    this.texture.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[val]);
    this.params.LINEAR_MIPMAP_LINEAR = false
    this.params.NEAREST_MIPMAP_NEAREST = false
    this.params[val] = true
    
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

    this.camera.setProj(60, .1, 100)
  }
  uniform() {

    let pMatrix = mat4.clone(this.camera.projMatrix)
    let vMatrix = mat4.clone(this.camera.viewMatrix)
    this.intersect.setRay(this.mousePos.x, this.mousePos.y, pMatrix, vMatrix, this.camera.cameraPos)

  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
    gl.stencilMask(0x00) //写入0

    let mMatrix = mat4.identity(mat4.create())
    // translate 之后鼠标放在cube水平中心点很远的地方也能触发outline，这是个bug,原因是boundingbox计算有问题，初始minX，maxX这些值为0，0实际上已经是一个值了
    // 应该换成循环的第一个值为min和max，而不是0
    mat4.translate(mMatrix, mMatrix, [-2.5, 0, 0])

    if(this.intersect.castRay(transformPosition(this.cube.vertices, mMatrix))){
      this.renderOutline(mMatrix, this._drawCube)
    } else this.renderDefault(mMatrix, this._drawCube)

    mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [2., 0, 0])
    if(this.intersect.castRay(transformPosition(this.torus.vertices, mMatrix))){
      this.renderOutline(mMatrix, this._drawTorus)
    } else this.renderDefault(mMatrix, this._drawTorus)

/*draw boundingVolume
    mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [1.5, 0, 0])
    this.prg.use()
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      texture: 0,
      lod: this.params.lod
    })
    this.torusFrame.bind(this.prg, ['position', 'texCoord'])
    this.torusFrame.draw(3)

    mMatrix = mat4.identity(mat4.create())
    mat4.scale(mMatrix, mMatrix, [.6, .6, .6])
    mat4.translate(mMatrix, mMatrix, [-2.05, 0, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      texture: 0,
      lod: this.params.lod
    })
    this.cubeFrame.bind(this.prg, ['position', 'texCoord'])
    this.cubeFrame.draw(3)
*/
  }
  renderDefault(mMatrix,draw){
    this.prg.use()
    this.prg.style({
      texture: this.texture,
      uModelMatrix: mMatrix,
      lod: this.params.lod
    })
    draw()
  }
  renderOutline(mMatrix,draw){
    gl.stencilFunc(gl.ALWAYS, 1, 0xff)
    gl.stencilMask(0xff) //写入1
    this.renderDefault(mMatrix, draw)

    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);//不等于1的才能通过测试
    gl.stencilMask(0x00); //写入0
    const scale = 1.1;
    mat4.scale(mMatrix, mMatrix, [scale, scale, scale])

    this.outlinePrg.use()
    this.outlinePrg.style({
      uModelMatrix: mMatrix,
    })
    draw()
  }
  _drawCube(){
    this.cube.bind()
    GlTools.draw(this.cube, true)
  }
  _drawTorus(){
    this.torus.bind()
    GlTools.draw(this.torus, true)
  }

}
