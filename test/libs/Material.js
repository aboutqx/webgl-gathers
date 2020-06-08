// material 应该在shader编译前，需要注入define来定义具有相关material map
//这里我们将shader compile相关任务放在shader.js这里
import ModifyShader from 'libs/shaders/ModifyShader'
export default class Material {

    constructor(vs, fs, uniforms = {}, defines = {}, doubleSided = false) {
        this.doubleSided = doubleSided
        const cache = ModifyShader.get(vs, fs, defines)
        this._shader = cache.glShader;
        this._vs = cache.vs
        this._fs = cache.fs
        this.uniforms = Object.assign({}, uniforms);
    }


    update() {
        this._shader.bind();
        this._shader.uniform(this.uniforms);
    }

    get shader() {
        return this._shader
    }

    get vs() {
        return this._vs
    }

    get fs() {
        return this._fs
    }

}
